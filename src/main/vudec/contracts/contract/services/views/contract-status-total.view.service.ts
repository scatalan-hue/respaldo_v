import { Injectable } from '@nestjs/common';
import { CrudServiceStructure } from 'src/patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from 'src/patterns/crud-pattern/mixins/crud-service.mixin';
import { FindContractStatusTotalViewArgs } from '../../dto/args/find-contract-status-total-view.args';
import { ContractStatusTotalView } from '../../entity/views/contract-status-total.view.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: ContractStatusTotalView,
  findArgsType: FindContractStatusTotalViewArgs,
});

@Injectable()
export class ContractStatusTotalViewService extends CrudServiceFrom(serviceStructure) {
  constructor() {
    super();
  }
}
