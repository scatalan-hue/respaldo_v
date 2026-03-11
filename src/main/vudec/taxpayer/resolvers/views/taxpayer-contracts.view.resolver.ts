import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';
import { TaxpayerContractsView } from '../../entity/views/taxpayer-contracts.view.entity';
import { TaxpayerContractsViewService, serviceStructure } from '../../services/views/taxpayer-contracts.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TaxpayerContractsViewService,
  findAll: {
    name: 'taxpayerContractsView',
    decorators: [AnyUser],
  },
});

@Resolver(() => TaxpayerContractsView)
export class TaxpayerContractsViewResolver extends CrudResolverFrom(resolverStructure) {}
