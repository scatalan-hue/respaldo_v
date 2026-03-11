import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from '../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../patterns/crud-pattern/mixins/find-args.mixin';
import { DateFilter } from '../../../../patterns/crud-pattern/classes/inputs/date-filter.input';

@InputType({ isAbstract: true })
class FindUserViewWhere {
  @Field(() => StringFilter)
  type: StringFilter;

  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => StringFilter)
  lastName: StringFilter;

  @Field(() => StringFilter)
  fullName: StringFilter;

  @Field(() => StringFilter)
  email: StringFilter;

  @Field(() => StringFilter)
  phoneNumber: StringFilter;

  @Field(() => StringFilter)
  identificationType: StringFilter;

  @Field(() => StringFilter)
  identificationNumber: StringFilter;

  @Field(() => StringFilter)
  status: StringFilter;

  @Field(() => DateFilter)
  createdAt: DateFilter;

  @Field(() => DateFilter)
  updatedAt: DateFilter;

  @Field(() => DateFilter)
  credentialsExpirationDate: DateFilter;
}

@InputType({ isAbstract: true })
class FindUserViewOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  updatedAt: OrderByTypes;
}

@ArgsType()
export class FindUserViewArgs extends FindArgs(FindUserViewWhere, FindUserViewOrderBy) {}
