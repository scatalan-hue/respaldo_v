import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from '../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindMovementPaymentDetailsViewWhere {
  @Field(() => StringFilter, { nullable: true })
  expenditureNumber: StringFilter;
}

@InputType({ isAbstract: true })
class FindMovementPaymentDetailsViewOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindMovementPaymentDetailsViewArgs extends FindArgs(FindMovementPaymentDetailsViewWhere, FindMovementPaymentDetailsViewOrderBy) {}
