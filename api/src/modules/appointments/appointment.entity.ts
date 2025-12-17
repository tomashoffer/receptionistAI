import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { AppointmentStatus } from '../../constants/appointment-types';
import { Contact } from '../contact/entities/contact.entity';

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

  @Column({ name: 'contact_id', nullable: true, type: 'uuid' })
  contactId?: string;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;
}

