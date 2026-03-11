import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { StringFilter } from '../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../patterns/crud-pattern/mixins/find-args.mixin';
import { DateFilter } from '../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { NumberFilter } from '../../../../../patterns/crud-pattern/classes/inputs/number-filter.input';
import { NotificationTypes } from '../../enums/notification-type.enum';

@InputType({ isAbstract: true })
class FindNotificationConfigsWhere {
  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => NotificationTypes)
  type: NotificationTypes;

  @Field(() => String)
  subtype: string;

  @Field(() => Boolean)
  hasEmail: boolean;

  @Field(() => Boolean)
  hasSms: boolean;

  @Field(() => Boolean)
  hasWss: boolean;

  @Field(() => Boolean)
  hasPush: boolean;

  @Field(() => Boolean)
  hasSubscription: boolean;

  @Field(() => Boolean)
  hasPersistent: boolean;

  @Field(() => DateFilter)
  persistentExpiration: DateFilter;
}

@InputType({ isAbstract: true })
class FindNotificationConfigsOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  name: OrderByTypes;

  @Field(() => OrderByTypes)
  type: OrderByTypes;

  @Field(() => OrderByTypes)
  subtype: OrderByTypes;

  @Field(() => OrderByTypes)
  hasEmail: OrderByTypes;

  @Field(() => OrderByTypes)
  hasSms: OrderByTypes;

  @Field(() => OrderByTypes)
  hasWss: OrderByTypes;

  @Field(() => OrderByTypes)
  hasPush: OrderByTypes;

  @Field(() => OrderByTypes)
  hasSubscription: OrderByTypes;

  @Field(() => OrderByTypes)
  hasPersistent: OrderByTypes;

  @Field(() => OrderByTypes)
  persistentExpiration: OrderByTypes;
}

@ArgsType()
export class FindNotificationConfigArgs extends FindArgs(FindNotificationConfigsWhere, FindNotificationConfigsOrderBy) {
  @Field(() => ID, { nullable: true })
  profileId?: string;
}
