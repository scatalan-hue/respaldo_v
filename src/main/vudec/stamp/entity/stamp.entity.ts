import { Field, ObjectType } from '@nestjs/graphql';
import { CrudEntity } from 'src/patterns/crud-pattern/entities/crud-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Movement } from '../../movement/entity/movement.entity';
import { StampStatus } from '../enum/stamp-status.enum';

@Entity('vudec_stamp')
@ObjectType()
export class Stamp extends CrudEntity {
  @Column({ unique: true })
  @Field(() => String, { nullable: false })
  stampNumber: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  name: string;

  @Column({ nullable: false, default: StampStatus.Active })
  @Field(() => StampStatus, { nullable: false })
  status: StampStatus;

  @Field(() => [Movement], { nullable: true })
  @OneToMany(() => Movement, (movement) => movement.stamp, {
    lazy: true,
  })
  movements: Movement[];
}
