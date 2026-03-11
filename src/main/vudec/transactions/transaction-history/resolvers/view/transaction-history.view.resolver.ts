import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-resolver.mixin';
import { AnyUser } from '../../../../../../security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from '../../../../../../security/auth/utils/crud.utils';
import { TransactionHistoryView } from '../../entities/view/transaction-history.view.entity';
import { TransactionHistoryViewService, serviceStructure } from '../../services/view/transaction-history.view.service';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TransactionHistoryViewService,
  findAll: {
    name: 'transactionHistoryView',
    decorators: [AnyUser],
  }
});

@Resolver(() => TransactionHistoryView)
export class TransactionHistoryViewResolver extends CrudResolverFrom(resolverStructure) {

}
