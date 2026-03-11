import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class EventsUtils {
  static async callOne(eventEmitter: EventEmitter2, eventName: string, payload: any) {
    const result = await eventEmitter.emitAsync(eventName, payload);

    if (!result || result.length === 0) throw new InternalServerErrorException(`no service expecting ${eventName}'`);

    if (result[0] === undefined || result[0] === null) throw new InternalServerErrorException(`${eventName}' returned an  null/undefined value`);

    return result[0];
  }
}
