import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import { ContactTag } from './contact-tag.entity';

@Entity('contacts')
@Index(['business_id', 'phone'], { unique: true })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @ManyToOne(() => Business)
  business: Business;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({
    type: 'enum',
    enum: ['call', 'whatsapp', 'instagram', 'facebook', 'web', 'manual'],
    default: 'manual',
  })
  source: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int', default: 0 })
  total_interactions: number;

  @Column({ type: 'timestamp', nullable: true })
  last_interaction?: Date;

  @Column({ type: 'text', nullable: true })
  last_conversation_summary?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  conversation_id?: string;

  @OneToMany(() => ContactTag, (contactTag) => contactTag.contact)
  contactTags: ContactTag[];

  // Relación virtual con appointments (no hay foreign key desde Contact hacia Appointment)
  // Los appointments se obtienen filtrando por contact_id
  appointments?: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

