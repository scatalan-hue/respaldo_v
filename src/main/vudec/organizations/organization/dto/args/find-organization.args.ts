import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { DateFilter } from 'src/patterns/crud-pattern/classes/inputs/date-filter.input';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindOrganizationWhere {
  @Field(() => StringFilter)
  name: StringFilter;
  
  @Field(() => DateFilter)
  createdAt: DateFilter;

  @Field(() => StringFilter)
  nit: StringFilter;
}

@InputType({ isAbstract: true })
class FindOrganizationOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindOrganizationArgs extends FindArgs(FindOrganizationWhere, FindOrganizationOrderBy) {
  @Field(() => ID, { nullable: true })
  organizationParentId?: string;
}
