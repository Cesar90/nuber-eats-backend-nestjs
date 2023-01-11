import { CoreOutput } from './../../common/dtos/output.dto';
import { Dish } from './../entitites/dish.entity';
import { Field, InputType, Int, ObjectType, PartialType, PickType } from "@nestjs/graphql";

@InputType()
export class EditDishInput extends PickType(PartialType(Dish),[
  "name",
  "options",
  "price",
  "description"]){
    @Field(type => Int)
    dishId:number
  }

@ObjectType()
export class EditDishOutput extends CoreOutput{

}