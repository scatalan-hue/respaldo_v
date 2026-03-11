import { Resolver } from '@nestjs/graphql';
import { TaxpayerView } from '../../entity/views/taxpayer.view.entity';
import { TaxpayerViewService, serviceStructure } from '../../services/views/taxpayer.view.service';
import { CrudResolverFrom } from '../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../security/auth/utils/crud.utils';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TaxpayerViewService,
  findAll: {
    name: 'taxpayersView',
    decorators: [AnyUser],
  },
});

@Resolver(() => TaxpayerView)
export class TaxpayerViewResolver extends CrudResolverFrom(resolverStructure) {}
