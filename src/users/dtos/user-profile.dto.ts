import { MutationOutput } from './../../common/dtos/output.dto';
import { ArgsType, Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput{
  @Field(type=> Number)
  userId: number
}

@ObjectType()
export class UserProfileOutput extends MutationOutput{
  @Field(type=>User, {nullable: true})
  user?: User
}