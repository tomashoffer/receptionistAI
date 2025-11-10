import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from '../../decorators/http.decorators';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { RoleType } from '../../constants/role-type';
import { VapiService, VapiAssistantConfig } from './vapi.service';
import { 
  VAPI_ASSISTANT_CONFIG_ES, 
  VAPI_ASSISTANT_CONFIG_EN,
  VAPI_TOOLS,
  VAPI_VOICES_ES,
  VAPI_VOICES_EN 
} from './vapi-functions';

@ApiTags('vapi')
@Controller('vapi')
@ApiBearerAuth()
export class VapiController {
  private readonly logger = new Logger(VapiController.name);

  constructor(private readonly vapiService: VapiService) {}

  @Get('status')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar estado del servicio Vapi' })
  @ApiResponse({ status: 200, description: 'Estado del servicio' })
  async getStatus() {
    return this.vapiService.checkStatus();
  }

  @Get('business/:businessId/assistant')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener asistente de Vapi de un business' })
  @ApiResponse({ status: 200, description: 'Asistente encontrado' })
  @ApiResponse({ status: 404, description: 'Asistente no encontrado' })
  async getAssistantByBusiness(@Param('businessId') businessId: string) {
    this.logger.log(`Obteniendo asistente para business: ${businessId}`);
    return this.vapiService.getAssistantByBusiness(businessId);
  }

  @Post('business/:businessId/assistant/spanish')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear asistente de Vapi en español para un business (stack económico)' })
  @ApiResponse({ status: 201, description: 'Asistente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El business ya tiene un asistente' })
  async createSpanishAssistant(
    @Param('businessId') businessId: string,
    @Body() customConfig: Partial<VapiAssistantConfig>,
    @AuthUser() user: any
  ) {
    this.logger.log(`Usuario ${user.id} creando asistente en español para business ${businessId}`);
    this.logger.log(`📥 CustomConfig recibido:`, JSON.stringify(customConfig, null, 2));
    
    // Merge custom config with default Spanish config
    const finalConfig = {
      ...VAPI_ASSISTANT_CONFIG_ES,
      ...customConfig,
      // Asegurar que siempre tenga el idioma español en transcriber
      transcriber: {
        ...VAPI_ASSISTANT_CONFIG_ES.transcriber,
        ...customConfig.transcriber,
      },
    };

    this.logger.log(`📤 FinalConfig (después del merge):`, JSON.stringify({
      name: finalConfig.name,
      voice: finalConfig.voice,
      model: finalConfig.model?.model,
    }, null, 2));

    return this.vapiService.createAssistantForBusiness(
      businessId,
      user.id,
      finalConfig as any
    );
  }

  @Post('business/:businessId/assistant/english')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear asistente de Vapi en inglés para un business (stack económico)' })
  @ApiResponse({ status: 201, description: 'Asistente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El business ya tiene un asistente' })
  async createEnglishAssistant(
    @Param('businessId') businessId: string,
    @Body() customConfig: Partial<VapiAssistantConfig>,
    @AuthUser() user: any
  ) {
    this.logger.log(`Usuario ${user.id} creando asistente en inglés para business ${businessId}`);
    
    // Merge custom config with default English config
    const finalConfig = {
      ...VAPI_ASSISTANT_CONFIG_EN,
      ...customConfig,
      // Asegurar que siempre tenga el idioma inglés en transcriber
      transcriber: {
        ...VAPI_ASSISTANT_CONFIG_EN.transcriber,
        ...customConfig.transcriber,
      },
    };

    return this.vapiService.createAssistantForBusiness(
      businessId,
      user.id,
      finalConfig as any
    );
  }

  @Post('business/:businessId/assistant/custom')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear asistente personalizado de Vapi para un business' })
  @ApiResponse({ status: 201, description: 'Asistente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createCustomAssistant(
    @Param('businessId') businessId: string,
    @Body() config: VapiAssistantConfig,
    @AuthUser() user: any
  ) {
    this.logger.log(`Usuario ${user.id} creando asistente personalizado para business ${businessId}`);
    return this.vapiService.createAssistantForBusiness(
      businessId,
      user.id,
      config
    );
  }

  @Put('business/:businessId/assistant')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar asistente de Vapi de un business' })
  @ApiResponse({ status: 200, description: 'Asistente actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Asistente no encontrado' })
  async updateAssistant(
    @Param('businessId') businessId: string,
    @Body() config: Partial<VapiAssistantConfig>,
    @AuthUser() user: any
  ) {
    this.logger.log(`Usuario ${user.id} actualizando asistente para business ${businessId}`);
    return this.vapiService.updateAssistantForBusiness(businessId, config);
  }

  @Post('business/:businessId/calls')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear llamada saliente usando el asistente del business' })
  @ApiResponse({ status: 201, description: 'Llamada creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createCall(
    @Param('businessId') businessId: string,
    @Body() callData: { customerPhone: string; additionalConfig?: any },
    @AuthUser() user: any
  ) {
    this.logger.log(`Usuario ${user.id} creando llamada para business ${businessId} a ${callData.customerPhone}`);
    return this.vapiService.createCallForBusiness(
      businessId,
      callData.customerPhone,
      callData.additionalConfig
    );
  }

  @Get('calls')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas las llamadas de Vapi' })
  @ApiResponse({ status: 200, description: 'Lista de llamadas' })
  async listCalls(@AuthUser() user: any) {
    this.logger.log(`Usuario ${user.id} listando llamadas`);
    return this.vapiService.listCalls();
  }

  @Get('calls/:id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener información de una llamada' })
  @ApiResponse({ status: 200, description: 'Llamada encontrada' })
  @ApiResponse({ status: 404, description: 'Llamada no encontrada' })
  async getCall(@Param('id') id: string, @AuthUser() user: any) {
    this.logger.log(`Usuario ${user.id} obteniendo llamada ${id}`);
    return this.vapiService.getCall(id);
  }

  @Get('voices')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener lista de voces disponibles en Vapi' })
  @ApiResponse({ status: 200, description: 'Lista de voces' })
  async getVoices() {
    return {
      spanish: {
        elevenlabs: VAPI_VOICES_ES,
        openai: {
          name: 'OpenAI TTS-1 (Económico)',
          provider: 'openai',
          model: 'tts-1',
          note: 'Voz sintética de OpenAI, ideal para reducir costos',
        },
      },
      english: {
        elevenlabs: VAPI_VOICES_EN,
        openai: {
          name: 'OpenAI TTS-1 (Económico)',
          provider: 'openai',
          model: 'tts-1',
          note: 'Voz sintética de OpenAI, ideal para reducir costos',
        },
      },
      note: 'Stack económico recomendado: OpenAI TTS. Para mejor calidad usa ElevenLabs disponibles en Vapi.',
    };
  }

  // ========================================
  // TOOLS / HERRAMIENTAS
  // ========================================

  @Get('tools/predefined')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener herramientas (functions) predefinidas locales' })
  @ApiResponse({ status: 200, description: 'Lista de herramientas predefinidas' })
  async getPredefinedTools() {
    return {
      tools: VAPI_TOOLS,
      description: 'Herramientas predefinidas para el asistente de Vapi (definidas localmente)',
      available: [
        'create_appointment - Crear citas',
        'check_availability - Verificar disponibilidad',
        'cancel_appointment - Cancelar citas',
      ],
      note: 'Estas tools se pasan directamente en la configuración del asistente',
    };
  }

  @Get('tools')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas las tools/herramientas de Vapi' })
  @ApiResponse({ status: 200, description: 'Lista de tools desde Vapi' })
  async listTools(@AuthUser() user: any) {
    this.logger.log(`Usuario ${user.id} listando tools de Vapi`);
    return this.vapiService.listTools();
  }

  @Get('tools/:toolId')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una tool específica por ID' })
  @ApiResponse({ status: 200, description: 'Tool encontrada' })
  @ApiResponse({ status: 404, description: 'Tool no encontrada' })
  async getTool(@Param('toolId') toolId: string, @AuthUser() user: any) {
    this.logger.log(`Usuario ${user.id} obteniendo tool ${toolId}`);
    return this.vapiService.getTool(toolId);
  }

  @Post('tools')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva tool/herramienta en Vapi' })
  @ApiResponse({ status: 201, description: 'Tool creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createTool(@Body() toolConfig: any, @AuthUser() user: any) {
    this.logger.log(`Usuario ${user.id} creando tool en Vapi`);
    return this.vapiService.createTool(toolConfig);
  }

  @Put('tools/:toolId')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una tool existente' })
  @ApiResponse({ status: 200, description: 'Tool actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Tool no encontrada' })
  async updateTool(
    @Param('toolId') toolId: string,
    @Body() toolConfig: any,
    @AuthUser() user: any
  ) {
    this.logger.log(`Usuario ${user.id} actualizando tool ${toolId}`);
    return this.vapiService.updateTool(toolId, toolConfig);
  }

  @Delete('tools/:toolId')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una tool' })
  @ApiResponse({ status: 200, description: 'Tool eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Tool no encontrada' })
  async deleteTool(@Param('toolId') toolId: string, @AuthUser() user: any) {
    this.logger.log(`Usuario ${user.id} eliminando tool ${toolId}`);
    return this.vapiService.deleteTool(toolId);
  }

  @Get('configs')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener configuraciones predefinidas de asistentes' })
  @ApiResponse({ status: 200, description: 'Configuraciones disponibles' })
  async getConfigs() {
    return {
      spanish: VAPI_ASSISTANT_CONFIG_ES,
      english: VAPI_ASSISTANT_CONFIG_EN,
      stack: {
        llm: 'GPT-4o Mini',
        tts: 'OpenAI TTS-1',
        stt: 'Deepgram Nova-2',
        cost: '~$34.74/mes (1000 minutos)',
      },
      note: 'Configuraciones optimizadas para costos',
    };
  }
}

