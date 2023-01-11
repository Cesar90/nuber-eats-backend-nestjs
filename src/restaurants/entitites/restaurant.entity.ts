import { Order } from '../../orders/entities/order.entity';
import { Dish } from './dish.entity';
import { User } from './../../users/entities/user.entity';
import { Category } from './category.entity';
import { CoreEntity } from './../../common/entities/core.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";

@InputType("RestaurantInputType",{ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity{
  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string

  @Field(type => String, { defaultValue: "a;a;a;a;a" })
  @Column()
  @IsString()
  address:string

  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category, 
    category => category.restaurants,
    { nullable: true, onDelete:"SET NULL", eager: true }
  )
  category: Category

  @Field(type => User)
  @ManyToOne(
    type => User, 
    user => user.restaurants
  )
  owner: User

  @Field(type => [Order])
  @OneToMany(
    type => Order,
    order => order.restaurant
  )
  orders: Order[]

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => [Dish])
  @OneToMany(
    type => Dish,
    dish => dish.restaurant
  )
  menu: Dish[]

  @Field(type => Boolean)
  @Column({ default: false })
  isPromoted: boolean

  @Field(type => Date)
  @Column({ nullable: true })
  promotedUntil: Date
  // @Field(type => Boolean, { nullable: true })
  // isGood?: boolean

  // @Field(type => Boolean, {defaultValue: true})
  // @Field(type => Boolean, {nullable: true, defaultValue: true})
  // @Column({default: true})
  // @IsBoolean()
  // @IsOptional()
  // isVegan: boolean

  // @Field(type => String)
  

  // @Field(type => String)
  // @Column()
  // ownerName: string

  // @Field(type => String)
  // @Column()
  // categoryName: string
}