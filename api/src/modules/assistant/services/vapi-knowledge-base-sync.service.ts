import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssistantConfiguration } from '../entities/assistant-configuration.entity';
import { VapiKbFile } from '../entities/vapi-kb-file.entity';
import { VapiQueryTool } from '../entities/vapi-query-tool.entity';
import { KnowledgeBaseGeneratorService } from './knowledge-base-generator.service';
import { AwsS3StorageService } from './aws-s3-storage.service';
import axios from 'axios';
import FormData = require('form-data');
import * as fs from 'fs';

@Injectable()
export class VapiKnowledgeBaseSyncService {
  private readonly logger = new Logger(VapiKnowledgeBaseSyncService.name);
  private readonly VAPI_API_URL = 'https://api.vapi.ai';
  private readonly VAPI_API_KEY = process.env.VAPI_API_KEY;

  constructor(
    @InjectRepository(AssistantConfiguration)
    private assistantConfigRepo: Repository<AssistantConfiguration>,
    @InjectRepository(VapiKbFile)
    private vapiKbFileRepo: Repository<VapiKbFile>,
    @InjectRepository(VapiQueryTool)
    private vapiQueryToolRepo: Repository<VapiQueryTool>,
    private kbGenerator: KnowledgeBaseGeneratorService,
    private s3Storage: AwsS3StorageService,
  ) {
    if (!this.VAPI_API_KEY) {
      this.logger.warn('⚠️ VAPI_API_KEY no está configurada');
    }
  }

  /**
   * Sincroniza el knowledge base de un assistant con Vapi
   * Estrategia: Borrar archivos antiguos de Vapi y crear nuevos
   * @returns Array de fileIds subidos exitosamente a Vapi (para asociar al assistant)
   */
  async syncKnowledgeBase(assistantConfigId: string): Promise<string[]> {
    const config = await this.assistantConfigRepo.findOne({
      where: { id: assistantConfigId },
      relations: ['business', 'business.assistant'],
    });
    
    // Log detallado para debugging
    this.logger.log(`🔍 Config encontrado: ${config ? 'Sí' : 'No'}`);
    if (config) {
      this.logger.log(`🔍 Business ID: ${config.business_id}, Business object: ${config.business ? 'Sí' : 'No'}`);
      if (config.business) {
        this.logger.log(`🔍 Business assistant_id: ${config.business.assistant_id}`);
        this.logger.log(`🔍 Business assistant object: ${config.business.assistant ? 'Sí' : 'No'}`);
        if (config.business.assistant) {
          this.logger.log(`🔍 Assistant vapi_assistant_id: ${config.business.assistant.vapi_assistant_id}`);
        }
      }
    }

    if (!config) {
      throw new BadRequestException(`Assistant configuration ${assistantConfigId} not found`);
    }

    if (!this.VAPI_API_KEY) {
      throw new BadRequestException('VAPI_API_KEY no está configurada');
    }

    const tempFilePaths: string[] = [];

    try {
      // Actualizar estado
      config.vapiSyncStatus = 'syncing';
      config.vapiLastError = null;
      await this.assistantConfigRepo.save(config);

      this.logger.log(`🔄 Iniciando sincronización de KB para assistant config ${assistantConfigId}`);

      // 1. Obtener archivos antiguos de Vapi para eliminarlos después
      const oldFiles = await this.vapiKbFileRepo.find({
        where: { assistantConfigurationId: assistantConfigId },
      });

      // 2. Generar archivos temporales
      this.logger.log(`📝 Generando archivos temporales para business ${config.business_id}`);
      const files = await this.kbGenerator.generateAllFiles(config, config.business_id);

      if (files.size === 0) {
        this.logger.warn('⚠️ No hay archivos para sincronizar');
        config.vapiSyncStatus = 'idle';
        await this.assistantConfigRepo.save(config);
        return [];
      }

      // 3. Sincronizar archivos en paralelo: Vapi y AWS S3 (siempre habilitado)
      const newFileIds: string[] = [];
      const newKbFiles: VapiKbFile[] = [];

      // Sincronizar en paralelo para mejor rendimiento
      const syncPromises = [];

      for (const [filename, filePath] of files.entries()) {
        tempFilePaths.push(filePath); // Trackear para limpiar después

        const fileSize = fs.statSync(filePath).size;
        const mimeType = filename.endsWith('.json') ? 'application/json' : 'text/markdown';

        // Crear promise para sincronizar este archivo
        const syncPromise = (async () => {
          let vapiFileId: string | null = null;
          let s3Key: string | null = null;
          let vapiError: Error | null = null;
          let s3Error: Error | null = null;

          // Subir a Vapi (siempre)
          try {
            vapiFileId = await this.uploadFileToVapi(filename, filePath);
            this.logger.log(`✅ Archivo subido a Vapi: ${filename} (ID: ${vapiFileId})`);
          } catch (error) {
            vapiError = error as Error;
            this.logger.error(`❌ Error subiendo archivo ${filename} a Vapi:`, error);
            // No lanzamos error aquí, continuamos con Drive
          }

          // Subir/actualizar en AWS S3 (siempre habilitado)
          try {
            s3Key = await this.s3Storage.uploadFileFromPath(
              config.business_id,
              filename,
              filePath,
              mimeType
            );
            this.logger.log(`✅ Archivo sincronizado en S3: ${filename} (Key: ${s3Key})`);
          } catch (error) {
            s3Error = error as Error;
            this.logger.warn(`⚠️ Error sincronizando archivo ${filename} en S3:`, error);
            // No lanzamos error aquí, continuamos con Vapi
          }

          // Si ambos fallan, lanzar error
          if (!vapiFileId && !s3Key) {
            throw new Error(
              `No se pudo subir ${filename} a ningún servicio. Vapi: ${vapiError?.message}, S3: ${s3Error?.message}`
            );
          }

          // Si Vapi falló pero S3 funcionó, registrar warning pero continuar
          if (!vapiFileId && s3Key) {
            this.logger.warn(
              `⚠️ Archivo ${filename} guardado en S3 pero falló en Vapi. Se reintentará en próximo sync.`
            );
          }

          // Guardar referencia en BD
          const kbFile = this.vapiKbFileRepo.create({
            assistantConfigurationId: config.id,
            vapiFileId: vapiFileId || '', // Puede estar vacío si falló Vapi
            name: filename,
            bytes: fileSize,
            configVersion: config.version,
            s3Key: s3Key || null,
          });

          return { kbFile, vapiFileId };
        })();

        syncPromises.push(syncPromise);
      }

      // Esperar a que todos los archivos se sincronicen
      const results = await Promise.allSettled(syncPromises);

      // Procesar resultados
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { kbFile, vapiFileId } = result.value;
          newKbFiles.push(kbFile);
          if (vapiFileId) {
            newFileIds.push(vapiFileId);
          }
        } else {
          this.logger.error(`❌ Error en sincronización de archivo:`, result.reason);
          // Si es crítico, lanzar error. Si no, continuar con los demás archivos
          throw result.reason;
        }
      }

      // 4. Guardar nuevos archivos en BD
      await this.vapiKbFileRepo.save(newKbFiles);

      // 5. Eliminar archivos antiguos de Vapi y BD
      if (oldFiles.length > 0) {
        this.logger.log(`🗑️ Eliminando ${oldFiles.length} archivo(s) antiguo(s) de Vapi`);
        for (const oldFile of oldFiles) {
          try {
            await this.deleteFileFromVapi(oldFile.vapiFileId);
            await this.vapiKbFileRepo.remove(oldFile);
            this.logger.log(`✅ Archivo antiguo eliminado: ${oldFile.name} (ID: ${oldFile.vapiFileId})`);
          } catch (error) {
            this.logger.warn(`⚠️ No se pudo eliminar archivo antiguo ${oldFile.vapiFileId}:`, error);
            // Continuar aunque falle la eliminación
          }
        }
      }

      // 6. ✅ Ya NO se crean Query Tools vía /tool
      // Los archivos se asociarán directamente al assistant cuando se cree/actualice
      this.logger.log(`✅ KB sincronizado. ${newFileIds.length} archivo(s) listo(s) para asociar al assistant`);

      // 7. Limpiar archivos temporales del sistema
      await this.kbGenerator.cleanupTempFiles(tempFilePaths);

      // 8. Actualizar estado final
      config.vapiSyncStatus = 'synced';
      config.vapiLastSyncedAt = new Date();
      config.vapiLastError = null;
      await this.assistantConfigRepo.save(config);

      this.logger.log(`✅ Knowledge Base sincronizado exitosamente. ${newFileIds.length} archivo(s) listo(s) para asociar al assistant`);
      return newFileIds;
    } catch (error) {
      this.logger.error(`❌ Error sincronizando knowledge base: ${error.message}`, error.stack);
      
      // Limpiar archivos temporales incluso en caso de error
      await this.kbGenerator.cleanupTempFiles(tempFilePaths);

      config.vapiSyncStatus = 'error';
      config.vapiLastError = error.message;
      await this.assistantConfigRepo.save(config);

      throw error;
    }
  }

  /**
   * Sube un archivo a Vapi Files API desde una ruta de archivo temporal
   */
  private async uploadFileToVapi(filename: string, filePath: string): Promise<string> {
    // ✅ Validación de seguridad: Limpiar nombre de archivo para evitar caracteres problemáticos
    // Reemplazar caracteres no alfanuméricos (excepto puntos y guiones) con guiones bajos
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (cleanFilename !== filename) {
      this.logger.warn(`⚠️ Nombre de archivo limpiado: "${filename}" → "${cleanFilename}"`);
    }
    
    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    
    form.append('file', fileStream, {
      filename: cleanFilename,
      contentType: cleanFilename.endsWith('.json') ? 'application/json' : 'text/markdown',
    });

    const response = await axios.post(`${this.VAPI_API_URL}/file`, form, {
      headers: {
        Authorization: `Bearer ${this.VAPI_API_KEY}`,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data.id;
  }

  /**
   * Elimina un archivo de Vapi
   */
  private async deleteFileFromVapi(vapiFileId: string): Promise<void> {
    await axios.delete(`${this.VAPI_API_URL}/file/${vapiFileId}`, {
      headers: {
        Authorization: `Bearer ${this.VAPI_API_KEY}`,
      },
    });
  }

  /**
   * @deprecated Ya NO se crean Query Tools vía /tool endpoint
   * Los Query Tools son "predefinidos" y solo se referencian en el assistant como { type: "query" }
   * Los archivos se pasan directamente en el assistant: { files: [{ id: "fileId" }] }
   * Este método se mantiene solo para referencia histórica y ya no hace nada
   */
  private async upsertQueryTool(
    assistantConfigId: string,
    businessId: string,
    fileIds: string[]
  ): Promise<string | null> {
    this.logger.warn(`⚠️ upsertQueryTool llamado pero ya NO se crean Query Tools vía /tool endpoint`);
    this.logger.warn(`⚠️ Los Query Tools se referencian directamente en el assistant como { type: "query" }`);
    return null;
  }

  /**
   * @deprecated Ya NO se asocian Query Tools a assistants
   * Los Query Tools se referencian por type en el payload del assistant: { type: 'query' }
   * Los archivos se asocian directamente al assistant: { files: [{ id: '...' }] }
   * Este método se mantiene solo para referencia histórica
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async attachQueryToolToAssistant(
    vapiAssistantId: string,
    queryToolId: string,
    fileIds: string[]
  ): Promise<void> {
    try {
      // Obtener el assistant actual
      const assistantResponse = await axios.get(
        `${this.VAPI_API_URL}/assistant/${vapiAssistantId}`,
        {
          headers: {
            Authorization: `Bearer ${this.VAPI_API_KEY}`,
          },
        }
      );

      const assistant = assistantResponse.data;
      // Según la API oficial de Vapi, las tools están en 'tools', no en 'model.tools'
      const currentTools = assistant.tools || [];
      
      this.logger.log(`🔍 Assistant actual tiene ${currentTools.length} tools asociadas`);
      this.logger.log(`🔍 Tools actuales:`, currentTools.map((t: any) => ({ id: t.id, type: t.type, name: t.name })));
      
      // ✅ NORMALIZAR tools existentes (Vapi no permite mezclar strings y objetos)
      // Las tools pueden venir como strings o como objetos completos
      const normalizedTools = currentTools.map((tool: any) => {
        if (typeof tool === 'string') {
          // Si es un string, convertirlo a objeto
          // Intentar inferir el tipo basado en el nombre o usar 'function' por defecto
          // Para Query Tools, el tipo será 'query', pero si no lo sabemos, usamos 'function'
          return { id: tool, type: 'function' }; // Por defecto 'function', se actualizará si es necesario
        }
        // Si ya es un objeto, asegurarse de que tenga 'type'
        return {
          id: tool.id,
          type: tool.type || 'function', // Si no tiene type, usar 'function' por defecto
          ...(tool.name && { name: tool.name }),
        };
      });

      // Verificar si el Query Tool ya está asociado
      const isAlreadyAttached = normalizedTools.some((tool: any) => {
        return tool.id === queryToolId;
      });

      if (!isAlreadyAttached) {
        // Formato correcto según la API oficial de Vapi
        // Referencia: https://docs.vapi.ai/knowledge-base
        // Estructura: { "tools": [{ "id": "toolId", "type": "query" }] }
        const updatedTools = [...normalizedTools];
        
        // Agregar el Query Tool con el formato correcto
        updatedTools.push({ id: queryToolId, type: 'query' });

        // Actualizar el assistant con las tools Y los archivos
        // Vapi espera:
        // - tools: array de objetos { id, type }
        // - files: array de objetos { id } (los archivos se asocian al assistant, no al tool)
        const updatePayload: any = {
          tools: updatedTools,
        };

        // ✅ Incluir los archivos en el payload del assistant
        if (fileIds && fileIds.length > 0) {
          updatePayload.files = fileIds.map((fileId) => ({ id: fileId }));
          this.logger.log(`📎 Incluyendo ${fileIds.length} archivo(s) en el assistant`);
        }

        this.logger.log(`📤 Actualizando assistant con ${updatedTools.length} tools (incluyendo Query Tool ${queryToolId})`);

        await axios.patch(
          `${this.VAPI_API_URL}/assistant/${vapiAssistantId}`,
          updatePayload,
          {
            headers: {
              Authorization: `Bearer ${this.VAPI_API_KEY}`,
            },
          }
        );

        // Verificar que se actualizó correctamente
        const verifyResponse = await axios.get(
          `${this.VAPI_API_URL}/assistant/${vapiAssistantId}`,
          {
            headers: {
              Authorization: `Bearer ${this.VAPI_API_KEY}`,
            },
          }
        );

        const verifiedTools = verifyResponse.data.tools || [];
        const isNowAttached = verifiedTools.some((tool: any) => {
          const toolId = typeof tool === 'string' ? tool : tool.id;
          return toolId === queryToolId;
        });

        if (isNowAttached) {
          this.logger.log(`✅ Query Tool ${queryToolId} correctamente asociado al assistant ${vapiAssistantId}`);
          this.logger.log(`✅ Los archivos del knowledge base ahora están seleccionados en el agente`);
        } else {
          this.logger.warn(`⚠️ Query Tool ${queryToolId} no se encontró después de actualizar. Verificar manualmente.`);
        }
      } else {
        this.logger.log(`ℹ️ Query Tool ${queryToolId} ya estaba asociado al assistant ${vapiAssistantId}`);
        this.logger.log(`✅ Los archivos del knowledge base ya están seleccionados en el agente`);
      }
    } catch (error: any) {
      this.logger.error(`❌ Error asociando Query Tool al assistant:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }
}

