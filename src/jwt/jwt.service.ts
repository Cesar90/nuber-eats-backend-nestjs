import { CONFIG_OPTIONS } from './jwt.constants';
import * as jwt from 'jsonwebtoken'
import { JwtModuleOptions } from './jwt.interfaces';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
constructor(
  @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions
){
  console.log(options)
}

  hello(){
    console.log('hello')
  }

  // sign(payload:object):string{
  //   return jwt.sign(payload, this.options.privateKey)
  // }
  sign(userId:number):string{
    return jwt.sign({ id: userId }, this.options.privateKey)
  }

  verify(token: string){
    return jwt.verify(token, this.options.privateKey)
  }
}
