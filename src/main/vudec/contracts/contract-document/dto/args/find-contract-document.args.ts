import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindContractDocumentWhere {
  @Field(() => StringFilter)
  id: StringFilter;

  @Field(() => StringFilter)
  transactionId: StringFilter;

  @Field(() => StringFilter)
  contractId: StringFilter;
}

@InputType({ isAbstract: true })
class FindContractDocumentOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindContractDocumentArgs extends FindArgs(FindContractDocumentWhere, FindContractDocumentOrderBy) {}
