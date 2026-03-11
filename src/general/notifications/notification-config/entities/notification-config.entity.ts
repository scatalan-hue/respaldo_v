import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { NotificationTypes } from '../enums/notification-type.enum';
import { CrudEntity } from '../../../../patterns/crud-pattern/entities/crud-entity';
import { Profile } from '../../../../external-api/certimails/profile/entities/profile.entity';

@Entity({ name: 'msg_notificationConfig' })
@ObjectType()
export class NotificationConfig extends CrudEntity {
  @Column()
  @Field(() => String)
  name: string;

  @ManyToOne(() => Profile, (item) => item.id, { lazy: true })
  @Field(() => Profile)
  profile: Profile;

  @Column()
  @Field(() => NotificationTypes)
  type: NotificationTypes;

  @Column()
  @Field(() => String)
  subtype: string;

  @Column({ default: false })
  @Field(() => Boolean)
  hasEmail: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasTwoStepsEmail: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasSms: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasTwoStepsSms: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasWss: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasTwoStepsWss: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasPush: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasSubscription: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasTwoStepsPush: boolean;

  @Column({ nullable: true })
  @Field(() => ID, { nullable: true })
  emailPrincipalCode?: string;

  @Column({ nullable: true })
  @Field(() => ID, { nullable: true })
  emailDuplicateCode?: string;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  @Field(() => String, { nullable: true })
  smsBody?: string;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  @Field(() => String, { nullable: true })
  subcriptionBody?: string;

  @Column({ nullable: true })
  @Field(() => ID, { nullable: true })
  wssCode?: string;

  @Column({ default: false })
  @Field(() => Boolean)
  hasPersistent: boolean;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  persistentExpiration?: Date;

  @Column({ type: 'varchar', length: 'max', nullable: true })
  @Field(() => String, { nullable: true })
  persistentHtml?: string;
}
