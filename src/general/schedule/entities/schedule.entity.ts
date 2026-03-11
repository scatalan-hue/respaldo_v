import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { ScheduleType } from '../enums/schedule-type.enum';

@Entity({ name: 'grl_schedule' })
@ObjectType()
export class Schedule extends CrudEntity {
  @Field(() => String)
  @Column({ nullable: true })
  description: string;

  @Field(() => String)
  @Column({ nullable: true })
  name: string;

  @Field(() => String)
  @Column({ nullable: true })
  cronExpression: string;

  @Field(() => ScheduleType)
  @Column({ nullable: true })
  type: ScheduleType;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  active?: boolean;
}
