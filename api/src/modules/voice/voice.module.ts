import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { VoiceController } from './voice.controller';
import { VoiceWebhookController } from './voice-webhook.controller';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';
import { VoiceInteractionEntity } from './voice-interaction.entity';
import { AppointmentsModule } from '../appointments/appointments.module';
import { SharedModule } from '../../shared/shared.module';
import { VapiService } from './vapi.service';
import { VapiController } from './vapi.controller';
import { AssistantModule } from '../assistant/assistant.module';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceInteractionEntity]),
    AppointmentsModule,
    forwardRef(() => AssistantModule),
    forwardRef(() => BusinessModule),
    SharedModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [
    VoiceController, 
    VoiceWebhookController, 
    VapiController
  ],
  providers: [
    VoiceService, 
    VoiceGateway, 
    VapiService,
  ],
  exports: [
    VoiceService, 
    VoiceGateway, 
    VapiService
  ],
})
export class VoiceModule {}

