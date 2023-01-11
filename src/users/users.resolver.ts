import { VerifyEmailInput, VerifyEmailOuput } from './dtos/verify-email.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { AuthGuard } from './../auth/auth.guard';
import { LoginOutput, LoginInput } from './dtos/login.dto';
import { CreateAccountOutput, CreateAccountInput } from './dtos/create-account.dto';
import { UsersService } from './users.service';
import { User } from "./entities/user.entity";
import { Resolver, Query, Args, Mutation, Context } from "@nestjs/graphql";
import { UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { Role } from 'src/auth/role.decorator';

@Resolver(of => User)
export class UsersResolver{
  constructor(private readonly usersService:UsersService){}

  @Query(returns => Boolean)
  hi(){
    return true
  }

  // @Mutation(returns => CreateAccountOutput)
  // async createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput>{
  //   try {
  //    return this.usersService.createAccount(createAccountInput)
      
  //   } catch (e) {
  //     return {
  //       error:e,
  //       ok: false
  //     }
  //   }
  // }

  @Mutation(returns => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }


  @Mutation(returns => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }


  // @Query(returns => User)
  // me(
  //   @Context() context
  // ){
  //   if(!context.user){
  //     return;
  //   } else {
  //     return context.user
  //   }
  // }
  @Query(returns => User)
  // @UseGuards(AuthGuard)
  @Role(['Any'])
  me(@AuthUser() authUser:User){
    return authUser
  }

  @Query(returns => UserProfileOutput)
  @Role(['Any'])
  // @UseGuards(AuthGuard)
  userProfile(@Args() userProfileInput:UserProfileInput): Promise<UserProfileOutput>{
    return this.usersService.findById(userProfileInput.userId)
    // try {
    //   const user = await this.usersService.findById(userProfileInput.userId)
    //   if(!user){
    //     throw Error()
    //   }
    //   return {
    //     ok: true,
    //     user
    //   }
    // } catch (error) {
    //   return {
    //     error: 'User Not Found',
    //     ok: false
    //   }
    // }
  }

  // @UseGuards(AuthGuard)
  @Mutation(returns => EditProfileOutput)
  @Role(['Any'])
  editProfile(
    @AuthUser() authUser:User,
    @Args('input') editProfileInput: EditProfileInput
  ): Promise<EditProfileOutput>{
    return this.usersService.editProfile(authUser.id, editProfileInput)
    // try {
    //   await this.usersService.editProfile(authUser.id, editProfileInput)
    //   return {
    //     ok: true
    //   }
    // } catch (error) {
    //   return {
    //     ok: false,
    //     error
    //   }
    // }
  }

  @Mutation(returns => VerifyEmailOuput)
  verifyEmail(@Args('input') {code}: VerifyEmailInput): Promise<VerifyEmailOuput>{
    return this.usersService.verifyEmail(code)
    // try {
    //   this.usersService.verifyEmail(code)
    //   return {
    //     ok: true
    //   }
    // } catch (error) {
    //   return {
    //     ok: false,
    //     error,
    //   } 
    // }
  }
}