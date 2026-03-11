import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { DateFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { StringFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../../patterns/crud-pattern/mixins/find-args.mixin';
import { TransactionStatus } from '../../enum/transaction-status.enum';
import { TransactionAction } from '../../enum/transaction-action.enum';

@InputType({ isAbstract: true })
class FindTransactionViewWhere {
  @Field(() => StringFilter, { nullable: true })
  id: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  productId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  productName: StringFilter;

  @Field(() => DateFilter, { nullable: true })
  receptionDate: DateFilter;

  @Field(() => StringFilter, { nullable: true })
  document: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractNumber: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayer: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractValue: StringFilter;

  @Field(() => TransactionStatus, { nullable: true })
  status: TransactionStatus;

  @Field(() => StringFilter, { nullable: true })
  description: StringFilter;

  @Field(() => TransactionAction, { nullable: true })
  actionType: TransactionAction;

  @Field(() => StringFilter, { nullable: true })
  errorMessage: StringFilter;
}

@InputType({ isAbstract: true })
class FindTransactionViewOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  id: OrderByTypes;

  @Field(() => OrderByTypes)
  receptionDate: OrderByTypes;
}

@ArgsType()
export class FindTransactionViewArgs extends FindArgs(FindTransactionViewWhere, FindTransactionViewOrderBy) {
}
