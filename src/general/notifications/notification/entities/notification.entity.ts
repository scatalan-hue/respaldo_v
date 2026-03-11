import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { StatePersistent } from '../enums/state-persistent.enum';
import { StateNotification } from '../enums/state-notification.enum';
import { TypeNotification } from '../enums/type-notification.enum';
import { NotificationConfig } from '../../notification-config/entities/notification-config.entity';
import { NotificationGroup } from '../../notification-group/entities/notification-group.entity';
import { User } from '../../../../security/users/entities/user.entity';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';

@Entity({ name: 'msg_notification' })
@ObjectType()
export class Notification extends CrudEntity {
  @Column()
  @Field(() => TypeNotification)
  type: TypeNotification;

  @ManyToOne(() => User, undefined, { lazy: true, nullable: true })
  @Field(() => User, { nullable: true })
  user?: User;

  @Column({ nullable: true, type: 'varchar', length: 'MAX' })
  @Field(() => String, { nullable: true })
  metadata?: string;

  @Column()
  @Field(() => Boolean)
  hasPersistent: boolean;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  persistentExpiration?: Date;

  @Column({ nullable: true })
  @Field(() => StatePersistent, { nullable: true })
  statePersistent?: StatePersistent;

  @Column({ default: StateNotification.Draft })
  @Field(() => StateNotification)
  stateNotification: StateNotification;

  @ManyToOne(() => NotificationConfig, undefined, { lazy: true })
  @Field(() => NotificationConfig)
  notificationConfig: NotificationConfig;

  @ManyToOne(() => NotificationGroup, undefined, { lazy: true, nullable: true })
  @Field(() => NotificationGroup, { nullable: true })
  notificationGroup?: NotificationGroup;

  @Column({ nullable: true })
  @Field(() => ID, { nullable: true })
  externalId?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  externalMessage?: string;
}
