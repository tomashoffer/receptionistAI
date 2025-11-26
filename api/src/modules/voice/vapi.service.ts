import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VapiClient } from '@vapi-ai/server-sdk';
import axios from 'axios';
import { AssistantService } from '../assistant/assistant.service';
import { BusinessService } from '../business/services/business.service';
import { Business } from '../business/entities/business.entity';
import { VAPI_TOOLS } from './vapi-functions';
import { VapiKnowledgeBaseSyncService } from '../assistant/services/vapi-knowledge-base-sync.service';

export interface VapiAssistantConfig {
  name: string;
  language?: string;
  model?: {
    provider: 'openai';
    model: 'gpt-4o';
    temperature?: number;
    maxTokens?: number;
    messages?: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
  };
  voice?: {
    provider: 'openai' | '11labs'; // En Vapi, ElevenLabs se llama '11labs'
    voiceId?: string;
    model?: string;
  };
  transcriber?: {
    provider: 'deepgram';
    model?: string;
    language?: string;
  };
  firstMessage?: string;
  serverUrl?: string;
  tools?: any[];
}

@Injectable()
export class VapiService {
  private readonly logger = new Logger(VapiService.name);
  private vapi: VapiClient;

  constructor(
    @Inject(forwardRef(() => AssistantService))
    private assistantService: AssistantService,
    @Inject(forwardRef(() => BusinessService))
    private businessService: BusinessService,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @Inject(forwardRef(() => VapiKnowledgeBaseSyncService))
    private kbSyncService: VapiKnowledgeBaseSyncService,
  ) {
    const vapiApiKey = process.env.VAPI_API_KEY;
    
    if (!vapiApiKey) {
      this.logger.warn('⚠️ VAPI_API_KEY no está configurada');
    } else {
      this.vapi = new VapiClient({ token: vapiApiKey });
      this.logger.log('✅ Vapi inicializado correctamente');
    }
  }

  /**
   * Crear asistente en Vapi Y guardarlo en BD vinculado al business
   * Este es el método principal que debes usar
   */
  async createAssistantForBusiness(
    businessId: string,
    userId: string,
    config: VapiAssistantConfig
  ) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado. Verifica VAPI_API_KEY');
      }

      // URL del backend - usar ngrok HTTPS para producción
      const backendUrl = process.env.NGROK_URL || process.env.WEBHOOK_URL_BACKEND || process.env.BACKEND_URL || 'https://anthophyllitic-histoid-madelynn.ngrok-free.dev';
      const webhookUrl = `${backendUrl}/voice/webhooks/vapi`;
      const language = config.language || 'es';

      this.logger.log(`📍 Backend URL: ${backendUrl}`);
      this.logger.log(`📍 Webhook URL configurado: ${webhookUrl}`);

      // Obtener business para el nombre
      const business = await this.businessRepository.findOne({
        where: { id: businessId }
      });
      if (!business) {
        throw new Error(`Business ${businessId} not found`);
      }
      const businessName = business.name || 'Business';
      const cleanBusinessName = businessName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

      // Paso 1: Crear las tools por separado en Vapi con nombre del business
      this.logger.log(`🔧 Creando tools en Vapi para ${businessName}...`);
      const toolIds: string[] = [];
      
      // ⚠️ ARQUITECTURA HÍBRIDA (solución de latencia):
      // - ApiRequestTool para tools simples (get_current_datetime, resolve_date)
      // - FunctionTool para tools complejas (check_availability, create_appointment, cancel_appointment)
      
      // Mapeo de tools que usan ApiRequestTool (requests directas)
      const apiRequestTools = {
        'get_current_datetime': {
          method: 'POST', // Vapi siempre usa POST para tools
          url: `${backendUrl}/utils/now`,
        },
        'resolve_date': {
          method: 'POST',
          url: `${backendUrl}/utils/resolve-date`,
        },
      };

      for (const tool of VAPI_TOOLS) {
        try {
          const toolName = tool.function?.name;
          const toolNameWithBusiness = `${toolName}_${cleanBusinessName}`;
          const apiConfig = apiRequestTools[toolName];

          let toolConfig: any;

          if (apiConfig) {
            // ✅ ApiRequestTool: Vapi hace la request directamente (baja latencia)
            toolConfig = {
              type: 'apiRequest',
              async: false,
              messages: [],
              name: toolNameWithBusiness,
              description: tool.function?.description,
              url: apiConfig.url,
              method: apiConfig.method,
            };
            this.logger.log(`  📌 Creando ApiRequestTool: ${toolNameWithBusiness} -> ${apiConfig.method} ${apiConfig.url}`);
          } else {
            // ✅ FunctionTool: Se maneja a través del serverUrl del assistant
            toolConfig = {
              type: 'function',
              async: false,
              messages: [],
              function: {
                ...tool.function,
                name: toolNameWithBusiness,
              },
            };
            this.logger.log(`  📌 Creando FunctionTool: ${toolNameWithBusiness} (usa serverUrl del assistant)`);
          }

          const createdTool = await this.vapi.tools.create(toolConfig);
          
          this.logger.log(`  ✅ Tool creada: ${toolNameWithBusiness} (ID: ${createdTool.id})`);
          toolIds.push(createdTool.id);
        } catch (toolError) {
          this.logger.warn(`  ⚠️ Error creando tool ${tool.function?.name}:`, toolError.message);
          this.logger.warn(`  ⚠️ Detalles del error:`, toolError);
          // Continuar con las demás tools
        }
      }

      this.logger.log(`✅ ${toolIds.length}/${VAPI_TOOLS.length} tools creadas exitosamente`);

      // ✅ PASO 2: Sincronizar Knowledge Base ANTES de crear el assistant
      // Esto asegura que los archivos estén listos para asociar al assistant
      let fileIds: string[] = [];
      try {
        const { AssistantConfiguration } = await import('../assistant/entities/assistant-configuration.entity');
        const assistantConfigRepo = this.businessRepository.manager.getRepository(AssistantConfiguration);

        const assistantConfig = await assistantConfigRepo.findOne({
          where: { business_id: businessId },
        });

        if (assistantConfig) {
          // ✅ Validar que KB no esté en estado "syncing" (job async en progreso)
          if (assistantConfig.vapiSyncStatus === 'syncing') {
            this.logger.warn(`⚠️ Knowledge Base está sincronizando (async job en progreso). Esperando a que termine...`);
            // Esperar hasta que termine (máximo 30 segundos)
            let waitTime = 0;
            const maxWaitTime = 30000; // 30 segundos
            const pollInterval = 1000; // 1 segundo
            
            while (assistantConfig.vapiSyncStatus === 'syncing' && waitTime < maxWaitTime) {
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              waitTime += pollInterval;
              
              // Recargar estado
              const refreshedConfig = await assistantConfigRepo.findOne({
                where: { id: assistantConfig.id },
              });
              if (refreshedConfig) {
                Object.assign(assistantConfig, refreshedConfig);
              }
            }
            
            if (assistantConfig.vapiSyncStatus === 'syncing') {
              throw new Error('Knowledge Base sync está tomando demasiado tiempo. Por favor, intenta de nuevo en unos momentos.');
            }
          }
          
          // ✅ Validar que KB esté "synced" o "idle" antes de continuar
          if (assistantConfig.vapiSyncStatus === 'error') {
            this.logger.warn(`⚠️ Knowledge Base tiene estado "error". Reintentando sync...`);
            // Reintentar sync una vez
            fileIds = await this.kbSyncService.syncKnowledgeBase(assistantConfig.id);
          } else {
            // Sincronizar KB de forma síncrona para obtener los fileIds
            this.logger.log(`📚 Sincronizando Knowledge Base antes de crear assistant (config: ${assistantConfig.id})...`);
            fileIds = await this.kbSyncService.syncKnowledgeBase(assistantConfig.id);
          }
          
          if (fileIds.length > 0) {
            this.logger.log(`✅ Knowledge Base sincronizado. ${fileIds.length} archivo(s) listo(s) para asociar al assistant`);
          } else {
            this.logger.warn(`⚠️ Knowledge Base sincronizado pero no hay archivos. Continuando sin archivos de KB.`);
          }
        } else {
          this.logger.log(`ℹ️ No hay AssistantConfiguration para este business aún. El assistant se creará sin archivos de KB.`);
        }
      } catch (error) {
        this.logger.error(`❌ Error sincronizando Knowledge Base antes de crear assistant: ${error.message}`);
        // No continuar si hay error crítico en sync KB
        throw new Error(`No se pudo sincronizar Knowledge Base: ${error.message}`);
      }

      // Preparar array de tools con sus IDs de Vapi para guardar en BD
      const toolsForDb = VAPI_TOOLS.map((tool, index) => ({
        id: toolIds[index], // ID de la tool en Vapi
        name: tool.function?.name || '',
        description: tool.function?.description || '',
        parameters: tool.function?.parameters || {},
        enabled: true,
      }));

      // Preparar array de tools para el assistant en formato correcto: [{ id, type }] o [{ type }]
      // Según la documentación oficial de Vapi, debemos usar 'tools' a nivel raíz, no 'model.toolIds'
      const assistantTools: Array<{ id?: string; type: string }> = [];
      
      // Agregar function tools (apiRequest o function) - estas SÍ tienen ID porque se crean vía /tool
      for (let i = 0; i < VAPI_TOOLS.length; i++) {
        const tool = VAPI_TOOLS[i];
        const toolId = toolIds[i];
        const apiConfig = apiRequestTools[tool.function?.name];
        
        // Determinar el tipo: 'apiRequest' o 'function'
        const toolType = apiConfig ? 'apiRequest' : 'function';
        assistantTools.push({ id: toolId, type: toolType });
      }
      
      // ✅ Agregar Query Tool (SIN ID, solo type) - ya NO se crean vía /tool
      // Los archivos se asocian directamente al assistant, no al tool
      if (fileIds && fileIds.length > 0) {
        assistantTools.push({ type: 'query' });
        this.logger.log(`✅ Query Tool agregado al assistant (sin ID, solo type)`);
      }

      // ✅ PASO 3: Validar que todos los toolIds existan en Vapi antes de crear el assistant
      // Solo validar tools que tienen ID (function tools), no Query Tools que solo tienen type
      const toolsWithIds = assistantTools.filter(t => t.id);
      this.logger.log(`🔍 Validando que todos los toolIds existan en Vapi (${toolsWithIds.length} tools con ID)...`);
      const invalidToolIds: string[] = [];
      
      for (const tool of toolsWithIds) {
        if (!tool.id) continue; // Skip tools sin ID (Query Tools)
        try {
          const toolResponse = await this.vapi.tools.get(tool.id);
          if (!toolResponse || !toolResponse.id) {
            invalidToolIds.push(tool.id);
            this.logger.warn(`⚠️ Tool ID ${tool.id} no existe o es inválido en Vapi`);
          } else {
            this.logger.log(`✅ Tool ${tool.id} (${tool.type}) validado en Vapi`);
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            invalidToolIds.push(tool.id);
            this.logger.error(`❌ Tool ID ${tool.id} no encontrado en Vapi (404)`);
          } else {
            this.logger.warn(`⚠️ Error validando tool ${tool.id}: ${error.message}`);
            // Continuar con validación aunque haya error de red
          }
        }
      }
      
      if (invalidToolIds.length > 0) {
        throw new Error(`Los siguientes toolIds no existen en Vapi: ${invalidToolIds.join(', ')}. Por favor, verifica la configuración.`);
      }
      
      const queryToolsCount = assistantTools.filter(t => t.type === 'query' && !t.id).length;
      const functionToolsCount = toolsWithIds.length;
      this.logger.log(`✅ Todos los toolIds validados exitosamente (${functionToolsCount} function tools + ${queryToolsCount} query tools)`);
      this.logger.log('📝 Tools con IDs para guardar en BD:', JSON.stringify(toolsForDb.map(t => ({ name: t.name, id: t.id })), null, 2));
      this.logger.log(`📊 Total de tools incluidas en assistant: ${assistantTools.length} (${functionToolsCount} function tools + ${queryToolsCount} query tools)`);
      this.logger.log('🔧 Tools para assistant:', JSON.stringify(assistantTools, null, 2));

      // Configuración optimizada para costos (GPT-4o Mini + OpenAI TTS + Deepgram)
      // ✅ Usar formato de API REST directa según documentación oficial de Vapi
      // tools va a nivel raíz, NO en model.toolIds
      const assistantConfig: any = {
        name: config.name,
        
        // Modelo: GPT-4o Mini (configurado como ElevenLabs)
        model: {
          provider: 'openai',
          model: 'gpt-4o',
          temperature: 0.0, // ⚠️ CRÍTICO: 0.0 como en ElevenLabs para seguir instrucciones exactamente
          maxTokens: 500, // ⚠️ CRÍTICO: Aumentado de 250 para permitir tool calls
          messages: config.model?.messages || [
            {
              role: 'system',
              content: this.getDefaultSystemPrompt(language)
            }
          ],
        },
        
        // ✅ CORRECCIÓN: tools a nivel raíz según documentación oficial de Vapi
        // Formato: [{ id, type }] para function tools, [{ type }] para query tools
        tools: assistantTools,

        // ✅ Archivos de Knowledge Base asociados directamente al assistant
        // Formato: [{ id: "fileId1" }, { id: "fileId2" }]
        ...(fileIds && fileIds.length > 0 && {
          files: fileIds.map((id) => ({ id })),
        }),

        // Voice: OpenAI TTS (económico) o ElevenLabs (premium)
        voice: config.voice || {
          provider: 'openai',
          model: 'tts-1',
        },

        // Transcriber: Deepgram (económico y rápido)
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: language,
        },

        // Primer mensaje
        firstMessage: config.firstMessage || (language === 'es' 
          ? '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' 
          : 'Hello! I\'m your virtual assistant. How can I help you today?'),

        // Webhook (serverUrl debe ser válido o Vapi lo rechaza)
        serverUrl: webhookUrl,
        
        // Configuración adicional
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600,
        backgroundSound: 'off',
        endCallPhrases: language === 'es' 
          ? ['hasta luego entonces', 'me despido', 'chau gracias por llamar', 'que tengas un buen día']
          : ['goodbye then', 'have a great day', 'thanks for calling'],
        
        clientMessages: [
          'conversation-update',
          'function-call',
          'hang',
          'metadata',
          'speech-update',
          'status-update',
          'transcript',
          'tool-calls',
        ],
      };

      this.logger.log('📞 Creando asistente en Vapi para business:', businessId);
      this.logger.log('🔧 Config del assistant:', JSON.stringify({
        name: assistantConfig.name,
        hasVoice: !!assistantConfig.voice,
        hasModel: !!assistantConfig.model,
        toolsCount: assistantConfig.tools?.length || 0,
        tools: assistantConfig.tools,
      }, null, 2));
      
      // ✅ Usar axios directamente para tener control total sobre el formato del payload
      // El SDK puede transformar el payload, así que usamos la API REST directa
      const vapiApiKey = process.env.VAPI_API_KEY;
      if (!vapiApiKey) {
        throw new Error('VAPI_API_KEY no está configurada');
      }

      const vapiResponse = await axios.post(
        'https://api.vapi.ai/assistant',
        assistantConfig,
        {
          headers: {
            'Authorization': `Bearer ${vapiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const vapiAssistant = vapiResponse.data;
      
      this.logger.log('✅ Asistente creado en Vapi con ID:', vapiAssistant.id);
      this.logger.log('🔍 Tools en el assistant creado:', (vapiAssistant as any).tools?.length || 0);

      // Guardar en la BD vinculado al business
      const dbAssistant = await this.assistantService.createAssistant(
        {
          business_id: businessId,
          name: config.name,
          prompt: config.model?.messages?.[0]?.content || this.getDefaultSystemPrompt(language),
          first_message: config.firstMessage || assistantConfig.firstMessage,
          vapi_assistant_id: vapiAssistant.id,
          vapi_public_key: process.env.VAPI_PUBLIC_KEY || '',
          voice_id: config.voice?.voiceId || '',
          voice_provider: 'vapi' as any,
          language: language,
          model_provider: 'openai' as any,
          model_name: 'gpt-4o',
          tools: toolsForDb, // ✅ Guardar tools con sus IDs de Vapi
          server_url: assistantConfig.serverUrl,
          status: 'active' as any,
        },
        userId
      );

      this.logger.log('✅ Asistente guardado en BD:', dbAssistant.id);

      return {
        vapiAssistant,
        dbAssistant,
        message: 'Asistente creado exitosamente en Vapi y guardado en BD',
      };
    } catch (error) {
      this.logger.error('❌ Error creando asistente:', error);
      throw error;
    }
  }

  /**
   * Actualizar tool de create_appointment en Vapi
   */
  async updateCreateAppointmentTool(
    toolId: string,
    requiredFields: any[] // Puede ser string[] o array mixto con objetos { name, type, label }
  ) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      this.logger.log(`🔧 Actualizando tool create_appointment (${toolId}) con campos:`, requiredFields);

      // Construir parámetros dinámicos basados en los campos requeridos
      const properties: any = {};
      const required: string[] = [];

      // Mapeo de campos a propiedades de la tool
      const fieldMapping: any = {
        'name': { key: 'clientName', type: 'string', description: 'Nombre completo del cliente' },
        'email': { key: 'clientEmail', type: 'string', description: 'Email del cliente' },
        'phone': { key: 'clientPhone', type: 'string', description: 'Número de teléfono del cliente (sin espacios ni guiones)' },
        'service': { key: 'serviceType', type: 'string', description: 'Tipo de servicio solicitado' },
        'date': { key: 'appointmentDate', type: 'string', description: 'Fecha de la cita en formato YYYY-MM-DD' },
        'time': { key: 'appointmentTime', type: 'string', description: 'Hora de la cita en formato HH:MM (24 horas)' },
      };

      // Procesar campos (string o objeto con name/type/label)
      requiredFields.forEach((field: any) => {
        let fieldName: string;
        let fieldType: string = 'string';
        
        // Extraer nombre y tipo del campo
        if (typeof field === 'string') {
          fieldName = field;
        } else if (typeof field === 'object' && field.name) {
          fieldName = field.name;
          fieldType = field.type || 'string';
        } else {
          this.logger.warn('⚠️ Campo inválido:', field);
          return;
        }
        
        // Si es un campo estándar, usar el mapeo
        if (fieldMapping[fieldName]) {
          const mapped = fieldMapping[fieldName];
          properties[mapped.key] = {
            type: mapped.type,
            description: mapped.description
          };
          if (['name', 'phone', 'date', 'time'].includes(fieldName)) {
            required.push(mapped.key);
          }
        } else {
          // Campo personalizado (ej: "edad")
          properties[fieldName] = {
            type: fieldType, // ✅ Usar el tipo del campo personalizado (string, number, etc.)
            description: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`
          };
        }
      });

      // Siempre incluir notes (opcional)
      properties.notes = {
        type: 'string',
        description: 'Notas adicionales sobre la cita'
      };

      // Obtener la tool actual para preservar su estructura
      const currentTool = await this.vapi.tools.get(toolId);
      
      this.logger.log('🔍 Tool actual:', JSON.stringify({
        id: currentTool.id,
        type: currentTool.type,
        functionName: (currentTool as any).function?.name,
      }, null, 2));

      // ✅ Payload del PATCH: SOLO función con parámetros actualizados
      // NO enviar "type", "async", "messages", "server" - Vapi los preserva automáticamente
      const updatePayload: any = {
        function: {
          name: (currentTool as any).function?.name, // Mantener el nombre original
          description: (currentTool as any).function?.description,
          parameters: {
            type: 'object',
            properties,
            required,
          }
        }
      };

      this.logger.log('📤 Enviando update a Vapi:', JSON.stringify({
        toolId,
        functionName: updatePayload.function.name,
        parametersKeys: Object.keys(properties),
        requiredFields: required,
      }, null, 2));

      const updatedTool = await this.vapi.tools.update(toolId, updatePayload);

      this.logger.log('✅ Tool create_appointment actualizada exitosamente');
      return updatedTool;
    } catch (error) {
      this.logger.error('❌ Error actualizando tool:', error);
      throw error;
    }
  }

  /**
   * Actualizar asistente en Vapi y en BD
   */
  async updateAssistantForBusiness(
    businessId: string,
    config: Partial<VapiAssistantConfig>
  ) {
    try {
      this.logger.log(`📥 UpdateConfig recibido para business ${businessId}:`, JSON.stringify(config, null, 2));
      
      // Obtener assistant de la BD
      const dbAssistant = await this.assistantService.getAssistantByBusinessId(businessId);
      
      if (!dbAssistant.vapi_assistant_id) {
        throw new Error('Este asistente no tiene un vapi_assistant_id');
      }

      this.logger.log(`🔄 Actualizando asistente en Vapi: ${dbAssistant.vapi_assistant_id}`);

      // 1️⃣ Si se proveen requiredFields, actualizar SOLO la tool de create_appointment
      if ((config as any).requiredFields && dbAssistant.tools) {
        const createAppointmentTool = dbAssistant.tools.find(t => t.name === 'create_appointment');
        if (createAppointmentTool && createAppointmentTool.id) {
          this.logger.log('🔧 Actualizando tool create_appointment con campos requeridos...');
          const updatedTool = await this.updateCreateAppointmentTool(createAppointmentTool.id, (config as any).requiredFields);
          
          // Actualizar la tool en la BD también
          const updatedTools = dbAssistant.tools.map(t => 
            t.name === 'create_appointment' 
              ? { ...t, parameters: (updatedTool as any).function?.parameters }
              : t
          );
          
          await this.assistantService.updateAssistantTools(dbAssistant.business_id, updatedTools);
          this.logger.log('✅ Tool actualizada en BD también');
        } else {
          this.logger.warn('⚠️ No se encontró el ID de create_appointment tool en la BD');
        }
      }

      // 2️⃣ Preparar payload para actualizar el assistant (SIN requiredFields)
      const assistantUpdatePayload: any = {};
      let shouldUpdateAssistant = false;

      if (config.firstMessage) {
        assistantUpdatePayload.firstMessage = config.firstMessage;
        shouldUpdateAssistant = true;
      }

      if (config.voice) {
        assistantUpdatePayload.voice = config.voice;
        shouldUpdateAssistant = true;
      }

      // 🚨 PATCH CRÍTICO: Preservar tools siempre que haya cualquier actualización
      if (config.model?.messages || config.voice || config.firstMessage) {
        // CRÍTICO: Preservar los tools existentes cuando actualizamos el prompt
        // Obtener tools actuales del assistant desde Vapi para preservar tipos correctos
        let existingTools: Array<{ id: string; type: string }> = [];
        
        try {
          if (this.vapi && dbAssistant.vapi_assistant_id) {
            const currentAssistant = await this.vapi.assistants.get(dbAssistant.vapi_assistant_id);
            existingTools = (currentAssistant as any).tools || [];
            this.logger.log(`🔍 Tools actuales del assistant en Vapi: ${existingTools.length}`);
          }
        } catch (error) {
          this.logger.warn(`⚠️ No se pudieron obtener tools actuales del assistant, usando tools de BD: ${error.message}`);
          // Fallback: construir desde BD
          // El tipo de tools en BD no incluye 'type', así que determinamos el tipo basándonos en el nombre
          existingTools = dbAssistant.tools?.map(t => {
            if (!t.id) return null;
            
            // Determinar tipo basándonos en el nombre de la tool
            // Si el nombre contiene 'query' o 'kb', es un Query Tool
            // Si el nombre contiene 'get_current_datetime' o 'resolve_date', es apiRequest
            // Por defecto, es 'function'
            let toolType = 'function';
            const toolName = t.name?.toLowerCase() || '';
            
            if (toolName.includes('query') || toolName.includes('kb')) {
              toolType = 'query';
            } else if (toolName.includes('get_current_datetime') || toolName.includes('resolve_date')) {
              toolType = 'apiRequest';
            }
            
            return { id: t.id, type: toolType };
          }).filter((t): t is { id: string; type: string } => t !== null) || [];
        }
        
        assistantUpdatePayload.model = {
          provider: 'openai', // Añadir provider y model para asegurar el LLM
          model: 'gpt-4o',
          messages: config.model?.messages || (dbAssistant.prompt ? [{ role: 'system', content: dbAssistant.prompt }] : []), // Preservar prompt existente
          temperature: 0.0,
          maxTokens: 500,
        };
        
        // ✅ CORRECCIÓN: Usar 'tools' a nivel raíz según documentación oficial de Vapi
        // NO usar 'model.toolIds' (deprecated)
        assistantUpdatePayload.tools = existingTools;
        shouldUpdateAssistant = true;
        
        this.logger.log(`🔧 Preservando ${existingTools.length} tools + temperature: 0.0 + maxTokens: 500`);
      }

      // 3️⃣ Actualizar assistant en Vapi SOLO si hay cambios en firstMessage, voice o model
      if (shouldUpdateAssistant && this.vapi) {
        this.logger.log('🔄 Actualizando assistant en Vapi con:', JSON.stringify({
          voice: assistantUpdatePayload.voice,
          firstMessage: assistantUpdatePayload.firstMessage,
          hasModel: !!assistantUpdatePayload.model,
        }, null, 2));
        
        await this.vapi.assistants.update(dbAssistant.vapi_assistant_id, assistantUpdatePayload);
        this.logger.log('✅ Asistente actualizado en Vapi');
      } else if (!shouldUpdateAssistant && !(config as any).requiredFields) {
        this.logger.warn('⚠️ No hay cambios para actualizar (ni assistant ni tools)');
      }

      // 4️⃣ Actualizar en BD
      const updateData: any = {};
      if (config.name) updateData.name = config.name;
      if (config.firstMessage) updateData.first_message = config.firstMessage;
      if (config.voice) updateData.voice_id = config.voice.voiceId;
      if (config.model) updateData.model_name = config.model.model;
      if ((config as any).requiredFields) updateData.required_fields = (config as any).requiredFields;

      const updatedAssistant = await this.assistantService.updateAssistant(businessId, updateData);
      
      return {
        dbAssistant: updatedAssistant,
        message: 'Asistente actualizado exitosamente',
      };
    } catch (error) {
      this.logger.error('❌ Error actualizando asistente:', error);
      throw error;
    }
  }

  /**
   * Obtener asistente de un business (desde BD)
   */
  async getAssistantByBusiness(businessId: string) {
    try {
      return await this.assistantService.getAssistantByBusinessId(businessId);
    } catch (error) {
      this.logger.error('❌ Error obteniendo asistente:', error);
      throw error;
    }
  }

  /**
   * Crear llamada saliente usando el assistant del business
   */
  async createCallForBusiness(
    businessId: string,
    customerPhone: string,
    additionalConfig?: any
  ) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      // Obtener assistant del business
      const assistant = await this.assistantService.getAssistantByBusinessId(businessId);
      
      if (!assistant.vapi_assistant_id) {
        throw new Error('Este business no tiene un asistente de Vapi configurado');
      }

      const callConfig = {
        assistantId: assistant.vapi_assistant_id,
        customer: {
          number: customerPhone,
        },
        ...additionalConfig,
      };

      this.logger.log('📞 Iniciando llamada saliente a:', customerPhone);
      const call = await this.vapi.calls.create(callConfig);
      
      this.logger.log('✅ Llamada creada');
      return call;
    } catch (error) {
      this.logger.error('❌ Error creando llamada:', error);
      throw error;
    }
  }

  /**
   * Listar llamadas de Vapi
   */
  async listCalls() {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      return await this.vapi.calls.list();
    } catch (error) {
      this.logger.error('❌ Error listando llamadas:', error);
      throw error;
    }
  }

  /**
   * Obtener información de una llamada
   */
  async getCall(callId: string) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      return await this.vapi.calls.get(callId);
    } catch (error) {
      this.logger.error('❌ Error obteniendo llamada:', error);
      throw error;
    }
  }

  /**
   * Verificar estado del servicio Vapi
   */
  async checkStatus() {
    try {
      if (!this.vapi) {
        return {
          status: 'error',
          message: 'Vapi no está inicializado. Verifica VAPI_API_KEY',
        };
      }

      // Intentar listar asistentes para verificar conectividad
      await this.vapi.assistants.list();
      
      return {
        status: 'ok',
        message: 'Vapi está funcionando correctamente',
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Error conectando con Vapi: ${error.message}`,
      };
    }
  }

  /**
   * ========================================
   * TOOLS / HERRAMIENTAS
   * ========================================
   */

  /**
   * Listar todas las tools/herramientas de Vapi
   */
  async listTools() {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      return await this.vapi.tools.list();
    } catch (error) {
      this.logger.error('❌ Error listando tools:', error);
      throw error;
    }
  }

  /**
   * Obtener una tool específica por ID
   */
  async getTool(toolId: string) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      return await this.vapi.tools.get(toolId);
    } catch (error) {
      this.logger.error('❌ Error obteniendo tool:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva tool/herramienta en Vapi
   */
  async createTool(toolConfig: any) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      this.logger.log('📞 Creando tool en Vapi');
      const tool = await this.vapi.tools.create(toolConfig);
      
      this.logger.log('✅ Tool creada en Vapi:', tool.id);
      return tool;
    } catch (error) {
      this.logger.error('❌ Error creando tool:', error);
      throw error;
    }
  }

  /**
   * Actualizar una tool existente
   */
  async updateTool(toolId: string, toolConfig: any) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      this.logger.log('📞 Actualizando tool:', toolId);
      const tool = await this.vapi.tools.update(toolId, toolConfig);
      
      this.logger.log('✅ Tool actualizada en Vapi');
      return tool;
    } catch (error) {
      this.logger.error('❌ Error actualizando tool:', error);
      throw error;
    }
  }

  /**
   * Eliminar una tool
   */
  async deleteTool(toolId: string) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      this.logger.log('🗑️ Eliminando tool:', toolId);
      await this.vapi.tools.delete(toolId);
      
      this.logger.log('✅ Tool eliminada de Vapi');
      return { success: true, message: 'Tool eliminada exitosamente' };
    } catch (error) {
      this.logger.error('❌ Error eliminando tool:', error);
      throw error;
    }
  }

  /**
   * Eliminar un assistant de Vapi
   */
  async deleteAssistant(assistantId: string) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi no está inicializado');
      }

      this.logger.log('🗑️ Eliminando assistant de Vapi:', assistantId);
      await this.vapi.assistants.delete(assistantId);
      
      this.logger.log('✅ Assistant eliminado de Vapi');
      return { success: true, message: 'Assistant eliminado exitosamente' };
    } catch (error) {
      this.logger.error('❌ Error eliminando assistant:', error);
      throw error;
    }
  }

  /**
   * Obtener prompt por defecto según el idioma
   */
  private getDefaultSystemPrompt(language: string): string {
    if (language === 'es' || language === 'es-ES' || language === 'es-AR') {
      return `Eres una recepcionista AI profesional y amigable. Tu trabajo es agendar citas de manera eficiente y natural.

INSTRUCCIONES:
- Saluda al cliente de manera cálida y profesional
- Recopila la información necesaria para agendar la cita
- Si falta información, pregunta de manera natural
- Confirma todos los detalles antes de crear la cita
- Usa un tono conversacional y amigable
- Habla en español de manera natural y fluida
- Sé breve y conciso en tus respuestas (máximo 2-3 oraciones)
- No repitas información que el cliente ya te dio

INFORMACIÓN A RECOPILAR:
1. Nombre completo del cliente
2. Número de teléfono
3. Email (opcional, no insistas si no lo tiene)
4. Tipo de servicio que necesita
5. Fecha preferida para la cita
6. Hora preferida
7. Notas adicionales (opcional)

FLUJO DE CONVERSACIÓN:
1. Saluda y pregunta en qué puedes ayudar
2. Si quiere agendar, pregunta su nombre
3. Luego su teléfono
4. Luego el tipo de servicio
5. Luego fecha y hora juntas (ej: "¿Qué fecha y hora te viene mejor?")
6. Si menciona email, tómalo. Si no, no insistas
7. Confirma TODOS los datos antes de llamar a la función
8. Llama a create_appointment solo cuando tengas al menos: nombre, teléfono, fecha y hora

Cuando tengas toda la información necesaria, usa la función create_appointment para agendar la cita.`;
    }
    
    return `You are a professional and friendly AI receptionist. Your job is to schedule appointments efficiently and naturally.

INSTRUCTIONS:
- Greet the customer warmly and professionally
- Collect the necessary information to schedule the appointment
- If information is missing, ask naturally
- Confirm all details before creating the appointment
- Use a conversational and friendly tone
- Be brief and concise in your responses (maximum 2-3 sentences)

INFORMATION TO COLLECT:
1. Customer's full name
2. Phone number
3. Email (optional)
4. Type of service needed
5. Preferred appointment date
6. Preferred time
7. Additional notes (optional)

When you have all the necessary information, use the create_appointment function to schedule the appointment.`;
  }
}

