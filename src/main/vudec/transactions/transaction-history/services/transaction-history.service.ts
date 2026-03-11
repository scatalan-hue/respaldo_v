import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { createTransactionHistoryEvent, findTransactionHistoryByIdEvent } from '../constants/events.constants';
import { CreateTransactionHistoryInput } from '../dto/inputs/create-transaction-history.input';
import { UpdateTransactionHistoryInput } from '../dto/inputs/update-transaction-history.input';
import { TransactionHistory } from '../entities/transaction-history.entity';
import { TransactionAction } from '../../transaction/enum/transaction-action.enum';

export const serviceStructure = CrudServiceStructure({
  entityType: TransactionHistory,
  createInputType: CreateTransactionHistoryInput,
  updateInputType: UpdateTransactionHistoryInput,
});

@Injectable()
export class TransactionHistoryService extends CrudServiceFrom(serviceStructure) {

  private readonly I18N_SPACE = I18N_SPACE.Transaction;

  private async getNextSequenceForTransaction(context: IContext, repository: Repository<TransactionHistory>, transactionId: string): Promise<number> {
    const lastRecord = await repository
      .createQueryBuilder('th')
      .where('th.transactionId = :transactionId', { transactionId })
      .orderBy('th.sequence', 'DESC')
      .getOne();

    return lastRecord ? lastRecord.sequence + 1 : 1;
  }

  async beforeCreate(context: IContext, repository: Repository<TransactionHistory>, entity: TransactionHistory, createInput: CreateTransactionHistoryInput): Promise<void> {
    if (createInput.transactionId) {
      entity.sequence = await this.getNextSequenceForTransaction(context, repository, createInput.transactionId);

      const result = await this.findOneBy(context, { where: { transactionId: createInput.transactionId }, order: { createdAt: 'DESC' } }, false);

      if (result?.action !== TransactionAction.REVERT && !createInput.isRevert) {
        entity.action = TransactionAction.UPDATE;
      } else if (createInput.isRevert) {
        entity.action = TransactionAction.REVERT;
      }
    }
  }

  @OnEvent(createTransactionHistoryEvent, { suppressErrors: false })
  async onCreateTransactionHistory({ context, createInput }: { context: IContext; createInput: CreateTransactionHistoryInput }): Promise<TransactionHistory> {
    return await this.create(context, createInput);
  }

  @OnEvent(findTransactionHistoryByIdEvent, { suppressErrors: false })
  async onFindTransactionHistoryById({ context, id }: { context: IContext; id: string }): Promise<TransactionHistory> {
    return await this.findOne(context, id);
  }
}
