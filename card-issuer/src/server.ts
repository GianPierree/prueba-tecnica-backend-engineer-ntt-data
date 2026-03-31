import 'reflect-metadata';
import app from './app'
import pino from 'pino';

import { container } from './configs/inversify.config';
import { TYPES } from './types';
import { IKafkaEventBroker } from './interfaces/kafka/kafka-event-broker.interface';
import { IKafkaEventConsumer } from './interfaces/kafka/kafka-event-consumer.interface';
import { EventDispatcher } from './events/dispatcher/dispatcher.event';
import { CardIssuedHandler } from './events/handlers/card-issued.handler';
import { KAFKA_TOPICS } from './shared/constants';

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

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 card-issue-app running on http://localhost:${PORT}`);
    });

    const kafkaConsumer = container.get<IKafkaEventConsumer>(TYPES.KafkaEventConsumerProvider);
    const eventDispatcher = container.get<EventDispatcher>(TYPES.EventDispatcher);

    const cardIssuedHandler = container.get<CardIssuedHandler>(TYPES.CardIssuedHandler);
    eventDispatcher.register(KAFKA_TOPICS.CARD_ISSUED, cardIssuedHandler);

    await kafkaConsumer.connect();
    await kafkaConsumer.startListening([KAFKA_TOPICS.CARD_ISSUED]);

    const shutdown = async () => {
      server.close(async () => {
        const kafkaBroker = container.get<IKafkaEventBroker>(TYPES.KafkaEventBrokerProvider);
        await kafkaBroker.disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(`❌ Error starting server: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();