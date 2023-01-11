import { Restaurant } from './../restaurants/entitites/restaurant.entity';
import { Payment } from './entities/payment.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payments.service';
import { PaymentResolver } from './payments.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentService, PaymentResolver],
})
export class PaymentsModule {}
