import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Business } from './business.entity';

export enum CallStatus {
  ANSWERED = 'answered',
  MISSED = 'missed',
  BUSY = 'busy',
  FAILED = 'failed',
  COMPLETED = 'completed'
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
}

@Entity('call_logs')
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'varchar', length: 100 })
  call_sid: string; // Twilio Call SID

  @Column({ type: 'varchar', length: 20 })
  caller_number: string;

  @Column({ type: 'varchar', length: 20 })
  called_number: string;

  @Column({ 
    type: 'enum', 
    enum: CallDirection,
    default: CallDirection.INBOUND 
  })
  direction: CallDirection;

  @Column({ 
    type: 'enum', 
    enum: CallStatus,
    default: CallStatus.ANSWERED 
  })
  status: CallStatus;

  @Column({ type: 'int', default: 0 })
  duration_seconds: number;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at: Date;

  // Transcripción y análisis
  @Column({ type: 'text', nullable: true })
  transcription: string;

  @Column({ type: 'json', nullable: true })
  ai_responses: Array<{
    timestamp: Date;
    message: string;
    confidence: number;
  }>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sentiment: string; // positive, negative, neutral

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  sentiment_score: number; // -1 a 1

  // Resultado de la llamada
  @Column({ type: 'varchar', length: 100, nullable: true })
  outcome: string; // appointment_scheduled, information_requested, etc.

  @Column({ type: 'json', nullable: true })
  extracted_data: {
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
    date?: string;
    time?: string;
    [key: string]: any;
  };

  // Costos
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost_usd: number;

  @Column({ type: 'int', default: 0 })
  ai_tokens_used: number;

  // Relaciones
  @ManyToOne(() => Business, business => business.call_logs)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
