import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';

import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Public } from 'src/security/auth/decorators/public.decorator';
import { FindStampArgs } from '../dto/args/find-stamp.args';
import { Stamp } from '../entity/stamp.entity';
import { StampService, serviceStructure } from '../services/stamp.service';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: StampService,
  create: { name: 'createStamp', decorators: [Public] },
  update: { name: 'updateStamp', decorators: [Public] },
  findOne: { name: 'stamp', decorators: [Public] },
  findAll: { name: 'stamps', decorators: [Public] },
  findArgsType: FindStampArgs,
});

@Resolver(() => Stamp)
export class StampResolver extends CrudResolverFrom(resolverStructure) {

  @Mutation(() => Stamp, { name: "inactivateStamp" })
  @AnyUser()
  async inactivateStamp(
    @CurrentContext() context: IContext,
    @Args('id') id: string
  ): Promise<Stamp> {
    return await this.service.inactivateStamp(context, id);
  }
}
