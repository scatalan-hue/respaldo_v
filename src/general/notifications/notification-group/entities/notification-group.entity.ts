import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { StateNotificationGroup } from '../enums/state-notification-group.enum';
import { NotificationConfig } from '../../notification-config/entities/notification-config.entity';
import { TypeNotificationGroup } from '../enums/type-notification-group.enum';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';
import { Group } from '../../../../security/groups/entities/groups.entity';

@Entity({ name: 'msg_notificationGroup' })
@ObjectType()
export class NotificationGroup extends CrudEntity {
  @Column()
  @Field(() => String)
  name: string;

  @Column({ default: TypeNotificationGroup.Automatic })
  @Field(() => TypeNotificationGroup)
  typeNotificationGroup: TypeNotificationGroup;

  @Column({ default: StateNotificationGroup.Draft })
  @Field(() => StateNotificationGroup)
  stateNotificationGroup: StateNotificationGroup;

  @ManyToOne(() => NotificationConfig, (item) => item.id, { lazy: true })
  @Field(() => NotificationConfig)
  notificationConfig: NotificationConfig;

  @ManyToOne(() => Group, (item) => item.id, { lazy: true })
  @Field(() => Group)
  group: Group;
}
