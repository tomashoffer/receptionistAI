import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElevenlabsController } from './elevenlabs.controller';
import { ElevenlabsService } from './elevenlabs.service';
import { AssistantModule } from '../assistant/assistant.module';

@Module({
  imports: [ConfigModule, AssistantModule],
  controllers: [ElevenlabsController],
  providers: [ElevenlabsService],
  exports: [ElevenlabsService]
})
export class ElevenlabsModule {}

