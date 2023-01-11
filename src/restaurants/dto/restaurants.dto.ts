import { Restaurant } from './../entitites/restaurant.entity';
import { PaginationInput, PaginationOutput } from './../../common/dtos/pagination.dto';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class RestaurantsInput extends PaginationInput{
  // @Field(type => Int)
  // restaurantId: number
}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput{
  @Field(type => [Restaurant], { nullable: true })
  results?: Restaurant[]
}