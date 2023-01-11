import { CoreOutput } from './../../common/dtos/output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';
import { Restaurant } from './../entitites/restaurant.entity';
import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";

@InputType()
// export class EditRestaurantInput extends PartialType(
//   PickType(Restaurant, ["address","name","coverImg"])
// ){
//   @Field(type => String)
//   categoryName: string
// }
export class EditRestaurantInput extends PartialType(CreateRestaurantInput){

  @Field(type => Number)
  restaurantId: number

}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput{

}