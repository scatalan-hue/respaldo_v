import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { CrudEntity } from '../../../patterns/crud-pattern/entities/crud-entity';
import { NotificationConfig } from '../../../general/notifications/notification-config/entities/notification-config.entity';
import { User } from '../../users/entities/user.entity';

@Entity('sec_group')
@ObjectType()
export class Group extends CrudEntity {
  @Column()
  @Field()
  name: string;

  @ManyToOne(() => NotificationConfig, (item) => item.id, {
    lazy: true,
    nullable: true,
  })
  @Field(() => NotificationConfig, { nullable: true })
  notificationConfig?: NotificationConfig;

  @ManyToMany(() => User, { lazy: true, nullable: true })
  @Field(() => [User], { nullable: true })
  @JoinTable({ name: 'sec_groupUser' })
  users?: User[];
}
