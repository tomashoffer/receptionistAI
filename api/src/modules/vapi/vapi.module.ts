import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VapiController } from './vapi.controller';
import { VapiService } from './vapi.service';
import { AssistantModule } from '../assistant/assistant.module';

@Module({
  imports: [ConfigModule, AssistantModule],
  controllers: [VapiController],
  providers: [VapiService],
  exports: [VapiService]
})
export class VapiModule {}
