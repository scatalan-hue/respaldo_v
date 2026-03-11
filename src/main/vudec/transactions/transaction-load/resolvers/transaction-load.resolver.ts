import { CurrentContext } from 'src/patterns/crud-pattern/decorators/current-context.decorator';
import { ProcessTransactionLoadInput } from '../dto/request/process-transaction-load.input';
import { TransactionLoadService } from '../services/save_transaction/excel-loader.service';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { Resolver, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { AnyUser } from 'src/security/auth/decorators/user-types.decorator';
import { TransactionLoadEntity } from '../entities/transaction-load.entity';
import { SecurityAuthGuard } from 'src/security/auth/guards/auth.guard';
import { FileInfo } from 'src/general/files/entities/file-info.entity';
import { UseGuards } from '@nestjs/common';

@Resolver(() => TransactionLoadEntity)
export class TransactionLoadResolver {
  constructor(private readonly transactionLoadService: TransactionLoadService) { }

  @Mutation(() => TransactionLoadEntity, { name: 'processTransactionLoad' })
  @UseGuards(SecurityAuthGuard)
  @AnyUser()
  async processTransactionLoad(@Args('input') input: ProcessTransactionLoadInput,
    @CurrentContext() context: IContext): Promise<TransactionLoadEntity> {
    const userId = context.user?.id;
    const result = await this.transactionLoadService.processTransactionLoadFile(context, input.fileId, userId);
    return result.transactionLoad;
  }

  //Devolver el id del error
  @ResolveField('loadError', () => FileInfo, { nullable: true })
  async loadError(@Parent() transactionLoad: TransactionLoadEntity): Promise<FileInfo | null> {

    if (!transactionLoad.loadErrorId) {
      return null;
    }
    return transactionLoad.loadError || null;
  }
}