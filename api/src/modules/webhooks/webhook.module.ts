import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebhookController } from './webhook.controller';
import { AppointmentsModule } from '../appointments/appointments.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { MailingModule } from '../mailing/mailing.module';
import { BusinessModule } from '../business/business.module';

import { CallLog } from '../business/entities/call-log.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessUser } from '../business/entities/business-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CallLog, Business, BusinessUser]),
    AppointmentsModule,
    GoogleCalendarModule,
    MailingModule,
    forwardRef(() => BusinessModule),
  ],
  controllers: [WebhookController],
  providers: [],
  exports: [],
})
export class WebhookModule {}
