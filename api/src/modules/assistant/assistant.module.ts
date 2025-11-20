import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assistant } from './entities/assistant.entity';
import { AssistantConfiguration } from './entities/assistant-configuration.entity';
import { Business } from '../business/entities/business.entity';
import { UserEntity } from '../user/user.entity';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { AssistantConfigService } from './assistant-config.service';
import { AssistantController } from './assistant.controller';
import { AssistantConfigController } from './assistant-config.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assistant, AssistantConfiguration, Business, UserEntity])
  ],
  controllers: [AssistantController, AssistantConfigController],
  providers: [AssistantService, AssistantToolsService, AssistantConfigService],
  exports: [AssistantService, AssistantToolsService, AssistantConfigService]
})
export class AssistantModule {}
