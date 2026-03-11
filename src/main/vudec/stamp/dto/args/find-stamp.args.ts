import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';
import { StampStatus } from '../../enum/stamp-status.enum';
import { DateFilter } from 'src/patterns/crud-pattern/classes/inputs/date-filter.input';

@InputType({ isAbstract: true })
class FindStampWhere {
  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => StringFilter)
  stampNumber: StringFilter;
    
  @Field(() => StampStatus)
  status: StampStatus;

  @Field(() => DateFilter)
  createdAt: DateFilter;
}

@InputType({ isAbstract: true })
class FindStampOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  stampNumber: OrderByTypes;
}

@ArgsType()
export class FindStampArgs extends FindArgs(FindStampWhere, FindStampOrderBy) {
  @IsOptional()
  @Field(() => ID, { nullable: true })
  contractId: string;
}
