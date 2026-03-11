import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'sec_user_key' })
@ObjectType()
export class UserKey extends CrudEntity {
  @Column()
  @Field(() => String)
  code: string;

  @Column({ nullable: true })
  @Field(() => Date)
  expirationCode: Date;

  @Column()
  @Field(() => String)
  origin: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  credentialId: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  organizationId: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  productId: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  taxpayerId: string;

  @ManyToOne(() => User, (user) => user.userKeys, {
    lazy: true,
    nullable: true,
  })
  @Field(() => User, { nullable: true })
  user: User;
}
