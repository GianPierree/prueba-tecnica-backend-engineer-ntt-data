import { IKafkaCloudEvent } from './kafka-cloud-event.interface';

export interface IEventHandler<T> {
  handler(event: IKafkaCloudEvent<T>): Promise<void>;
}