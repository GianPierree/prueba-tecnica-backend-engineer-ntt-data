import { injectable, inject } from 'inversify';
import pino from 'pino';

import { IEventHandler } from '../../interfaces/kafka/kafka-event-handler.interface';
import { IKafkaCloudEvent } from '../../interfaces/kafka/kafka-cloud-event.interface';
import { TYPES } from '../../types';
import { ICardEmissionPayload, ICardIssueService } from '../../interfaces/cards/card-issue.interface';

@injectable()
export class CardIssuedHandler implements IEventHandler<ICardEmissionPayload> {

  private logger = pino({
    name: CardIssuedHandler.name,
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
    @inject(TYPES.CardIssueService) private cardService: ICardIssueService
  ) {}

  async handler(event: IKafkaCloudEvent<ICardEmissionPayload>): Promise<void> {
    const { cardIssuerId } = event.data;
    
    const updatedCard = await this.cardService.updateStatus(cardIssuerId, 'issued');
    
    if (updatedCard) {
      this.logger.info(`Card ${cardIssuerId} updated to ISSUED successfully.`);
    }
  }
}