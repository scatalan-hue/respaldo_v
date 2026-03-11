import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { NumberFilter } from 'src/patterns/crud-pattern/classes/inputs/number-filter.input';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindTaxpayerWhere {
  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => StringFilter)
  taxpayerNumber: StringFilter;
}

@InputType({ isAbstract: true })
class FindTaxpayerOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindTaxpayerArgs extends FindArgs(FindTaxpayerWhere, FindTaxpayerOrderBy) {}
