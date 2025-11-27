import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssistantConfiguration } from '../entities/assistant-configuration.entity';
import { VapiKbFile } from '../entities/vapi-kb-file.entity';
import { VapiQueryTool } from '../entities/vapi-query-tool.entity';
import { KnowledgeBaseGeneratorService } from './knowledge-base-generator.service';
import { AwsS3StorageService } from './aws-s3-storage.service';
import { patchAssistantWithToolsAndFiles } from '../../voice/voice-assistant-patcher';
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

      // 4. Guardar nuevos archivos en BD (incluso si vapiFileId está vacío para reintento)
      await this.vapiKbFileRepo.save(newKbFiles);

      // ✅ Filtrar solo fileIds válidos (no vacíos) para asociar
      const validFileIdsToAttach = newFileIds.filter(id => id && id.trim().length > 0);

      // === Asociar archivos al assistant si existe un assistant asociado al business ===
      // ✅ CRÍTICO: Solo intentar asociar si hay fileIds válidos
      if (config.business?.assistant?.vapi_assistant_id && validFileIdsToAttach.length > 0) {
        const assistantId = config.business.assistant.vapi_assistant_id;
        this.logger.log(`[VAPI] Intentando asociar ${validFileIdsToAttach.length} archivo(s) al assistant ${assistantId}`);

        // Obtener business name para nombrar el Query Tool consistentemente
        const businessName = config.business?.name || 'Business';
        
        const patchResult = await patchAssistantWithToolsAndFiles({
          vapiApiKey: this.VAPI_API_KEY!,
          assistantId,
          toolIds: [], // Si tenés toolIds, ponelos aquí (ej: [queryToolId])
          fileIds: validFileIdsToAttach, // Solo fileIds válidos
          businessName: businessName, // Pasar business name para nombrar el Query Tool
          logger: this.logger,
          // NO pasar axiosInstance: dejar que el helper cree el cliente con baseURL correcto
          maxRetries: 2,
        });

        // ✅ Guardar schemaType detectado en la DB para futuras syncs
        if (patchResult.schemaType) {
          config.vapiSchemaType = patchResult.schemaType;
        }

        if (!patchResult.success) {
          // Si la respuesta indica que el schema no soporta estas propiedades,
          // marcamos para revisión manual (no lanzamos excepción inmediatamente).
          if (patchResult.reason === 'unsupported_schema' || patchResult.reason === 'validation_rejected') {
            config.vapiSyncStatus = 'needs_manual_review';
            config.vapiLastError = JSON.stringify(patchResult.responseData);
            await this.assistantConfigRepo.save(config);
            this.logger.warn('[VAPI] No se pudo asociar archivos programáticamente (schema no compatible). Marcado para revisión manual.');
          } else {
            // Error transitorio o fallo severo: marcar error y lanzar para reintento
            config.vapiSyncStatus = 'error';
            config.vapiLastError = JSON.stringify(patchResult.responseData);
            await this.assistantConfigRepo.save(config);
            this.logger.error('[VAPI] Falló la asociación de archivos al assistant:', patchResult);
            throw new Error('Failed to attach KB files to assistant: ' + JSON.stringify(patchResult));
          }
        } else {
          this.logger.log('[VAPI] Archivos asociados correctamente al assistant:', assistantId);
          // ✅ Verificación exitosa: los archivos están asociados, ahora podemos eliminar los antiguos
          // El helper ya hizo la verificación POST-PATCH, así que es seguro eliminar
          config.vapiSyncStatus = 'synced';
          config.vapiLastSyncedAt = new Date();
          config.vapiLastError = null;
          await this.assistantConfigRepo.save(config);
        }
      } else if (config.business?.assistant?.vapi_assistant_id && validFileIdsToAttach.length === 0) {
        // ✅ Si hay assistant pero no hay fileIds válidos para asociar, marcar warning
        this.logger.warn('[VAPI] Assistant existe pero no hay fileIds válidos para asociar (algunos archivos fallaron al subir)');
        // Mantener estado 'syncing' para que se reintente en próximo sync
      }

      // 5. ✅ CRÍTICO: Eliminar archivos antiguos SOLO si los nuevos están asociados exitosamente
      // Si el PATCH falló o quedó en needs_manual_review, NO eliminar archivos antiguos
      if (oldFiles.length > 0 && config.vapiSyncStatus === 'synced') {
        this.logger.log(`🗑️ Eliminando ${oldFiles.length} archivo(s) antiguo(s) de Vapi (nuevos archivos verificados y asociados)`);
        for (const oldFile of oldFiles) {
          try {
            // Solo eliminar si tiene vapiFileId válido
            if (oldFile.vapiFileId && oldFile.vapiFileId.trim().length > 0) {
              await this.deleteFileFromVapi(oldFile.vapiFileId);
            }
            await this.vapiKbFileRepo.remove(oldFile);
            this.logger.log(`✅ Archivo antiguo eliminado: ${oldFile.name} (ID: ${oldFile.vapiFileId})`);
          } catch (error) {
            this.logger.warn(`⚠️ No se pudo eliminar archivo antiguo ${oldFile.vapiFileId}:`, error);
            // Continuar aunque falle la eliminación
          }
        }
      } else if (oldFiles.length > 0) {
        this.logger.warn(`⚠️ NO se eliminan ${oldFiles.length} archivo(s) antiguo(s) porque el sync no está en estado 'synced' (estado actual: ${config.vapiSyncStatus})`);
      }

      // 6. ✅ Ya NO se crean Query Tools vía /tool
      // Los archivos se asociarán directamente al assistant cuando se cree/actualice
      this.logger.log(`✅ KB sincronizado. ${newFileIds.length} archivo(s) listo(s) para asociar al assistant`);

      // 7. Limpiar archivos temporales del sistema
      await this.kbGenerator.cleanupTempFiles(tempFilePaths);

      // 8. Actualizar estado final (solo si no se marcó como 'needs_manual_review' o 'error' previamente)
      const currentStatus = config.vapiSyncStatus;
      if (currentStatus !== 'needs_manual_review' && currentStatus !== 'error' && currentStatus !== 'synced') {
        config.vapiSyncStatus = 'synced';
        config.vapiLastSyncedAt = new Date();
        config.vapiLastError = null;
        await this.assistantConfigRepo.save(config);
      }

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
   * @deprecated Ya NO se asocian Query Tools a assistants directamente
   * Los Query Tools se referencian por type en el payload del assistant: { type: 'query' }
   * Los archivos se asocian directamente al assistant: { files: [{ id: '...' }] }
   * 
   * Este método mantiene compatibilidad automática usando el helper patchAssistantWithToolsAndFiles
   * con model.toolIds/knowledgeBase.fileIds.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async attachQueryToolToAssistant(
    vapiAssistantId: string,
    queryToolId: string,
    fileIds: string[]
  ): Promise<void> {
    this.logger.warn('attachQueryToolToAssistant está deprecado pero manteniendo compatibilidad automática usando helper.');
    
    const patchResult = await patchAssistantWithToolsAndFiles({
      vapiApiKey: this.VAPI_API_KEY!,
      assistantId: vapiAssistantId,
      toolIds: [queryToolId],
      fileIds,
      logger: this.logger,
      // NO pasar axiosInstance: dejar que el helper cree el cliente con baseURL correcto
      maxRetries: 2,
    });

    if (!patchResult.success) {
      this.logger.warn('attachQueryToolToAssistant helper failed:', {
        reason: patchResult.reason,
        hasResponseData: !!patchResult.responseData,
      });
      
      // Si el schema no es compatible, no lanzar error (ya está marcado en syncKnowledgeBase)
      if (patchResult.reason === 'unsupported_schema' || patchResult.reason === 'validation_rejected') {
        this.logger.warn('Schema no compatible - requiere revisión manual');
        return;
      }
      
      // Para otros errores, lanzar excepción
      throw new Error(`Failed to attach Query Tool: ${patchResult.reason}`);
    }
    
    this.logger.log('✅ Query Tool y archivos asociados correctamente vía helper');
  }
}

