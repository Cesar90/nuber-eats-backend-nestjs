import { Payment } from './../entities/payment.entity';
import { CoreOutput } from './../../common/dtos/output.dto';
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GetPaymentsOutput extends CoreOutput{
  @Field(type => [Payment], { nullable: true })
  payments?: Payment[]
}