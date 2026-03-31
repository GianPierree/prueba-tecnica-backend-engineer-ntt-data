export interface IKafkaEventConsumer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startListening(topics: string[]): Promise<void>;
}