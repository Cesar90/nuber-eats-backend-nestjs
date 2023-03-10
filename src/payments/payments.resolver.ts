import { GetPaymentsOutput } from './dtos/get-payments.dto';

import { CreatePaymentOutput, CreatePaymentInput } from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { PaymentService } from './payments.service';
import { Role } from 'src/auth/role.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(of => Payment)
export class PaymentResolver{
  constructor(
    private readonly paymentService: PaymentService
  ) {}
  @Mutation(returns => CreatePaymentOutput)
  @Role(["Owner"])
  createPayment(
    @AuthUser() owner: User,
    @Args("input") createPaymentInput:CreatePaymentInput
  ): Promise<CreatePaymentOutput>{
    return this.paymentService.createPayment(owner, createPaymentInput)
  }

  @Query(returns => GetPaymentsOutput)
  @Role(["Owner"])
  getPayments(
    @AuthUser() user: User
  ): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(user)
  }
}