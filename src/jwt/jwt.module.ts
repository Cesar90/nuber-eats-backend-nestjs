import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './interfaces/jwt-module-options.interface';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';

@Module({
  // providers: [JwtService]
})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule{
    return {
      module: JwtModule,
      exports: [JwtService],
      providers:[
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        JwtService
      ]
    }
  }
}
