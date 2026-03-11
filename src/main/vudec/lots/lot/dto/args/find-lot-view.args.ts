import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { DateFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { StringFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindLotViewWhere {
  @Field(() => StringFilter, { nullable: true })
  id: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  name: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  consecutive: StringFilter;

  @Field(() => DateFilter, { nullable: true })
  createdAt: DateFilter;

  @Field(() => StringFilter, { nullable: true })
  organizationId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  organizationParentId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  organizationName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  productId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  totalPending: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  totalSend: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  totalError: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  total: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  status: StringFilter;
}

@InputType({ isAbstract: true })
class FindLotViewOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  id: OrderByTypes;

  @Field(() => OrderByTypes)
  organizationName: OrderByTypes;
}

@ArgsType()
export class FindLotViewArgs extends FindArgs(FindLotViewWhere, FindLotViewOrderBy) {
}
