import { Verification } from './../entities/verification.entity';
import { ArgsType, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from './../../common/dtos/output.dto';

@ObjectType()
export class VerifyEmailOuput extends CoreOutput{

}

@InputType()
export class VerifyEmailInput extends PickType(Verification,['code']){

}