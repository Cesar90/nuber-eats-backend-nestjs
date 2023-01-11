import { MyRestaurantOutput, MyRestaurantInput } from './dto/myRestaurant';
import { DeleteDishOuput, DeleteDishInput } from './dto/delete-dish.dto';
import { EditDishOutput, EditDishInput } from './dto/edit-dish.dto';
import { CreateDishOutput, CreateDishInput } from './dto/create-dish.dto';
import { Dish } from './entitites/dish.entity';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dto/search-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { Category } from './entitites/category.entity';
import { DeleteRestaurantOutput, DeleteRestaurantInput } from './dto/delete-restaurant.dto';
import { EditRestaurantOutput, EditRestaurantInput } from './dto/edit-restaurant.dto';
import { CreateRestauranOutput } from './dto/create-restaurant.dto';
// import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantService } from './restaurants.service';
import { Resolver, Query, Args, Mutation, ResolveField, Int, Parent } from "@nestjs/graphql";
import { CreateRestaurantInput } from "./dto/create-restaurant.dto";
import { Restaurant } from "./entitites/restaurant.entity";
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/auth/role.decorator';
import { RestaurantsOutput, RestaurantsInput } from './dto/restaurants.dto';
import { MyRestaurantsOutput } from './dto/my-restaurants.dto';

@Resolver(of => Restaurant)
export class RestaturanResolver{
  constructor(private readonly restauranService: RestaurantService) {
    
  }

  @Query(returns => Boolean)
  isPizzaGod(): Boolean{
    return true
  }
  @Query(returns => Restaurant)
  myRestaurant2(){
    return {
      name: "Cesar",
      isGood: true,
      lastName: "test"
    }
  }

  // @Query(returns => [Restaurant])
  // restaurans(@Args('veganOnly') veganOnly: Boolean ): Promise<Restaurant[]>{
  //   console.log(veganOnly)
  //   return this.restauranService.getAll()
  // }

  @Query(returns => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsOutput> {
    return this.restauranService.myRestaurants(owner)
  }

  @Query(returns => MyRestaurantOutput)
  @Role(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restauranService.myRestaurant(owner, myRestaurantInput);
  }

  @Mutation(returns => CreateRestauranOutput)
  // @SetMetadata("role", UserRole.Owner)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput
  ): Promise<CreateRestauranOutput>{
    return await this.restauranService.createRestaurant(
      authUser,
      createRestaurantInput
    )
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(["Owner"])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    return this.restauranService.editRestaurant(owner, editRestaurantInput)
    // return {
    //   ok:true
    // }
  }

  // @Mutation(returns => Boolean)
  // createRestauran(
  //   @Args('createRestauranInput') createRestauranInput: CreateRestauranDto
  // ): Boolean{
  //   console.log(createRestauranInput)
  //   return true
  // }

  // @Mutation(returns => Boolean)
  // createRestauran2(
  //   @Args() createRestauranInput: CreateRestauranDto2
  // ):Boolean{
  //   return true
  // }
  // @Mutation(returns => Boolean)
  // async createRestaurant(
  //   @Args('input') createRestauranDto: CreateRestauranDto
  // ): Promise<boolean>{
  //   try {
  //     await this.restauranService.createRestaurant(createRestauranDto)
  //     return true
  //   } catch (e) {
  //     console.log(e)
  //     return false
  //   }
  // }

  // @Mutation(returns => Boolean)
  // async updateRestaurant(
  //   // @Args('id') id:number,
  //   // @Args('data') data: UpdateRestaurantDto
  //   @Args() updateRestaurantDto: UpdateRestaurantDto
  // ): Promise<boolean> {
  //   try {
  //     await this.restauranService.updateRestaurant(updateRestaurantDto)
  //     return true
  //   } catch (e) {
  //     console.log(e)
  //     return false
  //   }
  // }
  @Mutation(returns => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input')  deleteRestaurantInput:DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput>{
    return this.restauranService.deleteRestaurant(owner, deleteRestaurantInput)
  }

  @Query(returns => RestaurantsOutput)
  restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput>{
    return this.restauranService.allRestaurants(restaurantsInput)
  }

  @Query(returns => RestaurantOutput)
  restaurant(
    @Args('input') restaurantInput: RestaurantInput
  ): Promise<RestaurantOutput>{
    return this.restauranService.findRestaurantById(restaurantInput)
  }

  @Query(returns => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput
  ): Promise<SearchRestaurantOutput>{
    return this.restauranService.searchRestaurantByName(searchRestaurantInput)
  }
}

@Resolver(of => Category)
export class CategoryResolver{
  constructor(private readonly restauranService: RestaurantService) {}

  @ResolveField(type => Int)
  restaurantCount(@Parent() category: Category ): Promise<number>{
    return this.restauranService.countRestaurants(category)
  }

  @Query(returns => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restauranService.allCategories()
  }

  @Query(type => CategoryOutput)
  category(@Args('input') categoryInput: CategoryInput):Promise<CategoryOutput>{
    return this.restauranService.findCategoryBySlug(categoryInput)
  }
}

@Resolver(of => Dish)
export class DishResolver{
  constructor(private readonly restaurantService: RestaurantService){}

  @Mutation(type => CreateDishOutput)
  @Role(["Owner"])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput
  ): Promise<CreateDishOutput>{
    return this.restaurantService.createDish(owner, createDishInput)
  }

  @Mutation(type => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput)
  }

  @Mutation(type => DeleteDishOuput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput
  ): Promise<EditDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput)
  }

}