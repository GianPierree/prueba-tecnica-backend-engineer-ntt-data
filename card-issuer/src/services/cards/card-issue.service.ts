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

  async create(cardIssue: Omit<ICardIssue, 'id'>): Promise<Pick<ICardIssue, 'id' | 'status'>> {
    try {
      const result = await this.cardIssueRepository.save(cardIssue);
      this.logger.info(`Card issue created successfully: ${result.id}`);

      if (result) {
        this.publishCardRequested(result);
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

  private publishCardRequested({ id, status, forceError }: ICardIssue): void {
    const payload: IKafkaCloudEvent<ICardIssuePayload> = {
      id: crypto.randomUUID(),
      source: '/services/cards/card-issuer',
      data: {
        cardId: id,
        status,
        forceError: forceError ?? false,
      },
      type: KAFKA_TOPICS.CARD_REQUESTED,
      time: new Date().toISOString(),
      specversion: '1.0',
    };
    this.kafkaEventBrokerProvider.publish<ICardIssuePayload>(KAFKA_TOPICS.CARD_REQUESTED, payload);
  }
}
