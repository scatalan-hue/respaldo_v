import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FindContractHistoryArgs } from '../dto/args/find-contract-history.args';
import { CreateContractHistoryInput } from '../dto/inputs/create-contract-history.input';
import { UpdateContractHistoryInput } from '../dto/inputs/update-contract-history.input';
import { ContractHistory } from '../entities/contract-history.entity';
import { createContractHistoryEvent } from '../constants/events.constants';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';

export const serviceStructure = CrudServiceStructure({
  entityType: ContractHistory,
  createInputType: CreateContractHistoryInput,
  updateInputType: UpdateContractHistoryInput,
  findArgsType: FindContractHistoryArgs,
});

@Injectable()
export class ContractHistoryService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly eventEmitter: EventEmitter2
  ) { super(); }

  @OnEvent(createContractHistoryEvent, { suppressErrors: false })
  async onCreateContractHistoryEvent({ context, createInput }: { context: IContext; createInput: CreateContractHistoryInput }): Promise<ContractHistory> {
    return await this.create(context, createInput);
  }
}
