import { ArgsType } from '@nestjs/graphql';
import { FindArgs } from '../../../../patterns/crud-pattern/mixins/find-args.mixin';

@ArgsType()
export class FindSchedulesArgs extends FindArgs(null, null) {}
