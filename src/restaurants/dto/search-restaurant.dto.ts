import { PaginationInput } from './../../common/dtos/pagination.dto';
import { Restaurant } from './../entitites/restaurant.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationOutput } from "src/common/dtos/pagination.dto";

@InputType()
export class SearchRestaurantInput extends PaginationInput{
  @Field(type => String)
  query: string
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput{
  @Field(type => [Restaurant], { nullable: true })
  restaurants?: Restaurant[]
}
