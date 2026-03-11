import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TransactionService, serviceStructure } from '../services/transaction.service';
import { AdminOnly } from 'src/security/auth/decorators/user-types.decorator';
import { CrudResolverStructure } from 'src/security/auth/utils/crud.utils';
import { CrudResolverFrom } from 'src/patterns/crud-pattern/mixins/crud-resolver.mixin';
import { Transaction } from '../entities/transaction.entity';
import { Public } from 'src/security/auth/decorators/public.decorator';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { ValidationResponseModel } from '../dto/models/validation-response.model';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: TransactionService,
  create: { name: 'createTransaction', decorators: [AdminOnly] },
  update: { name: 'updateTransaction', decorators: [AdminOnly] },
  remove: { name: 'removeTransaction', decorators: [AdminOnly] },
  findOne: { name: 'transaction', decorators: [Public] },
  findAll: { name: 'transactions', decorators: [Public] },
});

@Resolver(() => Transaction)
export class TransactionResolver extends CrudResolverFrom(resolverStructure) {

  @Mutation(() => ValidationResponseModel, { name: "applyTransaction" })
  @Public()
  async applyTransaction(
    @CurrentContext() context: IContext,
    @Args('transactionId') transactionId: string
  ): Promise<ValidationResponseModel> {
    return await this.service.applyTransaction(context, transactionId);
  }

  @Mutation(() => Transaction, { name: "validateSecop" })
  @Public()
  async validateSecop(
    @CurrentContext() context: IContext,
    @Args('contractId') contractId: string
  ): Promise<void> {
    await this.service.validateSecop(context, contractId);
  }
}
