import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Tag } from './tag.entity';

@Entity('contact_tags')
@Index(['contact_id', 'tag_id'], { unique: true })
export class ContactTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  contact_id: string;

  @ManyToOne(() => Contact, (contact) => contact.contactTags, {
    onDelete: 'CASCADE',
  })
  contact: Contact;

  @Column({ type: 'uuid' })
  tag_id: string;

  @ManyToOne(() => Tag, (tag) => tag.contactTags, { onDelete: 'CASCADE' })
  tag: Tag;

  @Column({ type: 'uuid', nullable: true })
  assigned_by?: string;

  @CreateDateColumn()
  assigned_at: Date;
}

