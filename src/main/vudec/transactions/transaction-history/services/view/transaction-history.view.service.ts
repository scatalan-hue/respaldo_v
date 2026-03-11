import { Injectable } from '@nestjs/common';
import { CrudServiceStructure } from '../../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { TransactionHistoryView } from '../../entities/view/transaction-history.view.entity';
import { FindTransactionHistoryViewArgs } from '../../dto/args/transaction-history.view.dto';

export const serviceStructure = CrudServiceStructure({
  entityType: TransactionHistoryView,
  findArgsType: FindTransactionHistoryViewArgs,
});

@Injectable()
export class TransactionHistoryViewService extends CrudServiceFrom(serviceStructure) {
}
