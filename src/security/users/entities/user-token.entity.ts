import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { User } from './user.entity';
@Entity({ name: 'sec_userToken' })
@ObjectType()
export class UserToken extends CrudEntity {
  @Column({ nullable: true })
  @Field(() => String)
  token?: string;

  @ManyToOne(() => User, (user) => user.id, { lazy: true, nullable: true })
  @Field(() => User, { nullable: true })
  user?: User;
}
