import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { OrderByTypes } from '../../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from '../../../../../../patterns/crud-pattern/mixins/find-args.mixin';
import { StringFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';
import { DateFilter } from '../../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { ProductStatus } from '../../../../product/enum/product-status.enum';

@InputType({ isAbstract: true })
class FindProductDataWhere {
  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  name?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  key?: StringFilter;

  @Field(() => ProductStatus, { nullable: true })
  status?: ProductStatus;

  @Field(() => DateFilter, { nullable: true })
  createdAt?: DateFilter;
}

@InputType({ isAbstract: true })
class FindOrganizationDataWhere {
  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  name?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  identificationNumber?: StringFilter;

  @Field(() => DateFilter, { nullable: true })
  createdAt?: DateFilter;
}

@InputType({ isAbstract: true })
class FindOrganizationProductsWhere {
  @Field(() => FindOrganizationDataWhere)
  organization: FindOrganizationDataWhere;

  @Field(() => FindProductDataWhere)
  product: FindProductDataWhere;
}

@InputType({ isAbstract: true })
class FindOrganizationProductsOrderBy {
  @Field(() => OrderByTypes)
  createdAt: OrderByTypes;
}

@ArgsType()
export class FindOrganizationProductsArgs extends FindArgs(FindOrganizationProductsWhere, FindOrganizationProductsOrderBy) {}
