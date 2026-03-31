export interface IKafkaCloudEvent<T> {
  id: number;
  source: string;
  specversion: string;
  type: string;
  datacontenttype?: string;
  time?: string;
  data: T
}