import { Args, Query, Resolver } from '@nestjs/graphql';
import { MetadataPagination } from 'src/patterns/crud-pattern/classes/args/metadata-pagination.args';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { FindContractViewArgs } from '../../dto/args/find-contract-view.args';
import { ContractView } from '../../entity/views/contract.view.entity';
import { ContractViewService, serviceStructure } from '../../services/views/contract.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ContractViewService,
});

@Resolver(() => ContractView)
export class ContractViewResolver extends CrudResolverFrom(resolverStructure) {
  @AnyUser()
  @Query(() => [ContractView], { name: 'contractsView' })
  async contractsView(@CurrentContext() context: IContext, @Args(undefined, { type: () => FindContractViewArgs }) args): Promise<ContractView[]> {
    const response = await this.service.contractsView(context, args);
    return response;
  }

  @AnyUser()
  @Query(() => MetadataPagination, { name: 'contractsViewCount' })
  async Count(@CurrentContext() context: IContext, @Args(undefined, { type: () => FindContractViewArgs }) args): Promise<MetadataPagination> {
    return await this.service.contractsViewCount(context, args);
  }
}
