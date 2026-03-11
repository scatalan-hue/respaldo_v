import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { ContractStatusTotalView } from '../../entity/views/contract-status-total.view.entity';
import { ContractStatusTotalViewService, serviceStructure } from '../../services/views/contract-status-total.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ContractStatusTotalViewService,
  findAll: {
    name: 'contractStatusTotalsView',
    decorators: [AnyUser],
  },
});

@Resolver(() => ContractStatusTotalView)
export class ContractStatusTotalViewResolver extends CrudResolverFrom(resolverStructure) {}
