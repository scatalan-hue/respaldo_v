import { ArgsType } from '@nestjs/graphql';
import { FindArgs } from '../../mixins/find-args.mixin';

@ArgsType()
export class DefaultArgs extends FindArgs() {}
