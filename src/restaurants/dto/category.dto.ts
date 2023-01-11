import { Restaurant } from './../entitites/restaurant.entity';
import { PaginationInput, PaginationOutput } from './../../common/dtos/pagination.dto';
import { Category } from './../entitites/category.entity';
import { CoreOutput } from './../../common/dtos/output.dto';
import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class CategoryInput extends PaginationInput{
  @Field(type => String)
  slug: string
}

@ObjectType()
export class CategoryOutput extends PaginationOutput{
  @Field(type => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
  @Field(type => Category, { nullable: true })
  category?: Category
}