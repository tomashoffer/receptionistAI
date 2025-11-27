import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Business, Industry } from '../../business/entities/business.entity';
import { UserEntity } from '../../user/user.entity';
import { VapiKbFile } from './vapi-kb-file.entity';
import { VapiQueryTool } from './vapi-query-tool.entity';

@Entity('assistant_configurations')
export class AssistantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({
    type: 'enum',
    enum: Industry,
    nullable: false,
  })
  industry: Industry;

  @Column({ type: 'text', nullable: false })
  prompt: string;

  @Column({ type: 'text', nullable: true })
  prompt_voice?: string;

  @Column({ type: 'text', nullable: true })
  prompt_chatbot?: string;

  @Column({ type: 'boolean', default: false })
  is_custom_prompt_voice?: boolean;

  @Column({ type: 'boolean', default: false })
  is_custom_prompt_chatbot?: boolean;

  @Column({ type: 'varchar', nullable: true })
  prompt_voice_source?: string; // 'auto' | 'manual' | 'migrated'

  @Column({ type: 'varchar', nullable: true })
  prompt_chatbot_source?: string; // 'auto' | 'manual' | 'migrated'

  @Column({ type: 'integer', nullable: true })
  prompt_voice_tokens?: number;

  @Column({ type: 'integer', nullable: true })
  prompt_chatbot_tokens?: number;

  @Column({ type: 'jsonb', nullable: false })
  config_data: {
    configuracionAsistente: any;
    precioDisponibilidad: any;
    informacionEstablecimiento: any;
    informacionExtra: any;
    integracionFotos: {
      areasComunes: any[];
      fotosGenerales: string[];
    };
  };

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'jsonb', nullable: false, default: () => "'{}'::jsonb", name: 'behavior_config' })
  behaviorConfig: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'idle' })
  vapiSyncStatus: string;

  @Column({ type: 'timestamp', nullable: true })
  vapiLastSyncedAt: Date;

  @Column({ type: 'text', nullable: true })
  vapiLastError: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vapiSchemaType: string; // 'classic' | 'inline' | null

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @OneToMany(() => VapiKbFile, (file) => file.assistantConfiguration)
  vapiKbFiles: VapiKbFile[];

  @OneToMany(() => VapiQueryTool, (tool) => tool.assistantConfiguration)
  vapiQueryTools: VapiQueryTool[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

