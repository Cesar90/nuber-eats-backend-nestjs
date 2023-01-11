import { CoreOutput } from './../../common/dtos/output.dto';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class DeleteDishInput{
  @Field(type => Int)
  dishId: number
}

@ObjectType()
export class DeleteDishOuput extends CoreOutput{
  
}