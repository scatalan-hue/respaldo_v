import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { DateFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { StringFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../../patterns/crud-pattern/mixins/find-args.mixin';
import { TransactionAction } from '../../../transaction/enum/transaction-action.enum';
import { NumberFilter } from 'src/patterns/crud-pattern/classes/inputs/number-filter.input';

@InputType({ isAbstract: true })
class FindTransactionHistoryViewWhere {
  @Field(() => StringFilter, { nullable: true })
  id: StringFilter;

  @Field(() => DateFilter, { nullable: true })
  receptionDate: DateFilter;

  @Field(() => NumberFilter, { nullable: true })
  sequence: NumberFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayer: StringFilter;

  @Field(() => TransactionAction, { nullable: true })
  action: TransactionAction;

  @Field(() => StringFilter, { nullable: true })
  message: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  transactionId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractNumber: StringFilter;

  @Field(() => NumberFilter, { nullable: true })
  contractValue: NumberFilter;
}

@InputType({ isAbstract: true })
class FindTransactionHistoryViewOrderBy {
  @Field(() => OrderByTypes)
  id: OrderByTypes;

  @Field(() => OrderByTypes)
  receptionDate: OrderByTypes;
}

@ArgsType()
export class FindTransactionHistoryViewArgs extends FindArgs(FindTransactionHistoryViewWhere, FindTransactionHistoryViewOrderBy) {
}
