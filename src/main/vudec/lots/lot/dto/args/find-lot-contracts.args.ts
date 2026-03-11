import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';
import { NumberFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/number-filter.input';

@InputType({ isAbstract: true })
class FindLotContractsViewWhere {
  @Field(() => StringFilter, { nullable: true })
  lotId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  lotName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayerId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  productName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractConsecutive: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayerNumber: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayerName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  status: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  movementsCount: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  liquidatedTotal: StringFilter;
}

@InputType({ isAbstract: true })
class FindLotContractsViewOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;

  @Field(() => OrderByTypes)
  lotId: OrderByTypes;
}

@ArgsType()
export class FindLotContractsViewArgs extends FindArgs(FindLotContractsViewWhere, FindLotContractsViewOrderBy) {
  @Field(() => String, { nullable: true })
  lotId?: string;

  @Field(() => String, { nullable: true })
  contractId?: string;

  @Field(() => String, { nullable: true })
  taxpayerId?: string;
}
