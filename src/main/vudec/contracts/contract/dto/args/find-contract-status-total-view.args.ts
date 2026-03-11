import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { StringFilter } from 'src/patterns/crud-pattern/classes/inputs/string-filter.input';
import { FindArgs } from 'src/patterns/crud-pattern/mixins/find-args.mixin';

@InputType({ isAbstract: true })
export class FindContractStatusTotalViewWhere {
  @Field(() => StringFilter)
  id: StringFilter;

  @Field(() => StringFilter)
  organizationId: StringFilter;
}

// @InputType({ isAbstract: true })
// class FindContractStatusTotalViewOrderBy {}

@ArgsType()
export class FindContractStatusTotalViewArgs extends FindArgs(FindContractStatusTotalViewWhere, null) {}
