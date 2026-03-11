import { Repository } from 'typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { I18N_SPACE } from '../../../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../../../common/i18n/functions/response';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { findContractByIdEvent } from 'src/main/vudec/contracts/contract/constants/events.constants';
import { Contract } from 'src/main/vudec/contracts/contract/entity/contract.entity';
import { findLotByIdEvent } from '../../lot/constants/lot.constants';
import { Lot } from '../../lot/entity/lot.entity';
import { createLotContractEvent, findOrCreateLotContractEvent, hardRemoveLotContractEvent } from '../constants/events.constants';
import { CreateLotContractInput } from '../dto/inputs/create-lot-contract.input';
import { UpdateLotContractInput } from '../dto/inputs/update-lot-contract.input';
import { LotContract } from '../entities/lot-contract.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: LotContract,
  createInputType: CreateLotContractInput,
  updateInputType: UpdateLotContractInput,
});

@Injectable()
export class LotContractService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.LotContract;

  private async findOrCreateLotContract({ context, input }: { context: IContext; input: CreateLotContractInput }): Promise<LotContract> {
    const { lotId, contractId } = input;
    const lotContract = await this.findOneBy(context, {
      where: {
        lot: { id: lotId },
        contract: { id: contractId },
      },
    });

    if (lotContract) return lotContract;
    return await this.create(context, input);
  }

  async beforeMutation(
    context: IContext,
    repository: Repository<LotContract>,
    entity: LotContract,
    input: CreateLotContractInput | UpdateLotContractInput,
    type: string,
  ): Promise<LotContract> {
    const { lotId, contractId } = input;

    if (contractId) {
      const [contract] = await this.eventEmitter.emitAsync(findContractByIdEvent, {
        context,
        id: contractId,
      });

      if (!contract && !(contract instanceof Contract)) throw new NotFoundException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.contract'));

      entity.contract = contract;
    }

    if (lotId) {
      const [lot] = await this.eventEmitter.emitAsync(findLotByIdEvent, {
        context,
        id: lotId,
      });

      if (!lot && !(lot instanceof Lot))
        throw new NotFoundException(
          sendResponse(context, this.I18N_SPACE, 'beforeMutation.lot', {
            lotId,
          }),
        );

      entity.lot = lot;
    }

    if (type === 'create') {
      const lotContract = await this.findOneBy(context, {
        where: {
          lot: { id: lotId },
          contract: { id: contractId },
        },
      });

      if (lotContract) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'beforeMutation.lotContract'));
    }

    return entity;
  }

  async beforeCreate(context: IContext, repository: Repository<LotContract>, entity: LotContract, createInput: CreateLotContractInput): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, createInput, 'create');
  }

  async beforeUpdate(context: IContext, repository: Repository<LotContract>, entity: LotContract, updateInput: UpdateLotContractInput): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, updateInput, 'update');
  }

  @OnEvent(hardRemoveLotContractEvent)
  async onHardRemoveLotContract({ context, contractId, lotId }: { context: IContext; contractId: string; lotId: string }): Promise<LotContract> {
    const lotContract = await this.findOneBy(context, { where: { contract: { id: contractId }, lot: { id: lotId } } }, true);
    return await this.hardRemove(context, lotContract.id);
  }

  @OnEvent(createLotContractEvent)
  async onCreateLotContract({ context, input }: { context: IContext; input: CreateLotContractInput }): Promise<LotContract> {
    return await this.create(context, input);
  }

  @OnEvent(findOrCreateLotContractEvent, { suppressErrors: false })
  async onFindOrCreateLotContract({ context, input }: { context: IContext; input: CreateLotContractInput }): Promise<LotContract> {
    return await this.findOrCreateLotContract({ context, input });
  }
}
