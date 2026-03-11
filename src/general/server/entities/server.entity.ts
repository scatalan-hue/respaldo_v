import { Column, Entity } from 'typeorm';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity('grl_server')
@ObjectType()
export class Server extends CrudEntity {
  @Column({ unique: true })
  @Field(() => String)
  code: string;

  @Column()
  @Field(() => String)
  description: string;

  @Column()
  @Field(() => String)
  host: string;

  @Column()
  @Field(() => Int)
  port: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  url?: string;

  @Column()
  @Field(() => Boolean)
  secure: boolean;
}
