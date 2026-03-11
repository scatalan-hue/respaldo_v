import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { NumberFilter } from '../../../../../patterns/crud-pattern/classes/inputs/number-filter.input';
import { StringFilter } from '../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from '../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindTaxpayerViewWhere {
  @Field(() => StringFilter, { nullable: true })
  id: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  organizationId: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  taxpayerNumber: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  name: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  phone: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  email: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  contractCount: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  liquidatedTotal: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  paidTotal: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  totalPayable: StringFilter;
}

@InputType({ isAbstract: true })
class FindTaxpayerViewOrderBy {
  @Field(() => OrderByTypes)
  id: OrderByTypes;
}

@ArgsType()
export class FindTaxpayerViewArgs extends FindArgs(FindTaxpayerViewWhere, FindTaxpayerViewOrderBy) {}
