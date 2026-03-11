import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindLotWhere {
  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => StringFilter)
  id: StringFilter;
}

@InputType({ isAbstract: true })
class FindLotOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  id: OrderByTypes;
}

@ArgsType()
export class FindLotArgs extends FindArgs(FindLotWhere, FindLotOrderBy) {}
