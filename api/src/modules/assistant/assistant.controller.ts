import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request
} from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { CreateAssistantDto, UpdateAssistantDto } from './dto/assistant.dto';

@Controller('assistants')
@UseGuards(AuthGuard)
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
    private readonly assistantToolsService: AssistantToolsService
  ) {}

  @Post()
  async createAssistant(@Body() createAssistantDto: CreateAssistantDto, @Request() req) {
    return this.assistantService.createAssistant(createAssistantDto, req.user.id);
  }

  @Get('business/:businessId')
  async getAssistantByBusiness(@Param('businessId') businessId: string) {
    return this.assistantService.getAssistantByBusinessId(businessId);
  }

  @Put('business/:businessId')
  async updateAssistant(
    @Param('businessId') businessId: string,
    @Body() updateAssistantDto: UpdateAssistantDto
  ) {
    return this.assistantService.updateAssistant(businessId, updateAssistantDto);
  }

  @Delete('business/:businessId')
  async deleteAssistant(@Param('businessId') businessId: string) {
    await this.assistantService.deleteAssistant(businessId);
    return { message: 'Assistant deleted successfully' };
  }

  @Put('business/:businessId/activate')
  async activateAssistant(@Param('businessId') businessId: string) {
    return this.assistantService.activateAssistant(businessId);
  }

  @Put('business/:businessId/deactivate')
  async deactivateAssistant(@Param('businessId') businessId: string) {
    return this.assistantService.deactivateAssistant(businessId);
  }

  @Get('business/:businessId/tools')
  async getAssistantTools(@Param('businessId') businessId: string) {
    return this.assistantToolsService.getAssistantTools(businessId);
  }

  @Put('business/:businessId/tools')
  async updateAssistantTools(
    @Param('businessId') businessId: string,
    @Body() tools: any[]
  ) {
    return this.assistantToolsService.updateAssistantTools(businessId, tools);
  }

  // Endpoints específicos para tools
  @Get('tools/default')
  async getDefaultTools() {
    return this.assistantToolsService.getDefaultTools();
  }

  @Get('config/default')
  async getDefaultConfig() {
    return this.assistantToolsService.getDefaultAssistantConfig();
  }

  @Get('business/:businessId/required-fields')
  async getRequiredFields(@Param('businessId') businessId: string) {
    return this.assistantToolsService.getRequiredFields(businessId);
  }

  @Put('business/:businessId/required-fields')
  async updateRequiredFields(
    @Param('businessId') businessId: string,
    @Body() requiredFields: Record<string, string[]>
  ) {
    return this.assistantToolsService.updateRequiredFields(businessId, requiredFields);
  }

  @Put('business/:businessId/tools/:toolName/toggle')
  async toggleTool(
    @Param('businessId') businessId: string,
    @Param('toolName') toolName: string,
    @Body() body: { enabled: boolean }
  ) {
    return this.assistantToolsService.toggleTool(businessId, toolName, body.enabled);
  }

  @Post('business/:businessId/personalized-prompt')
  async getPersonalizedPrompt(
    @Param('businessId') businessId: string,
    @Body() body?: { required_fields?: (string | { name: string; type: string; label: string })[] }
  ) {
    const prompt = await this.assistantService.getPersonalizedPromptForBusiness(
      businessId, 
      body?.required_fields
    );
    return { prompt };
  }
}
