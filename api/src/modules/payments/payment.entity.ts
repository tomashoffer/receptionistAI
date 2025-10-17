import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
// ActionPaymentStatus eliminado - proyecto anterior
import { UserEntity } from '../user/user.entity';
// ActionsEntity eliminado - proyecto anterior

@Entity('payments')
export class PaymentEntity extends AbstractEntity {
  @PrimaryColumn()
  declare id: string;

  @Column({ name: 'mercadopago_payment_id', nullable: true })
  mercadopagoPaymentId: string;

  @Column({ name: 'mercadopago_preference_id', nullable: true })
  mercadopagoPreferenceId: string;

  @Column({ name: 'external_reference', nullable: true })
  externalReference: string;

  @Column({
    type: 'varchar',
    default: 'pending',
  })
  status: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'mercadopago_data', type: 'json', nullable: true })
  mercadopagoData: any;

  @Column({ name: 'action_id', nullable: true })
  actionId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  // ActionsEntity eliminado - proyecto anterior
}
