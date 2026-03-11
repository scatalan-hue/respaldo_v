import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../../security/auth/utils/crud.utils';
import { TransactionView } from '../../entities/view/transaction.view.entity';
import { TransactionViewService, serviceStructure } from '../../services/view/transaction.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TransactionViewService,
  findAll: {
    name: 'transactionView',
    decorators: [AnyUser],
  }
});

@Resolver(() => TransactionView)
export class TransactionViewResolver extends CrudResolverFrom(resolverStructure) {

}
