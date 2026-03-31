/// <reference path="./express.d.ts" />

export const TYPES = {
  CardIssueRepository: Symbol('CardIssueRepository'),
  CardIssueService: Symbol('CardIssueService'),
  CardIssueController: Symbol('CardIssueController'),
  KafkaEventBrokerProvider: Symbol('KafkaEventBrokerProvider'),
  KafkaEventConsumerProvider: Symbol('KafkaEventConsumerProvider'),
  EventDispatcher: Symbol('EventDispatcher'),
  CardIssuedHandler: Symbol('CardIssuedHandler'),
};
