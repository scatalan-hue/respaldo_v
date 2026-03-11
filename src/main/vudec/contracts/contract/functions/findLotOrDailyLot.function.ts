import { EventEmitter2 } from '@nestjs/event-emitter';
import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { findLotEvent, findOrCreateDailyLotEvent } from 'src/main/vudec/lots/lot/constants/lot.constants';
import { Lot } from 'src/main/vudec/lots/lot/entity/lot.entity';
import { CreateContractInput } from '../dto/inputs/create-contract.input';

export const findOrCreateDailyLot = async (context: IContext, eventEmitter: EventEmitter2, input: CreateContractInput): Promise<Lot> => {
  const { lotConsecutive, lotId } = input;

  const event = lotConsecutive || lotId ? findLotEvent : findOrCreateDailyLotEvent;

  const payload = { context, ...(lotConsecutive && { consecutive: lotConsecutive }), ...(lotId && { id: lotId }) };

  const [lot] = await eventEmitter.emitAsync(event, payload);

  return lot;
};
