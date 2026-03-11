import { Resolver } from '@nestjs/graphql';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { ContractDocumentService, serviceStructure } from '../services/contract-document.service';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { ContractDocument } from '../entities/contract-document.entity';

export const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ContractDocumentService,
  create: { name: 'createContractDocument', decorators: [AnyUser] },
  findOne: { name: 'contractDocument', decorators: [AnyUser] },
  findAll: { name: 'contractDocuments', decorators: [AnyUser] },
});

@Resolver(() => ContractDocument)
export class ContractDocumentResolver extends CrudResolverFrom(resolverStructure) {}
