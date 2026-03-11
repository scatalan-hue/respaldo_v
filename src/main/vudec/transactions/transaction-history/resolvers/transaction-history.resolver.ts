import { Resolver } from '@nestjs/graphql';
import { TransactionHistoryService, serviceStructure } from '../services/transaction-history.service';
import { AdminOnly } from 'src/security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { TransactionHistory } from '../entities/transaction-history.entity';
import { Public } from 'src/security/auth/decorators/public.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TransactionHistoryService,
  create: { name: 'createTransactionHistory', decorators: [AdminOnly] },
  update: { name: 'updateTransactionHistory', decorators: [AdminOnly] },
  remove: { name: 'removeTransactionHistory', decorators: [AdminOnly] },
  findOne: { name: 'transactionHistory', decorators: [Public] },
  findAll: { name: 'transactionHistories', decorators: [Public] },
});

@Resolver(() => TransactionHistory)
export class TransactionHistoryResolver extends CrudResolverFrom(resolverStructure) {}
