import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { AppointmentStatus } from '../../constants/appointment-types';

@Entity('appointments')
export class AppointmentEntity extends AbstractEntity {
  @Column({ name: 'client_name' })
  clientName: string;

  @Column({ name: 'client_phone' })
  clientPhone: string;

  @Column({ name: 'client_email' })
  clientEmail: string;

  @Column({ name: 'service_type' })
  serviceType: string;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: Date;

  @Column({ name: 'appointment_time' })
  appointmentTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'google_calendar_event_id', nullable: true })
  googleCalendarEventId: string;

  @Column({ name: 'google_sheets_row_id', nullable: true })
  googleSheetsRowId: string;

  @Column({ name: 'voice_interaction_id', nullable: true })
  voiceInteractionId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;
}

