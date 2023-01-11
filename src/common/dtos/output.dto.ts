import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class MutationOutput{
  @Field(type => String,{nullable:true})
  error?:string
  @Field(type=> Boolean)
  ok: boolean
}

@ObjectType()
export class CoreOutput{
  @Field(type => String,{nullable:true})
  error?:string
  @Field(type=> Boolean)
  ok: boolean
}