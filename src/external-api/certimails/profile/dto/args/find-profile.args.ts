import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { StringFilter } from '../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindProfilesWhere {
  @Field(() => StringFilter)
  firstName: StringFilter;

  @Field(() => StringFilter)
  lastName: StringFilter;

  @Field(() => StringFilter)
  email: StringFilter;

  @Field(() => StringFilter)
  phone: StringFilter;

  @Field(() => StringFilter)
  stateAws: StringFilter;

  @Field(() => Boolean)
  default: Boolean;
}

@InputType({ isAbstract: true })
class FindProfilesOrderBy {
  @Field(() => OrderByTypes)
  firstName: OrderByTypes;

  @Field(() => OrderByTypes)
  lastName: OrderByTypes;

  @Field(() => OrderByTypes)
  email: OrderByTypes;

  @Field(() => OrderByTypes)
  phone: OrderByTypes;

  @Field(() => OrderByTypes)
  stateAws: OrderByTypes;

  @Field(() => OrderByTypes)
  default: OrderByTypes;
}

@ArgsType()
export class FindProfileArgs extends FindArgs(FindProfilesWhere, FindProfilesOrderBy) {}
