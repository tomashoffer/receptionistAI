import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { VoiceIntentType } from '../../constants/voice-types';

@Entity('voice_interactions')
export class VoiceInteractionEntity extends AbstractEntity {
  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({ type: 'text' })
  transcription: string;

  @Column({ type: 'text' })
  intent: string; // JSON string con la intención detectada

  @Column({ type: 'text' })
  response: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence: number; // Confianza del análisis de intención

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @Column({
    type: 'enum',
    enum: VoiceIntentType,
    default: VoiceIntentType.GREETING,
  })
  intentType: VoiceIntentType;

  @Column({ default: 'success' })
  status: string; // success, error, partial

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'audio_file_path', nullable: true })
  audioFilePath: string;

  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs: number;
}

