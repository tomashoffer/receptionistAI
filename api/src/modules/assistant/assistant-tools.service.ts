import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assistant } from './entities/assistant.entity';
import { DEFAULT_TOOLS, ToolConfig, DEFAULT_ASSISTANT_CONFIG } from './constants/assistant-config';

@Injectable()
export class AssistantToolsService {
  private readonly logger = new Logger(AssistantToolsService.name);

  constructor(
    @InjectRepository(Assistant)
    private assistantRepository: Repository<Assistant>,
  ) {}

  /**
   * Obtiene la configuración de tools por defecto
   */
  getDefaultTools(): ToolConfig[] {
    return DEFAULT_TOOLS;
  }

  /**
   * Obtiene la configuración completa por defecto para un asistente
   */
  getDefaultAssistantConfig() {
    return DEFAULT_ASSISTANT_CONFIG;
  }

  /**
   * Valida la configuración de tools de un asistente
   */
  validateToolsConfig(tools: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(tools)) {
      errors.push('Tools debe ser un array');
      return { valid: false, errors };
    }

    for (const tool of tools) {
      if (!tool.name || typeof tool.name !== 'string') {
        errors.push('Cada tool debe tener un nombre válido');
      }

      if (!tool.description || typeof tool.description !== 'string') {
        errors.push(`Tool ${tool.name}: debe tener una descripción válida`);
      }

      if (!tool.parameters || typeof tool.parameters !== 'object') {
        errors.push(`Tool ${tool.name}: debe tener parámetros válidos`);
      }

      if (tool.webhook_url && typeof tool.webhook_url !== 'string') {
        errors.push(`Tool ${tool.name}: webhook_url debe ser una URL válida`);
      }

      if (tool.enabled !== undefined && typeof tool.enabled !== 'boolean') {
        errors.push(`Tool ${tool.name}: enabled debe ser un booleano`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Valida los campos requeridos para una herramienta específica
   */
  validateRequiredFields(toolName: string, requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const defaultTool = DEFAULT_TOOLS.find(t => t.name === toolName);

    if (!defaultTool) {
      errors.push(`Tool ${toolName} no es una herramienta válida`);
      return { valid: false, errors };
    }

    // Verificar que todos los campos requeridos existen en los parámetros de la herramienta
    const availableFields = Object.keys(defaultTool.parameters.properties || {});
    
    for (const field of requiredFields) {
      if (!availableFields.includes(field)) {
        errors.push(`Campo requerido '${field}' no existe en la herramienta ${toolName}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Actualiza la configuración de tools de un asistente
   */
  async updateAssistantTools(businessId: string, tools: any[]): Promise<Assistant> {
    const validation = this.validateToolsConfig(tools);
    if (!validation.valid) {
      throw new Error(`Configuración de tools inválida: ${validation.errors.join(', ')}`);
    }

    const assistant = await this.assistantRepository.findOne({
      where: { business_id: businessId }
    });

    if (!assistant) {
      throw new Error('Asistente no encontrado para este negocio');
    }

    assistant.tools = tools;
    const updatedAssistant = await this.assistantRepository.save(assistant);

    this.logger.log(`Tools actualizados para asistente ${assistant.id}`);
    return updatedAssistant;
  }

  /**
   * Actualiza los campos requeridos para herramientas específicas
   */
  async updateRequiredFields(businessId: string, requiredFields: Record<string, string[]>): Promise<Assistant> {
    const assistant = await this.assistantRepository.findOne({
      where: { business_id: businessId }
    });

    if (!assistant) {
      throw new Error('Asistente no encontrado para este negocio');
    }

    // Validar cada conjunto de campos requeridos
    for (const [toolName, fields] of Object.entries(requiredFields)) {
      const validation = this.validateRequiredFields(toolName, fields);
      if (!validation.valid) {
        throw new Error(`Campos requeridos inválidos para ${toolName}: ${validation.errors.join(', ')}`);
      }
    }

    assistant.required_fields = requiredFields;
    const updatedAssistant = await this.assistantRepository.save(assistant);

    this.logger.log(`Campos requeridos actualizados para asistente ${assistant.id}`);
    return updatedAssistant;
  }

  /**
   * Habilita o deshabilita una herramienta específica
   */
  async toggleTool(businessId: string, toolName: string, enabled: boolean): Promise<Assistant> {
    const assistant = await this.assistantRepository.findOne({
      where: { business_id: businessId }
    });

    if (!assistant) {
      throw new Error('Asistente no encontrado para este negocio');
    }

    if (!assistant.tools) {
      assistant.tools = [];
    }

    const toolIndex = assistant.tools.findIndex(t => t.name === toolName);
    if (toolIndex === -1) {
      throw new Error(`Herramienta ${toolName} no encontrada en la configuración`);
    }

    assistant.tools[toolIndex].enabled = enabled;
    const updatedAssistant = await this.assistantRepository.save(assistant);

    this.logger.log(`Tool ${toolName} ${enabled ? 'habilitado' : 'deshabilitado'} para asistente ${assistant.id}`);
    return updatedAssistant;
  }

  /**
   * Obtiene la configuración de tools de un asistente
   */
  async getAssistantTools(businessId: string): Promise<any[]> {
    const assistant = await this.assistantRepository.findOne({
      where: { business_id: businessId }
    });

    if (!assistant) {
      throw new Error('Asistente no encontrado para este negocio');
    }

    return assistant.tools || [];
  }

  /**
   * Obtiene los campos requeridos de un asistente
   */
  async getRequiredFields(businessId: string): Promise<Record<string, string[]>> {
    const assistant = await this.assistantRepository.findOne({
      where: { business_id: businessId }
    });

    if (!assistant) {
      throw new Error('Asistente no encontrado para este negocio');
    }

    return assistant.required_fields || {};
  }
}
