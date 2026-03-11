import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrudServiceStructure } from '../../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { TransactionView } from '../../entities/view/transaction.view.entity';
import { FindTransactionViewArgs } from '../../dto/args/transaction.view.args';

export const serviceStructure = CrudServiceStructure({
  entityType: TransactionView,
  findArgsType: FindTransactionViewArgs,
});

@Injectable()
export class TransactionViewService extends CrudServiceFrom(serviceStructure) {
}
