import { injectable, inject } from 'inversify';
import pino from 'pino';

import { IEventHandler } from '../../interfaces/kafka/kafka-event-handler.interface';
import { IKafkaCloudEvent } from '../../interfaces/kafka/kafka-cloud-event.interface';
import { ICardIssuePayload } from '../../interfaces/cards/card-issue-payload.interface';

import { TYPES } from '../../types';
import { ICardProcessorService } from '../../interfaces/cards/card-processor.interface';

@injectable()
export class CardRequestedHandler implements IEventHandler<ICardIssuePayload> {
  private logger = pino({
    name: CardRequestedHandler.name,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  });
  
  constructor(
    @inject(TYPES.CardProcessorService) private cardProcessorService: ICardProcessorService
  ) {}

  async handler(event: IKafkaCloudEvent<ICardIssuePayload>): Promise<void> {
    this.logger.info(`Event received: ${event.id}`);
    await this.cardProcessorService.approve(event.data);
  }
}