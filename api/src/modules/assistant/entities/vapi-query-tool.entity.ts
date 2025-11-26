import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AssistantConfiguration } from './assistant-configuration.entity';

@Entity('vapi_query_tools')
@Index(['assistantConfigurationId'], { unique: true })
export class VapiQueryTool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  assistantConfigurationId: string;

  @ManyToOne(() => AssistantConfiguration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assistant_configuration_id' })
  assistantConfiguration: AssistantConfiguration;

  @Column({ type: 'varchar', length: 255 })
  vapiToolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

