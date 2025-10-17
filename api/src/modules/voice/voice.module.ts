import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { VoiceController } from './voice.controller';
import { VoiceWebhookController } from './voice-webhook.controller';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';
import { VoiceInteractionEntity } from './voice-interaction.entity';
import { AppointmentsModule } from '../appointments/appointments.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceInteractionEntity]),
    AppointmentsModule,
    SharedModule,
    JwtModule.register({}),
  ],
  controllers: [VoiceController, VoiceWebhookController],
  providers: [VoiceService, VoiceGateway],
  exports: [VoiceService, VoiceGateway],
})
export class VoiceModule {}

