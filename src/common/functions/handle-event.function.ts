import { EventEmitter2 } from "@nestjs/event-emitter";

/**
 * @description Handles an event asynchronously using EventEmitter2 to control payload typing and response
 * @template T  Expected type of event response
 * @template D Expected type of payload to be sent to the event.
 * @param {EventEmitter2} eventEmitter EventEmitter2 instance to emit events
 * @param {string} eventName Name of event to be broadcast.
 * @param {D} payload Data to be sent as payload to the event
 * @returns {T} A promise resolving to the expected outcome of the event (`T`).
 * @throws Error if a problem occurs when issuing or handling the event.
 */
export const handleEvent = async <T, D>(eventEmitter: EventEmitter2, eventName: string, payload: D, type?: { new () }): Promise<T> => {
  try {
    const [response] = (await eventEmitter.emitAsync(eventName, payload)) as T[];

    if (!response) return null;

    if (Array.isArray(response)) {
      Object.setPrototypeOf(response, Array.prototype);
      return response;
    }

    if (type) Object.setPrototypeOf(response, type.prototype);

    return response;
  } catch (error) {
    throw error;
  }
};
