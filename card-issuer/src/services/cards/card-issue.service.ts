import { inject, injectable } from 'inversify';
import pino from 'pino';

import { TYPES } from '../../types';
import {
  ICardIssue,
  ICardIssuePayload,
  ICardIssueRepository,
  ICardIssueService,
} from '../../interfaces/cards/card-issue.interface';
import { IKafkaEventBroker } from '../../interfaces/kafka/kafka-event-broker.interface';
import { IKafkaCloudEvent } from '../../interfaces/kafka/kafka-cloud-event.interface';
import { KAFKA_TOPICS } from '../../shared/constants';
import { EventCounterUtil } from '../../utils/event-counter.util';
import { CardExistsError } from '../../utils/errors.util';

@injectable()
export class CardIssueService implements ICardIssueService {
  private logger = pino({
    name: CardIssueService.name,
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
    @inject(TYPES.CardIssueRepository) private readonly cardIssueRepository: ICardIssueRepository,
    @inject(TYPES.KafkaEventBrokerProvider) private readonly kafkaEventBrokerProvider: IKafkaEventBroker,
  ) {}

  async create(cardIssue: Omit<ICardIssue, 'id'>, source: string): Promise<Pick<ICardIssue, 'id' | 'status'>> {
    try {
      await this.existsByDocumentNumber(cardIssue.customer.documentNumber);
      
      const result = await this.cardIssueRepository.save(cardIssue);
      this.logger.info(`Card issue created successfully: ${result.id}`);

      if (result) {
        this.publishCardRequested(result, source);
      }

      return {
        id: result.id,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error creating card issue: ${(error as Error).message}`);
      throw error;
    }
  }

  async updateStatus(id: string, status: string): Promise<ICardIssue | null> {
    try {
      const result = await this.cardIssueRepository.updateStatus(id, status);
      this.logger.info(`Card issue updated successfully: ${result?.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating card issue: ${(error as Error).message}`);
      throw error;
    }
  }

  private publishCardRequested({ id, status, forceError }: ICardIssue, source: string): void {
    const payload: IKafkaCloudEvent<ICardIssuePayload> = {
      id: EventCounterUtil.getInstance().next(),
      source,
      data: {
        cardId: id,
        status,
        forceError: forceError ?? false,
        source,
        error: {},
      },
      type: KAFKA_TOPICS.CARD_REQUESTED,
      time: new Date().toISOString(),
      specversion: '1.0',
    };
    this.kafkaEventBrokerProvider.publish<ICardIssuePayload>(KAFKA_TOPICS.CARD_REQUESTED, payload);
  }

  private async existsByDocumentNumber(documentNumber: string): Promise<void> {
    const existingCard = await this.cardIssueRepository.findByDocumentNumber(documentNumber);
    if (existingCard) {
      throw new CardExistsError(documentNumber);
    }
  }
}
