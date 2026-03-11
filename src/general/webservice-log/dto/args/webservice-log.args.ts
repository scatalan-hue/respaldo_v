import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { OrderByTypes } from 'src/patterns/crud-pattern/enums/order-by-type.enum';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
class FindWebserviceLogWhere {
    @Field(() => StringFilter)
    id: StringFilter;

    @Field(() => StringFilter)
    transactionId: StringFilter;

    @Field(() => StringFilter)
    movementId: StringFilter;

    @Field(() => StringFilter)
    organizationProductId: StringFilter;
}

@InputType({ isAbstract: true })
class FindWebserviceLogOrderBy {
    @Field(() => OrderByTypes)
    createdAt: OrderByTypes;
}

@ArgsType()
export class FindWebserviceLogArgs extends FindArgs(FindWebserviceLogWhere, FindWebserviceLogOrderBy) {}
