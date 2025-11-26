import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AssistantConfiguration } from './assistant-configuration.entity';

@Entity('vapi_kb_files')
@Index(['assistantConfigurationId'])
@Index(['vapiFileId'])
@Index(['configVersion'])
@Index(['s3Key'])
export class VapiKbFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assistantConfigurationId: string;

  @ManyToOne(() => AssistantConfiguration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assistant_configuration_id' })
  assistantConfiguration: AssistantConfiguration;

  @Column({ type: 'varchar', length: 255 })
  vapiFileId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer', nullable: true })
  bytes: number;

  @Column({ type: 'integer' })
  configVersion: number;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 's3_key' })
  s3Key: string;

  @CreateDateColumn()
  createdAt: Date;
}

