import { MyRestaurantInput, MyRestaurantOutput } from './dto/myRestaurant';
import { MyRestaurantsOutput } from './dto/my-restaurants.dto';
import { DeleteDishOuput, DeleteDishInput } from './dto/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';
import { Dish } from './entitites/dish.entity';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dto/search-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { CategoryRepository } from './repositories/category.repository';
import { EditRestaurantInput, EditRestaurantOutput } from './dto/edit-restaurant.dto';
import { Category } from './entitites/category.entity';
import { CreateRestauranOutput } from './dto/create-restaurant.dto';
// import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateRestaurantInput } from './dto/create-restaurant.dto';
import { Restaurant } from './entitites/restaurant.entity';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Raw, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dto/delete-restaurant.dto';
import { AllCategoriesOutput } from './dto/all-categories.dto';

@Injectable()
export class RestaurantService{
  constructor(
    @InjectRepository(Restaurant) 
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(CategoryRepository) 
    // private readonly categories: Repository<Category>
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>
  ){

  }

  getAll(): Promise<Restaurant[]>{
    return this.restaurants.find()
  }

  async createRestaurant(owner: User,createRestaurantInput: CreateRestaurantInput): Promise<CreateRestauranOutput>{
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput)
      newRestaurant.owner = owner
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName
      )
      newRestaurant.category = category
      await this.restaurants.save(newRestaurant)
      return {
        ok: true,
        restaurantId: newRestaurant.id
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant'
      }
    }
  }

  async editRestaurant(
    owener: User, 
    editRestaurantInput:EditRestaurantInput
  ): Promise<EditRestaurantOutput>{
    try {
      const restaurant = await this.restaurants.findOneOrFail(
        editRestaurantInput.restaurantId,{
          loadRelationIds: true
        }
      )
      if(!restaurant){
        return {
          ok: false,
          error: 'Restaurant not found'
        }
      }

      if(owener.id !== restaurant.ownerId){
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own"
        }
      }
      let category: Category = null
      if(editRestaurantInput.categoryName){
        category = await this.categories.getOrCreate(editRestaurantInput.categoryName)
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category })
        }
    ])

      return {
        ok: true
      }
    } catch (error) {
      console.log(error)
      return {
        ok: false,
        error: 'Could not edit Restaurant'
      }
    }
  }

  async deleteRestaurant(
    owner:User, 
    { restaurantId }: DeleteRestaurantInput
  ):Promise<DeleteRestaurantOutput>{
    try {
      const restaurant = await this.restaurants.findOne(
        restaurantId
      )
      if(!restaurant){
        return {
          ok: false,
          error: 'Restaurant not found'
        }
      }
      if(owner.id !== restaurant.ownerId){
        return {
          ok: false,
          error: `You can't delete a restaurant that you don't own`
        }
      }

      // await this.restaurants.delete(restaurantId)
      console.log(restaurant)
      return {
        ok: true
      }

    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete restaurant'
      }
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find()
      return {
        ok: true,
        categories
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load categories'
      }
    }
  }

  countRestaurants(category: Category){
    return this.restaurants.count({ category })
  }

  async findCategoryBySlug({ slug, page }: CategoryInput):Promise<CategoryOutput>{
    try {
      const category = await this.categories.findOne(
        { slug },
        // { relations: ['restaurants'] }  
      )
      if(!category){
        return {
          ok: false,
          error: "Category not found"
        }
      }

      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        order:{
          isPromoted: 'DESC'
        },
        take: 25,
        skip: (page - 1) * 25
      })
      category.restaurants = restaurants
      const totalResults = await this.countRestaurants(category)

      return {
        ok: true,
        category,
        totalPages:  Math.ceil( totalResults / 25 ),
        restaurants
      }
    } catch (error) {
      return {
        ok: false,
        error: "Could not laod category"
      }
    }
  }

  async allRestaurants({ page }:RestaurantsInput): Promise<RestaurantsOutput>{
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({ 
        skip: (page - 1) * 25,
        take: 25,
        order: {
          isPromoted: "DESC"
        }
       })
       return {
         ok: true,
         results: restaurants,
         totalPages: Math.ceil(totalResults / 25),
         totalResults
       }
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurants'
      }
    }
  }

  async findRestaurantById(
    { restaurantId }: RestaurantInput
  ): Promise<RestaurantOutput>{
    try {
      const restaurant = await this.restaurants.findOne(restaurantId,{
        relations: ['menu']
      })
      if(!restaurant){
        return {
          ok: false,
          error: 'Restaurant not found'
        }
      }

      return {
        ok: true,
        restaurant
      }
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant'
      }
    }  
  }

  async searchRestaurantByName(
    { query, page }: SearchRestaurantInput
  ): Promise<SearchRestaurantOutput>{
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          // name: ILike(`%${query}%`)
          name: Raw(name => `${name} ILIKE '%${query}%'`)
        },
        skip: (page - 1) * 25,
        take: 25
      })
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25)
      }
    } catch {
      return {
        ok: false,
        error: 'Could not search for restaurants'
      }
    }
  }

  async createDish(
    owner:User, 
    createDishInput: CreateDishInput
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(createDishInput.restaurantId)
      if(!restaurant){
        return {
          ok: false,
          error: 'Restaurant not found'
        }
      }
      if(owner.id !== restaurant.ownerId){
        return {
          ok: false,
          error: `You can't do that.`
        }
      }
      await this.dishes.save(this.dishes.create({
        ...createDishInput,
        restaurant
      }))
      return {
        ok: true
      }
    } catch(error) {
      console.log(error)
      return {
        ok: false,
        error: `Could not create dish`
      }
    }
  }

  async editDish(owner:User, editDishInput:EditDishInput): Promise<EditDishOutput>{
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId,
        {
          relations: ['restaurant']
        })
      if(!dish){
        return {
          ok: false,
          error: 'Dish not found'
        }
      }
      if(dish.restaurant.ownerId !== owner.id){
        return {
          ok: false,
          error: "You can't do that."
        }
      }
      await this.dishes.save([{
        id: editDishInput.dishId,
        ...editDishInput
      }])
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish'
      }
    }
  }

  async deleteDish(
    owner:User, 
    {dishId}:DeleteDishInput): Promise<DeleteDishOuput>{
    try {
      const dish = await this.dishes.findOne(dishId,
        {
          relations: ['restaurant']
        })
      if(!dish){
        return {
          ok: false,
          error: 'Dish not found'
        }
      }
      if(dish.restaurant.ownerId !== owner.id){
        return {
          ok: false,
          error: "You can't do that."
        }
      }
  
      await this.dishes.delete(dishId)
      return {
        ok: true
      }
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish'
      }
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      // console.log(owner)
      // console.log(id)
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] },
      );
      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

}