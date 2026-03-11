import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';

import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { LotContract } from '../entities/lot-contract.entity';
import { LotContractService, serviceStructure } from '../services/lot-contract.service';

export const lotResolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: LotContractService,
  create: { name: 'createLotContract', decorators: [AnyUser] },
  findOne: { name: 'lotContract', decorators: [AnyUser] },
  findAll: { name: 'lotContracts', decorators: [AnyUser] },
});

@Resolver(() => LotContract)
export class LotContractResolver extends CrudResolverFrom(lotResolverStructure) {}
