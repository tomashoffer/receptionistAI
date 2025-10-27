import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BusinessUser } from './business-user.entity';
import { CallLog } from './call-log.entity';
import { BusinessPlan } from './business-plan.entity';
import { UserEntity } from '../../user/user.entity';
import { Assistant } from '../../assistant/entities/assistant.entity';

export enum BusinessStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export enum Industry {
  HAIR_SALON = 'hair_salon',
  RESTAURANT = 'restaurant',
  MEDICAL_CLINIC = 'medical_clinic',
  DENTAL_CLINIC = 'dental_clinic',
  FITNESS_CENTER = 'fitness_center',
  BEAUTY_SALON = 'beauty_salon',
  LAW_FIRM = 'law_firm',
  CONSULTING = 'consulting',
  REAL_ESTATE = 'real_estate',
  AUTOMOTIVE = 'automotive',
  OTHER = 'other'
}

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  // Relación con el owner (UserEntity)
  @ManyToOne(() => UserEntity, user => user.ownedBusinesses, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  website: string;

  @Column({ 
    type: 'enum', 
    enum: Industry,
    default: Industry.OTHER 
  })
  industry: Industry;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rubro: string;

  @Column({ 
    type: 'enum', 
    enum: BusinessStatus,
    default: BusinessStatus.TRIAL 
  })
  status: BusinessStatus;

  // Relación con Assistant (OneToOne)
  @OneToOne(() => Assistant, assistant => assistant.business, { nullable: true })
  @JoinColumn({ name: 'assistant_id' })
  assistant: Assistant;

  @Column({ type: 'uuid', nullable: true })
  assistant_id: string;

  // Horarios de atención
  @Column({ type: 'json', nullable: true })
  business_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };

  // Servicios ofrecidos
  @Column({ type: 'json', nullable: true })
  services: Array<{
    name: string;
    description: string;
    duration: number; // en minutos
    price?: number;
  }>;

  // Integraciones
  @Column({ type: 'json', nullable: true })
  google_calendar_config: {
    calendar_id: string;
    access_token: string;
    refresh_token: string;
    enabled: boolean;
  };

  @Column({ type: 'json', nullable: true })
  google_drive_config: {
    folder_id: string;
    access_token: string;
    refresh_token: string;
    enabled: boolean;
  };

  // Configuración de Twilio
  @Column({ type: 'varchar', length: 100, nullable: true })
  twilio_phone_sid: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  twilio_webhook_url: string;


  // Plan y facturación
  @Column({ type: 'uuid', nullable: true })
  plan_id: string;

  @ManyToOne(() => BusinessPlan, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan: BusinessPlan;

  @Column({ type: 'timestamp', nullable: true })
  trial_ends_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscription_ends_at: Date;

  // Relaciones
  @OneToMany(() => BusinessUser, businessUser => businessUser.business)
  users: BusinessUser[];

  @OneToMany(() => CallLog, callLog => callLog.business)
  call_logs: CallLog[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
