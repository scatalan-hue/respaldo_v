import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from '../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindMovementPaymentViewWhere {
  @Field(() => StringFilter, { nullable: true })
  id: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  expenditureNumber: StringFilter;
}

@InputType({ isAbstract: true })
class FindMovementPaymentViewOrderBy {
  @Field(() => OrderByTypes)
  date: OrderByTypes;

  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindMovementPaymentViewArgs extends FindArgs(FindMovementPaymentViewWhere, FindMovementPaymentViewOrderBy) {}
