import { Controller, Post, Get, Patch, Body, UseGuards, Request, Param, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { UserEntity } from '../user/user.entity';
import { ElevenlabsService } from './elevenlabs.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';

@Controller('elevenlabs')
export class ElevenlabsController {
  constructor(private readonly elevenlabsService: ElevenlabsService) {}

  @Post('assistants')
  @UseGuards(AuthGuard)
  @Auth([RoleType.ADMIN, RoleType.USER])
  async createAssistant(@Body() createAssistantDto: CreateAssistantDto, @AuthUser() user: UserEntity) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.elevenlabsService.createAssistant(createAssistantDto, user.id);
  }

  @Patch('assistants/:agentId')
  @UseGuards(AuthGuard)
  @Auth([RoleType.ADMIN, RoleType.USER])
  async updateAssistant(
    @Param('agentId') agentId: string,
    @Body() updateAssistantDto: Partial<CreateAssistantDto>,
    @AuthUser() user: UserEntity
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.elevenlabsService.updateAssistant(agentId, updateAssistantDto);
  }

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

