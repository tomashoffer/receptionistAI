import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import { UserEntity } from '../../user/user.entity';

export enum AssistantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

export enum VoiceProvider {
  VAPI = 'vapi',
  ELEVENLABS = 'elevenlabs',
  AZURE = 'azure'
}

export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google'
}

@Entity('assistants')
export class Assistant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación OneToOne con Business (cada business tiene solo 1 assistant)
  @Column({ type: 'uuid', unique: true })
  business_id: string;

  @OneToOne(() => Business, business => business.assistant, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  // Información básica del asistente
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  first_message: string;

  // Configuración de Vapi
  @Column({ type: 'varchar', length: 100, nullable: true })
  vapi_assistant_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vapi_public_key: string;

  // Configuración de voz
  @Column({ type: 'varchar', length: 100 })
  voice_id: string;

  @Column({ 
    type: 'enum', 
    enum: VoiceProvider,
    default: VoiceProvider.AZURE
  })
  voice_provider: VoiceProvider;

  @Column({ type: 'varchar', length: 10, default: 'es-ES' })
  language: string;

  // Configuración de modelo
  @Column({ 
    type: 'enum', 
    enum: ModelProvider,
    default: ModelProvider.OPENAI
  })
  model_provider: ModelProvider;

  @Column({ type: 'varchar', length: 50, default: 'gpt-4o-mini' })
  model_name: string;

  // Configuración de herramientas (Tools)
  @Column({ type: 'json', nullable: true })
  tools: Array<{
    name: string;
    description: string;
    parameters: any; // JSON schema para los parámetros
    webhook_url?: string;
    webhook_secret?: string;
    enabled: boolean;
  }>;

  // Campos requeridos para cada herramienta
  @Column({ type: 'json', nullable: true })
  required_fields: {
    [toolName: string]: string[]; // ej: { "create_appointment": ["name", "email", "phone"] }
  };

  // Configuración de webhook general
  @Column({ type: 'varchar', length: 500, nullable: true })
  server_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  server_url_secret: string;

  // Estado del asistente
  @Column({ 
    type: 'enum', 
    enum: AssistantStatus,
    default: AssistantStatus.DRAFT
  })
  status: AssistantStatus;

  // Metadatos
  @Column({ type: 'uuid' })
  created_by: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
