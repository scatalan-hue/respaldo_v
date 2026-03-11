import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { DateFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { StringFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindOrganizationViewWhere {
  @Field(() => StringFilter)
  id: StringFilter;

  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => DateFilter)
  createdAt: DateFilter;

  @Field(() => StringFilter)
  organizationId: StringFilter;

  @Field(() => StringFilter)
  productId: StringFilter;

  @Field(() => StringFilter)
  nit: StringFilter;

  @Field(() => StringFilter)
  orderType: string;

  @Field(() => StringFilter)
  department: string;

  @Field(() => StringFilter)
  city: string;

  @Field(() => StringFilter)
  organizationParent: string;
}

@InputType({ isAbstract: true })
class FindOrganizationViewOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindOrganizationViewArgs extends FindArgs(FindOrganizationViewWhere, FindOrganizationViewOrderBy) {}
