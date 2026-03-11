import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { StringFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
export class FindContractViewWhere {
  @Field(() => StringFilter, { nullable: true })
  organizationId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  lotId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayerId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  status: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  lotName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  productName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractConsecutive: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayerNumber: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayerName: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  movementsCount: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractValue: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  liquidatedTotal: StringFilter;
}

@InputType({ isAbstract: true })
class FindContractViewOrderBy {
  @Field(() => OrderByTypes)
  status: OrderByTypes;

  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindContractViewArgs extends FindArgs(FindContractViewWhere, FindContractViewOrderBy) {
  @IsOptional()
  @Field(() => ID, { nullable: true })
  lotId: string;

  @IsOptional()
  @Field(() => ID, { nullable: true })
  organizationId: string;

  @IsOptional()
  @Field(() => ID, { nullable: true })
  taxpayerId: string;
}
