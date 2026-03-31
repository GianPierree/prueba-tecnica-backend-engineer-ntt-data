import 'reflect-metadata';
import pino from 'pino';

import { container } from './configs/inversify.config';
import { TYPES } from './types';
import { IKafkaEventConsumer } from './interfaces/kafka/kafka-event-consumer.interface';
import { KAFKA_TOPICS } from './shared/constants';
import { EventDispatcher } from './events/dispatcher/dispatcher.event';
import { CardRequestedHandler } from './events/handlers/card-requested.handler';
import { IKafkaEventBroker } from './interfaces/kafka/kafka-event-broker.interface';

const logger = pino({
  name: 'CardsIssueServer',
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
    },
  },
});

async function bootstrapConsumer() {
  const kafkaConsumer = container.get<IKafkaEventConsumer>(TYPES.KafkaEventConsumerProvider);
  const kafkaBroker = container.get<IKafkaEventBroker>(TYPES.KafkaEventBrokerProvider);

  const eventDispatcher = container.get<EventDispatcher>(TYPES.EventDispatcher);

  // Register event handlers
  const cardRequestedHandler = container.get<CardRequestedHandler>(TYPES.CardRequestedHandler);
  eventDispatcher.register(KAFKA_TOPICS.CARD_REQUESTED, cardRequestedHandler);

  try {
    await kafkaConsumer.connect();
    await kafkaBroker.connect();

    const topicsToListen = [KAFKA_TOPICS.CARD_REQUESTED];
    
    await kafkaConsumer.startListening(topicsToListen);
    logger.info(`✅ Worker started and listening to topics: ${topicsToListen.join(', ')}`);

  } catch (error) {
    logger.error(`❌ Error iniciando el consumidor: ${error}`);
    process.exit(1);
  }

  const shutdown = async () => {
    await kafkaConsumer.disconnect();
    await kafkaBroker.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrapConsumer();