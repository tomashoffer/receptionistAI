import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Business } from './business.entity';
import { UserEntity } from '../../user/user.entity';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff'
}

@Entity('business_users')
export class BusinessUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'uuid' })
  user_id: string; // Referencia al usuario del sistema de auth

  // Relación con el usuario (UserEntity)
  @ManyToOne(() => UserEntity, user => user.businessMemberships, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ 
    type: 'enum', 
    enum: UserRole,
    default: UserRole.STAFF 
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  // Relaciones
  @ManyToOne(() => Business, business => business.users)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
