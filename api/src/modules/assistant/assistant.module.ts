import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Assistant } from './entities/assistant.entity';
import { AssistantConfiguration } from './entities/assistant-configuration.entity';
import { VapiKbFile } from './entities/vapi-kb-file.entity';
import { VapiQueryTool } from './entities/vapi-query-tool.entity';
import { Business } from '../business/entities/business.entity';
import { UserEntity } from '../user/user.entity';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { AssistantConfigService } from './assistant-config.service';
import { KnowledgeBaseGeneratorService } from './services/knowledge-base-generator.service';
import { VapiKnowledgeBaseSyncService } from './services/vapi-knowledge-base-sync.service';
import { AwsS3StorageService } from './services/aws-s3-storage.service';
import { PromptTemplateService } from './services/prompt-template.service';
import { VoicePromptGeneratorService } from './services/voice-prompt-generator.service';
import { KnowledgeBaseSyncProcessor } from './processors/knowledge-base-sync.processor';
import { AssistantController } from './assistant.controller';
import { AssistantConfigController } from './assistant-config.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assistant,
      AssistantConfiguration,
      VapiKbFile,
      VapiQueryTool,
      Business,
      UserEntity,
    ]),
    BullModule.registerQueue({
      name: 'knowledge-base-sync',
    }),
  ],
  controllers: [AssistantController, AssistantConfigController],
  providers: [
    AssistantService,
    AssistantToolsService,
    AssistantConfigService,
    KnowledgeBaseGeneratorService,
    VapiKnowledgeBaseSyncService,
    AwsS3StorageService,
    PromptTemplateService,
    VoicePromptGeneratorService,
    KnowledgeBaseSyncProcessor,
  ],
  exports: [
    AssistantService,
    AssistantToolsService,
    AssistantConfigService,
    KnowledgeBaseGeneratorService,
    VapiKnowledgeBaseSyncService,
    AwsS3StorageService,
    PromptTemplateService,
    VoicePromptGeneratorService,
  ]
})
export class AssistantModule {}
