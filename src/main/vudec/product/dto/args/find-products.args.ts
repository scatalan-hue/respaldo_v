import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { DateFilter } from '../../../../../patterns/crud-pattern/classes/inputs/date-filter.input';
import { OrderByTypes } from '../../../../../patterns/crud-pattern/enums/order-by-type.enum';
import { ProductName } from '../../enum/product-name.enum';
import { ProductStatus } from '../../enum/product-status.enum';
import { FindArgs } from '../../../../../patterns/crud-pattern/mixins/find-args.mixin';
import { StringFilter } from '../../../../../patterns/crud-pattern/classes/inputs/string-filter.input';

@InputType({ isAbstract: true })
class FindProductsWhere {
  @Field(() => [ProductName])
  name: ProductName[];

  @Field(() => DateFilter)
  createdAt: DateFilter;

  @Field(() => [ProductStatus])
  status: ProductStatus[];

  @Field(() => StringFilter)
  organization: StringFilter;
}

@InputType({ isAbstract: true })
class FindProductsOrderBy {
  @Field(() => OrderByTypes)
  createdAt!: OrderByTypes;
}

@ArgsType()
export class FindProductsArgs extends FindArgs(FindProductsWhere, FindProductsOrderBy) {}
