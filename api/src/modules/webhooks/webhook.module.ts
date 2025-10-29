import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebhookController } from './webhook.controller';
import { CallLogService } from '../business/services/call-log.service';
import { BusinessService } from '../business/services/business.service';
import { WebhookGuard } from '../business/guards/webhook.guard';
import { AppointmentsModule } from '../appointments/appointments.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';

import { CallLog } from '../business/entities/call-log.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessUser } from '../business/entities/business-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CallLog, Business, BusinessUser]),
    AppointmentsModule,
    GoogleCalendarModule,
  ],
  controllers: [WebhookController],
  providers: [
    CallLogService,
    BusinessService,
    WebhookGuard,
  ],
  exports: [
    CallLogService,
    BusinessService,
    WebhookGuard,
  ],
})
export class WebhookModule {}
