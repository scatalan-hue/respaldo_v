import { Args, Query, Resolver } from '@nestjs/graphql';

import { CurrentContext } from '../../../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../../security/auth/utils/crud.utils';
import { FindLotContractsViewArgs } from '../../dto/args/find-lot-contracts.args';
import { LotContractsView } from '../../entity/views/lot-contracts.view.entity';
import { LotContractsViewService, serviceStructure } from '../../services/views/lot-contracts.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: LotContractsViewService,
  findAll: {
    name: 'lotContractsView',
    decorators: [AnyUser],
  },
});

@Resolver(() => LotContractsView)
export class LotContractsViewResolver extends CrudResolverFrom(resolverStructure) {
  @Query(() => LotContractsView, { name: 'lotContractView' })
  async lotContractView(@CurrentContext() context: IContext, @Args(undefined, { type: () => FindLotContractsViewArgs }) args): Promise<LotContractsView> {
    const response = await this.service.lotContractView(context, args);
    return response;
  }
}
