import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from './payment.entity';
import { SharedModule } from '../../shared/shared.module';
// ActionsModule eliminado - proyecto anterior

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    SharedModule,
    // ActionsModule eliminado - proyecto anterior
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

