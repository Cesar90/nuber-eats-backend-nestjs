import { OrderItemOption } from './../entities/order-item.entity';
import { DishOption } from './../../restaurants/entitites/dish.entity';
import { CoreOutput } from './../../common/dtos/output.dto';
import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { Order } from '../entities/order.entity';

@InputType()
class CreateOrderItemInput{
  @Field(type => Int)
  dishId:number

  // @Field(type => DishOption, {nullable: true})
  // options?: DishOption[]
  @Field(type => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[]
}

@InputType()
// export class CreateOrderInput extends PickType(Order, ['items']){
export class CreateOrderInput{
  @Field(type => Int)
  restaurantId: number

  @Field(type => [CreateOrderItemInput])
  items: CreateOrderItemInput[]
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput{
  @Field(type => Int, { nullable: true })
  orderId?: number;
}