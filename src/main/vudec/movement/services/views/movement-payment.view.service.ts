import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { findContractByIdEvent } from 'src/main/vudec/contracts/contract/constants/events.constants';
import { Contract } from 'src/main/vudec/contracts/contract/entity/contract.entity';
import { FindMovementPaymentDetailsViewArgs } from '../../dto/args/find-movement-payment-details.args';
import { FindMovementPaymentViewArgs } from '../../dto/args/find-movement-payment.args';
import { FindMovementViewArgs } from '../../dto/args/find-movement-view.args';
import { MovementsPaymentViewTotalsInput } from '../../dto/inputs/movement-payment-view-total.input';
import { MovementPaymentView } from '../../entity/views/movement-payment.view.entity';
import { MovementsView } from '../../entity/views/movement.view.entity';
import { TypeMovement } from '../../enums/movement-type.enum';
import { MovementViewService } from './movement.view.service';

export const serviceStructure = CrudServiceStructure({
  entityType: MovementPaymentView,
  findArgsType: FindMovementPaymentViewArgs,
});

@Injectable()
export class MovementPaymentViewService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly movementViewService: MovementViewService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async movements(context: IContext, movement: MovementPaymentView): Promise<MovementsView[]> {
    const args = new FindMovementViewArgs();

    if (!args['where']) args['where'] = {};

    args['where'] = {
      ...args['where'],
      expenditureNumber: movement?.isOldest ? { _in: [movement?.expenditureNumber, movement?.contractConsecutive] } : { _eq: movement?.expenditureNumber },
      contractId: { _eq: movement?.id },
    };

    if (movement?.isOldest) {
      args['where'] = {
        ...args['where'],
        type: { _eq: TypeMovement.Register },
      };
    }

    return await this.movementViewService.findAll(context, args as FindMovementViewArgs);
  }

  async movementPaymentDetailsView(context: IContext, args?: FindMovementPaymentDetailsViewArgs): Promise<MovementsView[]> {
    const movements: MovementPaymentView[] = await this.findAll(context, args);

    const movement = movements[0];

    if (!movement) return [];

    const movementsArgs = new FindMovementViewArgs();

    if (!movementsArgs['where']) movementsArgs['where'] = {};
    if (!movementsArgs['orderBy']) movementsArgs['orderBy'] = args['orderBy'];

    movementsArgs['where'] = await {
      expenditureNumber: movement?.isOldest ? { _in: [movement?.expenditureNumber, movement?.contractConsecutive] } : { _eq: movement?.expenditureNumber },
      contractId: { _eq: movement?.id },
    };

    if (!movement?.isOldest) {
      movementsArgs['where'] = await {
        ...movementsArgs['where'],
        type: { _eq: TypeMovement.Register },
      };
    }

    return await this.movementViewService.findAll(context, movementsArgs as FindMovementViewArgs);
  }

  async movementPaymentsViewTotals(context: IContext, args?: FindMovementPaymentViewArgs): Promise<MovementsPaymentViewTotalsInput> {
    const movements: MovementPaymentView[] = await this.findAll(context, args);

    const total = movements.reduce(
      (acc, movement) => {
        acc.totalLiquidated += movement.totalLiquidatedValue;
        acc.totalPaid += movement.totalPaidValue;
        return acc;
      },
      { totalLiquidated: 0, totalPaid: 0 },
    );

    let contract: Contract;

    if (movements?.[0]?.id)
      [contract] = await this.eventEmitter.emitAsync(findContractByIdEvent, {
        context,
        id: movements[0]?.id,
        orFail: true,
      });

    return { ...total, contractValue: contract ? contract?.contractValue : 0 };
  }
}
