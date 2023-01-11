import { TakeOrderOutput, TakeOrderInput } from './dtos/take-order.dto';
import { PUB_SUB, NEW_PENDING_ORDER, NEW_COOKED_ORDER, NEW_ORDER_UPDATE } from './../common/common.constants';
import { GetOrderOutput, GetOrderInput } from './dtos/get-order.dto';
import { GetOrdersOuput, GetOrdersInput } from './dtos/get-orders.dto';
import { Role } from './../auth/role.decorator';
import { AuthUser } from './../auth/auth-user.decorator';
import { OrderService } from './order.service';
import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { Order } from "./entities/order.entity";
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { OrderUpdatesInput } from './dtos/order-updates.dto';

// const pubSub = new PubSub()

@Resolver(of => Order)
export class OrderResolver{
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub : PubSub
  ){}

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput)
  }

  @Query(returns => GetOrdersOuput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args("input") getOrdersInput: GetOrdersInput
  ): Promise<GetOrdersOuput>{
    return this.ordersService.getOrders(user, getOrdersInput)
  }

  @Query(returns => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput:GetOrderInput
  ): Promise<GetOrderOutput>{
    return this.ordersService.getOrder(user, getOrderInput)
  }

  @Mutation(returns => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput
  ): Promise<EditOrderOutput>{
    return this.ordersService.editOrder(user, editOrderInput)
  }

  // @Mutation(returns => Boolean)
  // potatoReady(){
  //   pubSub.publish("hotPotatos", {
  //     readyPotato: "Your potato is ready. love you"
  //   })
  //   return true
  // }

  // @Subscription(returns => String)
  // readyPotato(){
  //   return pubSub.asyncIterator("hotPotatos")
  // }

  @Mutation(returns => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number){
    await this.pubSub.publish('hotPotatos', {
      readyPotato: potatoId
    })
    return true
  }

  @Subscription(returns => String, {
    filter:({readyPotato}, { potatoId }, context) =>{
      return readyPotato === potatoId
    },
    resolve:({ readyPotato }) => `Your potato with the id ${readyPotato} is ready`
  })
  @Role(["Any"])
  readyPotato(@Args('potatoId') potatoId: number){
    return this.pubSub.asyncIterator("hotPotatos")
  }

  @Subscription(returns => Order,{
    filter:({ pendingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id
    },
    resolve:({ pendingOrders: { order } }) => {
      return order
    }
  })
  @Role(["Owner"])
  pendingOrders(){
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER)
  }

  @Subscription(returns => Order)
  @Role(["Delivery"])
  cookedOrders(){
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER)
  }

  // @Subscription(returns => Order,{
  //   filter:(
  //     { orderUpdates: order }: { orderUpdates: Order }, 
  //     { input }: { input: OrderUpdatesInput }, 
  //     { user }: { user: User } ) => {
  //     console.log(order)
  //     console.log(user)
  //     console.log(input)
  //     if(
  //       order.driverId !== user.id && 
  //       order.customerId !== user.id &&
  //       order.restaurant.ownerId !== user.id){
  //         return false
  //     }
  //     return order.id === input.id
  //   }
  // })
  // @Role(["Any"])
  // orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput){
  //   return this.pubSub.asyncIterator(NEW_ORDER_UPDATE)
  // }
  @Subscription(returns => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(returns => TakeOrderOutput)
  @Role(["Delivery"])
  takeOrder(
    @AuthUser() driver: User,
    @Args("Input") takeOrderInput: TakeOrderInput): 
  Promise<TakeOrderOutput>{
    return this.ordersService.takeOrder(driver, takeOrderInput)
  }
}