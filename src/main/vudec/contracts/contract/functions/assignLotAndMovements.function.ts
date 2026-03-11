import { EventEmitter2 } from '@nestjs/event-emitter';
import { uniq } from 'lodash';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';
import { createMovementsEvent, handleUnsentMovementsEvent, isValidMovementsEvent } from '../../../movement/constants/events.constants';
import { RequestCreateMovement } from '../../../movement/dto/models/request-create-movement.model';
import { Movement } from '../../../movement/entity/movement.entity';
import { CreateContractInput } from '../dto/inputs/create-contract.input';
import { Contract } from '../entity/contract.entity';
import { Taxpayer } from '../../../taxpayer/entity/taxpayer.entity';

export const handleContractMovements = async (
  context: IContext,
  eventEmitter: EventEmitter2,
  contract: Contract,
  createInput: CreateContractInput,
  taxpayer: Taxpayer
): Promise<Movement[]> => {
  try {
    const { id: contractId }: Contract = contract;
    const { lotId }: CreateContractInput = createInput;

    const movementsInput = createInput.movementsInput ? createInput.movementsInput.map((movement) => ({ ...movement, lotId, contractId })) : [];

    const expenditureNumbers = uniq(movementsInput.filter((item) => !!item.expenditureNumber).map((item) => item.expenditureNumber));

    // Se eliminan los movimientos no enviados aun
    for (const expenditureNumber of expenditureNumbers) {
      await eventEmitter.emitAsync(handleUnsentMovementsEvent, { context, expenditureNumber, contractId, contractType: createInput.contractType });
    }

    // Se valida que los movimientos sean válidos
    let movementsInputToSave: RequestCreateMovement[] = [];

    for (const element of movementsInput) {
      const [isValid] = await eventEmitter.emitAsync(isValidMovementsEvent, { context, input: element, movementsInput });

      if (isValid) {
        element.taxpayerId = taxpayer.id;
        movementsInputToSave.push(element);
      }
    }

    // Crear movimientos al contrato
    const [movements] = await eventEmitter.emitAsync(createMovementsEvent, {
      context,
      movementsInput: movementsInputToSave,
      lotId,
      contract,
      createContractInput: createInput
    });

    return movements;
  } catch (error) {
    throw error;
  }
};
