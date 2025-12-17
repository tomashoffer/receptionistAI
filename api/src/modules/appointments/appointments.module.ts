import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentEntity } from './appointment.entity';
import { GoogleModule } from '../google/google.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity]),
    GoogleModule,
    GoogleCalendarModule,
    ContactModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

