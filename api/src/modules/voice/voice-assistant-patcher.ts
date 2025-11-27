import axios, { AxiosInstance } from 'axios';

type LoggerLike = {
  log: (...args: any[]) => void;
  warn?: (...args: any[]) => void;
  error?: (...args: any[]) => void;
};

export type PatchResult = {
  success: boolean;
  reason?: string;
  responseData?: any;
  schemaType?: 'classic' | 'inline'; // Tipo de schema detectado
};

export async function patchAssistantWithToolsAndFiles(options: {
  axiosInstance?: AxiosInstance;
  vapiApiKey: string;
  assistantId: string;
  toolIds?: string[]; // IDs (strings) returned when creating tools
  fileIds?: string[]; // IDs (strings) returned when uploading files
  businessName?: string; // Business name para nombrar el Query Tool consistentemente
  logger?: LoggerLike;
  maxRetries?: number;
}): Promise<PatchResult> {
  const {
    axiosInstance,
    vapiApiKey,
    assistantId,
    toolIds = [],
    fileIds = [],
    businessName,
    logger = console,
    maxRetries = 1,
  } = options;

  const client = axiosInstance ?? axios.create({
    baseURL: 'https://api.vapi.ai',
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 30_000,
  });

  // Filtrar IDs válidos (no vacíos, no null, no undefined)
  const validToolIds = (toolIds || []).filter((id) => !!id && typeof id === 'string' && id.trim().length > 0);
  const validFileIds = (fileIds || []).filter((id) => !!id && typeof id === 'string' && id.trim().length > 0);

  if (validToolIds.length === 0 && validFileIds.length === 0) {
    logger.log('[VAPI PATCH] No toolIds or fileIds provided — nothing to attach.');
    return { success: true, reason: 'nothing_to_do', schemaType: 'inline' };
  }

  // ✅ SEGÚN DOCUMENTACIÓN VAPI: Si hay fileIds, crear Query Tool primero
  // https://docs.vapi.ai/knowledge-base/using-query-tool
  let queryToolId: string | null = null;
  if (validFileIds.length > 0) {
    try {
      logger.log(`[VAPI PATCH] Creando Query Tool con ${validFileIds.length} fileId(s)...`);
      
      // ✅ Usar business name para nombrar el Query Tool consistentemente con otras tools
      const cleanBusinessName = businessName 
        ? businessName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
        : assistantId.substring(0, 8);
      const queryToolFunctionName = `knowledge_base_query_${cleanBusinessName}`;
      
      const queryToolPayload = {
        type: 'query',
        function: {
          name: queryToolFunctionName, // Formato: knowledge_base_query_{businessname}
        },
        knowledgeBases: [
          {
            provider: 'google',
            name: `kb-${cleanBusinessName}`,
            description: 'Contains comprehensive business information, service details, pricing, and company offerings',
            fileIds: validFileIds,
          },
        ],
      };
      
      logger.log(`[VAPI PATCH] Query Tool function name: ${queryToolFunctionName}`);

      const queryToolResp = await client.post('/tool', queryToolPayload);
      queryToolId = queryToolResp.data?.id;
      
      if (!queryToolId) {
        logger.error('[VAPI PATCH] Query Tool creado pero no se recibió ID en respuesta');
        return { success: false, reason: 'query_tool_creation_failed', responseData: queryToolResp.data, schemaType: 'inline' };
      }

      logger.log(`[VAPI PATCH] ✅ Query Tool creado: ${queryToolId}`);
      // Agregar el Query Tool ID a toolIds para asociarlo al assistant
      validToolIds.push(queryToolId);
    } catch (queryToolError: any) {
      const errorData = queryToolError?.response?.data ?? queryToolError?.message ?? 'Unknown error';
      logger.error('[VAPI PATCH] Error creando Query Tool:', errorData);
      return { success: false, reason: 'query_tool_creation_failed', responseData: errorData, schemaType: 'inline' };
    }
  }

  // 1) GET assistant to inspect schema / determine support
  let assistantData: any;
  try {
    logger.log(`[VAPI PATCH] GET /assistant/${assistantId}`);
    const getResp = await client.get(`/assistant/${assistantId}`);
    assistantData = getResp.data;
    // Log summary (no tokens/secrets): solo keys presentes y counts
    const summary = {
      hasModel: typeof assistantData?.model !== 'undefined',
      hasKnowledgeBase: typeof assistantData?.knowledgeBase !== 'undefined',
      hasTools: typeof assistantData?.tools !== 'undefined',
      hasFiles: typeof assistantData?.files !== 'undefined',
      schemaVersion: assistantData?.schemaVersion,
      toolCount: Array.isArray(assistantData?.tools) ? assistantData.tools.length : 0,
      fileCount: Array.isArray(assistantData?.files) ? assistantData.files.length : 0,
    };
    logger.log('[VAPI PATCH] GET assistant - ok', summary);
  } catch (err: any) {
    const errorData = err?.response?.data ?? err?.message ?? 'Unknown error';
    logger.error('[VAPI PATCH] Failed to GET assistant:', errorData);
    return { success: false, reason: 'get_failed', responseData: errorData };
  }

  // Detect support for model and knowledgeBase
  const supportsModel = typeof assistantData?.model !== 'undefined';
  const supportsKnowledgeBase =
    typeof assistantData?.knowledgeBase !== 'undefined' || (assistantData?.schemaVersion && assistantData.schemaVersion >= 2);

  // Determinar tipo de schema
  const schemaType: 'classic' | 'inline' = (supportsModel && supportsKnowledgeBase) ? 'classic' : 'inline';

  logger.log(`[VAPI PATCH] supportsModel=${supportsModel}, supportsKnowledgeBase=${supportsKnowledgeBase}, schemaType=${schemaType}`);

  // If neither supported, we cannot PATCH with tools/files on this endpoint
  if (!supportsModel && !supportsKnowledgeBase) {
    const msg = 'assistant endpoint does not support model/knowledgeBase fields; cannot attach tools/files via PATCH';
    logger.warn('[VAPI PATCH] ' + msg);
    return { success: false, reason: 'unsupported_schema', responseData: assistantData, schemaType: 'inline' };
  }

  // Build patch payload conservatively: merge with existing model/knowledgeBase if present
  // ✅ IDEMPOTENCIA: Mergear con toolIds/fileIds existentes para evitar duplicados
  const patchPayload: any = {};

  if (validToolIds.length > 0 && supportsModel) {
    // Obtener toolIds existentes y mergear (evitar duplicados)
    const existingToolIds = Array.isArray(assistantData.model?.toolIds) 
      ? assistantData.model.toolIds.filter((id: any) => !!id && typeof id === 'string')
      : [];
    
    // Combinar y deduplicar
    const mergedToolIds = [...new Set([...existingToolIds, ...validToolIds])];
    
    patchPayload.model = {
      ...(assistantData.model || {}),
      toolIds: mergedToolIds,
    };
    
    logger.log(`[VAPI PATCH] Merged toolIds: ${existingToolIds.length} existing + ${validToolIds.length} new = ${mergedToolIds.length} total`);
  }

  // ✅ NOTA: Ya no usamos knowledgeBase.fileIds directamente
  // Los fileIds se asocian vía Query Tool (creado arriba) que se agrega a model.toolIds
  // Esto es según la documentación oficial de Vapi:
  // https://docs.vapi.ai/knowledge-base/using-query-tool

  // Log payload summary (sin tokens/secrets): solo estructura y counts
  const payloadSummary = {
    hasModel: !!patchPayload.model,
    toolIdsCount: validToolIds.length,
    queryToolCreated: !!queryToolId,
    fileIdsCount: validFileIds.length,
    modelKeys: patchPayload.model ? Object.keys(patchPayload.model) : [],
  };
  logger.log('[VAPI PATCH] Prepared patch payload:', payloadSummary);
  
  // ✅ LOG DETALLADO: Mostrar el payload completo (sin secrets) para debugging
  if (patchPayload.model) {
    logger.log('[VAPI PATCH] Model payload details:', {
      provider: patchPayload.model.provider,
      model: patchPayload.model.model,
      temperature: patchPayload.model.temperature,
      maxTokens: patchPayload.model.maxTokens,
      toolIds: patchPayload.model.toolIds,
      toolIdsCount: Array.isArray(patchPayload.model.toolIds) ? patchPayload.model.toolIds.length : 0,
      hasMessages: !!patchPayload.model.messages,
    });
  }

  // 2) PATCH with retries
  let lastError: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.log(`[VAPI PATCH] PATCH /assistant/${assistantId} attempt=${attempt + 1}`);
      const patchResp = await client.patch(`/assistant/${assistantId}`, patchPayload);
      
      // ✅ VERIFICACIÓN POSTERIOR: GET para confirmar que los fileIds/toolIds están realmente asociados
      logger.log('[VAPI PATCH] PATCH success - verifying association...');
      try {
        const verifyResp = await client.get(`/assistant/${assistantId}`);
        const verified = verifyResp.data;
        
        // ✅ LOG DETALLADO: Verificar el estado completo del assistant después del PATCH
        logger.log('[VAPI PATCH] Assistant state after PATCH:', {
          hasModel: !!verified.model,
          modelToolIds: Array.isArray(verified.model?.toolIds) ? verified.model.toolIds : [],
          modelToolIdsCount: Array.isArray(verified.model?.toolIds) ? verified.model.toolIds.length : 0,
          hasKnowledgeBase: !!verified.knowledgeBase,
          knowledgeBaseFileIds: Array.isArray(verified.knowledgeBase?.fileIds) ? verified.knowledgeBase.fileIds : [],
          hasTools: !!verified.tools,
          toolsCount: Array.isArray(verified.tools) ? verified.tools.length : 0,
          hasFiles: !!verified.files,
          filesCount: Array.isArray(verified.files) ? verified.files.length : 0,
        });
        
        // Verificar que el Query Tool está presente (si se creó)
        if (queryToolId && supportsModel) {
          const verifiedToolIds = Array.isArray(verified.model?.toolIds) 
            ? verified.model.toolIds 
            : [];
          const queryToolPresent = verifiedToolIds.includes(queryToolId);
          
          if (!queryToolPresent) {
            logger.warn(`[VAPI PATCH] Query Tool ${queryToolId} not found in assistant toolIds after PATCH`);
          } else {
            logger.log(`[VAPI PATCH] ✅ Query Tool ${queryToolId} verified in assistant (contains ${validFileIds.length} fileIds)`);
            
            // ✅ VERIFICAR EL QUERY TOOL DIRECTAMENTE para confirmar que tiene los files
            try {
              const queryToolResp = await client.get(`/tool/${queryToolId}`);
              const queryTool = queryToolResp.data;
              const toolFileIds = queryTool?.knowledgeBases?.[0]?.fileIds || [];
              logger.log(`[VAPI PATCH] Query Tool details:`, {
                id: queryToolId,
                type: queryTool?.type,
                functionName: queryTool?.function?.name,
                knowledgeBasesCount: Array.isArray(queryTool?.knowledgeBases) ? queryTool.knowledgeBases.length : 0,
                fileIdsInTool: toolFileIds,
                fileIdsCount: Array.isArray(toolFileIds) ? toolFileIds.length : 0,
                allFileIdsPresent: validFileIds.every(id => toolFileIds.includes(id)),
              });
            } catch (toolErr: any) {
              logger.warn(`[VAPI PATCH] Could not verify Query Tool directly:`, toolErr?.message);
            }
          }
        }
        
        // Verificar que los toolIds están presentes
        if (validToolIds.length > 0 && supportsModel) {
          const verifiedToolIds = Array.isArray(verified.model?.toolIds) 
            ? verified.model.toolIds 
            : [];
          const allToolIdsPresent = validToolIds.every(id => verifiedToolIds.includes(id));
          
          if (!allToolIdsPresent) {
            const missing = validToolIds.filter(id => !verifiedToolIds.includes(id));
            logger.warn(`[VAPI PATCH] Some toolIds not found after PATCH: ${missing.join(', ')}`);
            // No fallar, pero registrar warning
          } else {
            logger.log(`[VAPI PATCH] ✅ All ${validToolIds.length} toolIds verified in assistant`);
          }
        }
      } catch (verifyErr: any) {
        // Si falla la verificación, loguear pero no fallar (el PATCH fue exitoso)
        logger.warn('[VAPI PATCH] Verification GET failed (but PATCH succeeded):', verifyErr?.message);
      }
      
      return { success: true, responseData: patchResp.data, schemaType };
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status;
      const data = err?.response?.data;
      
      // Mejorar parsing de errores: manejar array o string
      const messages = Array.isArray(data?.message) 
        ? data.message.join(' | ') 
        : (data?.message || data || err?.message || 'Unknown error');
      
      logger.error(`[VAPI PATCH] PATCH failed (attempt ${attempt + 1}) status=${status}`, {
        message: typeof messages === 'string' ? messages.substring(0, 200) : messages,
        hasResponseData: !!data,
      });
      
      // If 400 with "property ... should not exist" for specific fields, return unsupported
      if (typeof messages === 'string' && messages.includes('should not exist')) {
        return { success: false, reason: 'validation_rejected', responseData: data };
      }
      
      // else loop for retry if allowed
      if (attempt === maxRetries) break;
      
      // Backoff exponencial: 1s, 2s, 4s, 8s...
      const backoff = 1000 * Math.pow(2, attempt);
      logger.log(`[VAPI PATCH] Retrying in ${backoff}ms...`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  logger.error('[VAPI PATCH] All PATCH attempts failed', lastError?.response?.data ?? lastError?.message ?? lastError);
  return { success: false, reason: 'patch_failed', responseData: lastError?.response?.data ?? lastError?.message };
}