import 'reflect-metadata';
import express from 'express';

import { cardIssueRoutes } from './routes/card-issue.route';
import { requestContextMiddleware } from './middlewares/request-context.middleware';
import { rateLimiterMiddleware } from './middlewares/rate-limiter.middleware';
import { container } from './configs/inversify.config';
import { TYPES } from './types';
import { IKafkaEventBroker } from './interfaces/kafka/kafka-event-broker.interface';

const app = express();
app.use(express.json());
app.use(requestContextMiddleware);
app.use(rateLimiterMiddleware);

app.use('/cards/issue', cardIssueRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Service is running',
    service: 'card-issuer',
    timestamp: new Date().toISOString(),
    dependencies: {
      kafka: 'connected',
    }
  });
});

const kafkaBroker = container.get<IKafkaEventBroker>(TYPES.KafkaEventBrokerProvider);

async function initializeKafka() {
  try {
    await kafkaBroker.connect();
  } catch (error) {
    console.error('❌ Failed to initialize Kafka provider:', error);
    process.exit(1);
  }
}

initializeKafka();

export default app;