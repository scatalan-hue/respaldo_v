import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { FindArgs } from '../../../../../../patterns/crud-pattern/mixins/find-args.mixin';
import { StringFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';

@InputType({ isAbstract: true })
class FindContractHistoryWhere {
  @Field(() => StringFilter)
  id: StringFilter;

  @Field(() => StringFilter)
  consecutive: StringFilter;
}

@InputType({ isAbstract: true })
class FindContractHistoryOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindContractHistoryArgs extends FindArgs(FindContractHistoryWhere, FindContractHistoryOrderBy) {}
