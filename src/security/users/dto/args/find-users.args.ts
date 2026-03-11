import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { UserTypes } from '../../enums/user-type.enum';
import { StringFilter } from '../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
export class FindUsersWhere {
  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => StringFilter)
  email: StringFilter;

  @Field(() => StringFilter)
  type: StringFilter;

  @Field(() => Date)
  createdAt: Date;
}

@InputType({ isAbstract: true })
export class FindUsersOrderBy {
  @Field(() => OrderByTypes)
  name: OrderByTypes;

  @Field(() => OrderByTypes)
  email: OrderByTypes;

  @Field(() => OrderByTypes)
  createdAt!: OrderByTypes;
}

@ArgsType()
export class FindUserArgs extends FindArgs(FindUsersWhere, FindUsersOrderBy) {}
