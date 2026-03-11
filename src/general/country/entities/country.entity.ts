import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { User } from '../../../security/users/entities/user.entity';

@Entity({ name: 'grl_country' })
@ObjectType()
export class Country extends CrudEntity {
  @Column()
  @Field(() => Int)
  code: number;

  @Column()
  @Field(() => String)
  name: string;

  @OneToMany(() => User, (user) => user.country, { lazy: true })
  user: User[];
}
