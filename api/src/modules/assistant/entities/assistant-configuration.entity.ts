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

