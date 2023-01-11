import { Dish } from './entitites/dish.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantService } from './restaurants.service';
import { Restaurant } from './entitites/restaurant.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaturanResolver, CategoryResolver, DishResolver } from './restaurants.resolver';
// import { Category } from './entitites/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository])],
  providers: [
    RestaturanResolver, 
    CategoryResolver,
    DishResolver,
    RestaurantService]
})
export class RestaurantsModule {}
