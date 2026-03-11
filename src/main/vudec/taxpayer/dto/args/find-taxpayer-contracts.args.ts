import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindTaxpayerContractsViewWhere {
  @Field(() => StringFilter)
  taxpayerId: StringFilter;

  @Field(() => StringFilter)
  organizationId: StringFilter;
}

@InputType({ isAbstract: true })
class FindTaxpayerContractsViewOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  taxpayerId: OrderByTypes;
}

@ArgsType()
export class FindTaxpayerContractsViewArgs extends FindArgs(FindTaxpayerContractsViewWhere, FindTaxpayerContractsViewOrderBy) {}
