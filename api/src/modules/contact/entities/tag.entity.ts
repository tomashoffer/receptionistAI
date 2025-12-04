import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import { ContactTag } from './contact-tag.entity';

@Entity('tags')
@Index(['business_id', 'label'], { unique: true })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @ManyToOne(() => Business)
  business: Business;

  @Column({ type: 'varchar', length: 50 })
  label: string;

  @Column({ type: 'varchar', length: 20, default: 'blue' })
  color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @OneToMany(() => ContactTag, (contactTag) => contactTag.tag)
  contactTags: ContactTag[];

  @CreateDateColumn()
  created_at: Date;
}

