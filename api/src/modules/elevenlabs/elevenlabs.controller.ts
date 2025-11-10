import { Controller, Get, Param } from '@nestjs/common';
import { ElevenlabsService } from './elevenlabs.service';

/**
 * Controller para endpoints de voces
 * Los assistants ahora se crean mediante Vapi en /vapi/assistants
 */
@Controller('elevenlabs')
export class ElevenlabsController {
  constructor(private readonly elevenlabsService: ElevenlabsService) {}

  // Endpoints de voces - mantenidos para configuración
  @Get('voices')
  async getVoices() {
    return this.elevenlabsService.getVoices();
  }

  @Get('voices/available')
  async getAvailableVoices() {
    return this.elevenlabsService.getAvailableVoices();
  }

  @Get('voices/language/:language')
  async getVoicesByLanguage(@Param('language') language: string) {
    return this.elevenlabsService.getVoicesByLanguage(language);
  }

  @Get('voices/provider/:provider')
  async getVoicesByProvider(@Param('provider') provider: string) {
    return this.elevenlabsService.getVoicesByProvider(provider);
  }
}

