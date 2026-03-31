import { injectable } from 'inversify';
import pino from 'pino';

import { IEventHandler } from '../../interfaces/kafka/kafka-event-handler.interface';
import { IKafkaCloudEvent } from '../../interfaces/kafka/kafka-cloud-event.interface';

@injectable()
export class EventDispatcher {
  private handlers = new Map<string, IEventHandler<any>>();
  private logger = pino({
    name: EventDispatcher.name,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  });

  register<T>(eventType: string, handler: IEventHandler<T>): void {
    this.handlers.set(eventType, handler);
  }

  async dispatch<T>(event: IKafkaCloudEvent<T>): Promise<void> {
    const handler = this.handlers.get(event.type);
    
    if (!handler) {
      this.logger.warn(`Ignored event: No handler registered for type '${event.type}'`);
      return;
    }

    try {
      await handler.handler(event);
    } catch (error) {
      this.logger.error(`Error in event handler '${event.type}': ${(error as Error).message}`);
      throw error;
    }
  }
}