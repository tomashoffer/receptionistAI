import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessUser } from './entities/business-user.entity';
import { CallLog } from './entities/call-log.entity';
import { BusinessPlan } from './entities/business-plan.entity';
import { BusinessService } from './services/business.service';
import { BusinessController } from './controllers/business.controller';
import { CallLogService } from './services/call-log.service';
import { CallLogController } from './controllers/call-log.controller';
import { BusinessGuard } from './guards/business.guard';
import { WebhookGuard } from './guards/webhook.guard';
import { BusinessContextInterceptor } from './interceptors/business-context.interceptor';
import { AssistantModule } from '../assistant/assistant.module';
import { VoiceModule } from '../voice/voice.module';
// import { BusinessScopingMiddleware } from './middleware/business-scoping.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      BusinessUser,
      CallLog,
      BusinessPlan,
    ]),
    forwardRef(() => AssistantModule),
    forwardRef(() => VoiceModule),
  ],
  controllers: [
    BusinessController,
    CallLogController,
  ],
  providers: [
    BusinessService,
    CallLogService,
    BusinessGuard,
    WebhookGuard,
    BusinessContextInterceptor,
    // BusinessScopingMiddleware,
  ],
  exports: [
    BusinessService,
    CallLogService,
    BusinessGuard,
    WebhookGuard,
    BusinessContextInterceptor,
    // BusinessScopingMiddleware,
  ],
})
export class BusinessModule {}
