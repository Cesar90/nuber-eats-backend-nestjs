import { MailService } from './../mail/mail.service';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOuput } from './dtos/verify-email.dto';
import { Verification } from './entities/verification.entity';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { JwtService } from './../jwt/jwt.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken'
import { User } from "./entities/user.entity";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService{
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
    // private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ){
    // console.log(this.config.get('SECRET_KEY'))
    // console.log(this.jwtService.hello())
  }
  //Promise<[boolean, string?]
  // async createAccount({ email, password, role }: CreateAccountInput): Promise<{ok:boolean,error?: string  }> {
  //   // check new user
  //   // create user & hash the password
  //   try {
  //     const exists = await this.users.findOne({ email })
  //     if(exists){
  //       return {
  //         ok: false,
  //         error: "There is a user with that email already"
  //       }
  //     }
  //     const user = await this.users.save(this.users.create({ email, password, role }))
  //     await this.verifications.save(this.verifications.create({
  //       user
  //     }))
  //     return {
  //       ok: true
  //     }
  //   } catch (e) {
  //     //make error
  //       return {
  //         ok: false,
  //         error: `Couldn't create account`
  //       }
  //   }
  // }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code)
      // this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  // async login({ email, password }: LoginInput): Promise<{ok:boolean,error?: string, token?:string  }>{
  //   try {
  //     const user = await this.users.findOne({ email },{ select: ['id','password'] })
  //     if(!user){
  //       return {
  //         ok: false,
  //         error: 'User not found'
  //       }
  //     }
  //     const passwordCorrect = await user.checkPassword(password)
  //     if(!passwordCorrect){
  //       return {
  //         ok: false,
  //         error: "Wrong password"
  //       }
  //     }
  //     // const token = jwt.sign({id:user.id}, this.config.get('SECRET_KEY'))
  //     const token = this.jwtService.sign(user.id)
  //     return {
  //       ok: true,
  //       token
  //     }
  //   } catch (error) {
  //     return {
  //       ok: false,
  //       error
  //     }
  //   }
  // }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }

      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Can't log user in.",
      };
    }
  }

  // async findById(id:number): Promise<User>{
  //   return await this.users.findOne({ id })
  // }
  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }

  async verifyEmail(code:string): Promise<VerifyEmailOuput>{
    try {
      const verification = await this.verifications.findOne(
        {code},
        // { loadRelationIds: true }
        { relations: ['user'] }
      )
      if(verification){
        // console.log(verification, verification.user)
        verification.user.verified = true
        await this.users.save(verification.user)
        await this.verifications.delete(verification.id)
        return { ok: true }
      }
      throw new Error()
    } catch (error) {
      console.log(error)
      return { ok: false, error }
    }
  }
}