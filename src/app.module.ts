import { Payment } from './payments/entities/payment.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { Dish } from './restaurants/entitites/dish.entity';
import { Category } from './restaurants/entitites/category.entity';
import { Verification } from './users/entities/verification.entity';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import * as Joi from 'joi'
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config';
import { Restaurant } from './restaurants/entitites/restaurant.entity';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: ".env"
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
      ignoreEnvFile: process.env.NODE_ENV === "prod",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required()
      })
    }),
    GraphQLModule.forRoot({
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql')
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      // context: ({req}) => ({
      //   user: req['user']
      // })
      context: ({req, connection}) =>{
        const TOKEN_KEY = 'x-jwt'
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY]
        }
      }
    }),
    TypeOrmModule.forRoot({
      type:"postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSOWORD,
      database: process.env.DB_NAME,
      // ...(process.env.DATABASE_URL
      //   ? { url: process.env.DATABASE_URL }
      //   : {
      //       host: process.env.DB_HOST,
      //       port: +process.env.DB_PORT,
      //       username: process.env.DB_USERNAME,
      //       password: process.env.DB_PASSWORD,
      //       database: process.env.DB_NAME,
      //     }),
      // entities:[Restaurant],
      entities:[
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment
      ],
      synchronize: process.env.NODE_ENV !== 'prod',
      // logging: true,
      
    }),
    ScheduleModule.forRoot(),
    RestaurantsModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL
    }),
    UsersModule,
    // MailModule,
    CommonModule,
    AuthModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    // JwtModule,
  ],
  controllers: [],
  providers: [],
})

//Example
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer){
//     consumer.apply(JwtMiddleware).exlude({
//       path: "/api",
//       method: RequestMethod.ALL
//     })
//   }
// }

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer){
//     consumer.apply(JwtMiddleware).forRoutes({
//       path: "/graphql",
//       method: RequestMethod.POST
//     })
//   }
// }
export class AppModule{

}