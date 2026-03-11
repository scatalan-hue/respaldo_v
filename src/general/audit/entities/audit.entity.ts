import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { StandardActions } from '../../../patterns/crud-pattern/enums/standard-actions.enum';
import { User } from '../../../security/users/entities/user.entity';
import { ActionTypeAudit } from '../enums/action-audit.enum';

@Entity({ name: 'grl_audit' })
@ObjectType()
export class Audit extends CrudEntity {
  @ManyToOne(() => User, (user) => user.id, { lazy: true, nullable: true })
  @Field(() => User, { nullable: true })
  user: User;

  @Column()
  @Field(() => StandardActions)
  action: StandardActions;

  @Column()
  @Field(() => ActionTypeAudit)
  type: ActionTypeAudit;

  @Column({ type: 'varchar', length: 'max' })
  @Field(() => String)
  message: string;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  @Field(() => String, { nullable: true })
  details?: Record<string, any>;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  @Field(() => String, { nullable: true })
  valueAfter?: String;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  @Field(() => String, { nullable: true })
  valueBefore?: String;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  ip?: string;
}
