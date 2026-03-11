import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { DateFilter } from '../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { StringFilter } from '../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindMovementViewWhere {
  @Field(() => StringFilter, { nullable: true })
  expenditureNumber: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  stampName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  type: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  status: StringFilter;

  @Field(() => DateFilter, { nullable: true })
  movementDate: DateFilter;

  @Field(() => DateFilter, { nullable: true })
  createdAt: DateFilter;

  @Field(() => StringFilter, { nullable: true })
  liquidatedValue: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  value: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  paidValue: StringFilter;
}

@InputType({ isAbstract: true })
class FindMovementViewOrderBy {
  @Field(() => OrderByTypes)
  status: OrderByTypes;

  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  movementDate: OrderByTypes;
}

@ArgsType()
export class FindMovementViewArgs extends FindArgs(FindMovementViewWhere, FindMovementViewOrderBy) {
  @IsOptional()
  @Field(() => ID, { nullable: true })
  lotId: string;

  @IsOptional()
  @Field(() => ID, { nullable: true })
  contractId: string;
}
