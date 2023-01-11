import { Dish } from './../restaurants/entitites/dish.entity';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from './../restaurants/entitites/restaurant.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './order.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
  providers: [
    OrderService,
    OrderResolver
  ]
})
export class OrdersModule {}
