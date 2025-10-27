import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestAssistantService } from './test-assistant.service';
import { TestAssistantController } from './test-assistant.controller';
import { Business } from '../business/entities/business.entity';
import { Assistant } from '../assistant/entities/assistant.entity';
import { CallLog } from '../business/entities/call-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, Assistant, CallLog]),
  ],
  controllers: [TestAssistantController],
  providers: [TestAssistantService],
  exports: [TestAssistantService],
})
export class TestAssistantModule {}
