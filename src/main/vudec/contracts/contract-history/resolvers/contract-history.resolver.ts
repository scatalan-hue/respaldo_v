import { Resolver } from '@nestjs/graphql';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { ContractHistoryService, serviceStructure } from '../services/contract-history.service';
import { ContractHistory } from '../entities/contract-history.entity';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';

export const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ContractHistoryService,
  create: { name: 'createContractHistory', decorators: [AnyUser] },
  findOne: { name: 'contractHistory', decorators: [AnyUser] },
  findAll: { name: 'contractHistories', decorators: [AnyUser] },
});

@Resolver(() => ContractHistory)
export class ContractHistoryResolver extends CrudResolverFrom(resolverStructure) {}
