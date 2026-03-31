import 'reflect-metadata';
import { Container } from 'inversify';

import { TYPES } from '../types';
import { CardIssueController } from '../controllers/cards/card-issue.controller';
import { CardIssueService } from '../services/cards/card-issue.service';
import { CardIssueRepository } from '../repositories/cards/card-issue.repository';
import { 
  ICardIssueRepository, 
  ICardIssueService 
} from '../interfaces/cards/card-issue.interface';
import { IKafkaEventBroker } from '../interfaces/kafka/kafka-event-broker.interface';
import { KafkaEventBrokerProvider } from '../providers/kafka/kafka-event-broker.provider';
import { IKafkaEventConsumer } from '../interfaces/kafka/kafka-event-consumer.interface';
import { EventDispatcher } from '../events/dispatcher/dispatcher.event';
import { KafkaEventConsumerProvider } from '../providers/kafka/kafka-event-consumer.provider';
import { IEventHandler } from '../interfaces/kafka/kafka-event-handler.interface';
import { CardIssuedHandler } from '../events/handlers/card-issued.handler';
import { ICardEmissionPayload } from '../interfaces/cards/card-issue.interface';

const container = new Container();

container.bind<ICardIssueRepository>(TYPES.CardIssueRepository).to(CardIssueRepository).inSingletonScope();
container.bind<ICardIssueService>(TYPES.CardIssueService).to(CardIssueService).inSingletonScope();
container.bind<CardIssueController>(TYPES.CardIssueController).to(CardIssueController).inSingletonScope();
container.bind<IKafkaEventBroker>(TYPES.KafkaEventBrokerProvider).toDynamicValue(() => {
  return new KafkaEventBrokerProvider();
}).inSingletonScope();
container.bind<IKafkaEventConsumer>(TYPES.KafkaEventConsumerProvider).to(KafkaEventConsumerProvider).inSingletonScope();
container.bind<EventDispatcher>(TYPES.EventDispatcher).to(EventDispatcher).inSingletonScope();
container.bind<IEventHandler<ICardEmissionPayload>>(TYPES.CardIssuedHandler).to(CardIssuedHandler).inSingletonScope();

export { container };