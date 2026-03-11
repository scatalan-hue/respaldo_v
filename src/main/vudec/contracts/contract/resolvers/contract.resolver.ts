import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';

import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { CurrentContext } from '../../../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { ExternalApiKey } from '../../../../../security/decorators/external-api-key.decorator';
import { Lot } from '../../../lots/lot/entity/lot.entity';
import { Organization } from '../../../organizations/organization/entity/organization.entity';
import { FindContractArgs } from '../dto/args/find-contract.args';
import { Contract } from '../entity/contract.entity';
import { ContractService, serviceStructure } from '../services/contract.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ContractService,
  findOne: { name: 'contract', decorators: [AnyUser] },
  findAll: { name: 'contracts', decorators: [AnyUser] },
  findArgsType: FindContractArgs,
});

@Resolver(() => Contract)
export class ContractResolver extends CrudResolverFrom(resolverStructure) {
  @ResolveField(() => [Lot], { name: 'lots' })
  async lots(@Parent() contract: Contract, @CurrentContext() context: IContext): Promise<Lot[]> {
    return await this.service.contractLots(context, contract);
  }

  @ResolveField(() => Organization, { name: 'organization' })
  async organization(@Parent() contract: Contract, @CurrentContext() context: IContext): Promise<Organization> {
    return await this.service.organization(context, contract);
  }
}
