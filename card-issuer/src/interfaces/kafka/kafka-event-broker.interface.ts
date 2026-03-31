import { IKafkaCloudEvent } from './kafka-cloud-event.interface';

export interface IKafkaEventBroker {
  connect(): Promise<void>;
  publish<T>(topic: string, payload: IKafkaCloudEvent<T>): Promise<void>;
  disconnect(): Promise<void>;
}
