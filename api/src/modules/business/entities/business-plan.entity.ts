import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('business_plans')
export class BusinessPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_monthly: number;

  @Column({ type: 'int', default: 0 })
  call_minutes_limit: number; // 0 = ilimitado

  @Column({ type: 'int', default: 1 })
  integrations_limit: number;

  @Column({ type: 'int', default: 1 })
  users_limit: number;

  @Column({ type: 'json', nullable: true })
  features: Array<{
    name: string;
    description: string;
    enabled: boolean;
  }>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
