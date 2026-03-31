import { Kafka, Producer } from 'kafkajs';
import pino from 'pino';
import { injectable } from 'inversify';

import { IKafkaEventBroker } from '../../interfaces/kafka/kafka-event-broker.interface';
import { IKafkaCloudEvent } from '../../interfaces/kafka/kafka-cloud-event.interface';

@injectable()
export class KafkaEventBrokerProvider implements IKafkaEventBroker {
  private producer: Producer;
  private logger = pino({
    name: KafkaEventBrokerProvider.name,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  });

  constructor() {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'card-issuer-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.info('Kafka Producer connected successfully');
    } catch (error) {
      this.logger.error(`Error connecting Kafka Producer: ${(error as Error).message}`);
      throw error;
    }
  }

  async publish<T>(topic: string, payload: IKafkaCloudEvent<T>): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          { value: JSON.stringify(payload) },
        ],
      });
      this.logger.info(`Event published to topic [${topic}]: ${payload.id}`);
    } catch (error) {
      this.logger.error(`Failed to publish event to topic [${topic}]: ${(error as Error).message}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}