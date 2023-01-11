import { CoreOutput } from './../../common/dtos/output.dto';
import { Restaurant } from './../entitites/restaurant.entity';
import { ArgsType, Field, InputType, Int, ObjectType, OmitType, PickType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";

// @InputType()
// // export class CreateRestaurantInput extends OmitType(Restaurant,["id","category","owner"]){

// // }
// export class CreateRestaurantInput extends PickType(Restaurant,["name","coverImg","address"]){
//   @Field(type => String)
//   categoryName: string
// }

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(type => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestauranOutput extends CoreOutput{
  @Field(type => Int)
  restaurantId?: number;
}

// @InputType()
// export class CreateRestauranDto extends OmitType(Restaurant, ["id"], InputType){
  // @Field(type => String)
  // @IsString()
  // @Length(5, 10)
  // name: string

  // @Field(type => Boolean)
  // @IsBoolean()
  // isVegan: boolean

  // @Field(type => String)
  // @IsString()
  // address: string

  // @Field(type => String)
  // @IsString()
  // ownersName: string
// }

// @ArgsType()
// export class CreateRestauranDto2{
//   @Field(type => String)
//   @IsString()
//   @Length(5, 10)
//   name: string

//   @Field(type => Boolean)
//   @IsBoolean()
//   isVegan: boolean

//   @Field(type => String)
//   @IsString()
//   address: string

//   @Field(type => String)
//   @IsString()
//   ownersName: string
// }