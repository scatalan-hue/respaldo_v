import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';
import { DateFilter } from '../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { NumberFilter } from '../../../../../patterns/crud-pattern/classes/inputs/number-filter.input';

@InputType({ isAbstract: true })
class FindMovementWhere {
  @Field(() => StringFilter, { nullable: true })
  expenditureNumber: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  stampName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  type: StringFilter;

  @Field(() => DateFilter, { nullable: true })
  movementDate: DateFilter;

  @Field(() => StringFilter, { nullable: true })
  liquidatedValue: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  value: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  paidValue: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  status: StringFilter;
}

@InputType({ isAbstract: true })
class FindMovementOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindMovementArgs extends FindArgs(FindMovementWhere, FindMovementOrderBy) {}
