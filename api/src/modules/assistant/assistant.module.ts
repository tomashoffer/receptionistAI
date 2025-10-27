import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assistant } from './entities/assistant.entity';
import { Business } from '../business/entities/business.entity';
import { UserEntity } from '../user/user.entity';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { AssistantController } from './assistant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assistant, Business, UserEntity])
  ],
  controllers: [AssistantController],
  providers: [AssistantService, AssistantToolsService],
  exports: [AssistantService, AssistantToolsService]
})
export class AssistantModule {}
