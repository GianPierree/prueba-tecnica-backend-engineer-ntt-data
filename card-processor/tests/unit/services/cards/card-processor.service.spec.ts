import 'reflect-metadata';

import { CardProcessorService } from './../../../../src/services/cards/card-processor.service';
import { ICardRetriesService } from '../../../../src/interfaces/cards/card-retries.interface';
import { IKafkaEventBroker } from '../../../../src/interfaces/kafka/kafka-event-broker.interface';
import { KAFKA_TOPICS } from '../../../../src/shared/constants';
import { cardEmissionMock, payloadMock } from '../../../mocks/cards.mock';

describe('Card Processor Service Unit Tests', () => {
  let cardProcessorService: CardProcessorService;
  let mockCardRetriesService: jest.Mocked<ICardRetriesService>;
  let mockKafkaEventBroker: jest.Mocked<IKafkaEventBroker>;

  beforeEach(() => {
    mockCardRetriesService = {
      processWithRetries: jest.fn(),
    };
    mockKafkaEventBroker = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      publish: jest.fn(),
    };

    cardProcessorService = new CardProcessorService(
      mockCardRetriesService,
      mockKafkaEventBroker
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debe aprobar la solicitud, procesar la tarjeta y emitir un evento', async () => {
    mockCardRetriesService.processWithRetries.mockResolvedValue(cardEmissionMock);

    await cardProcessorService.approve(payloadMock);

    expect(mockCardRetriesService.processWithRetries).toHaveBeenCalledWith(payloadMock);
    expect(mockCardRetriesService.processWithRetries).toHaveBeenCalledTimes(1);
    
    expect(mockKafkaEventBroker.publish).toHaveBeenCalledWith(
      KAFKA_TOPICS.CARD_ISSUED,
      expect.objectContaining({
        type: KAFKA_TOPICS.CARD_ISSUED,
        source: 'req-uuid-123',
        specversion: '1.0',
        data: expect.objectContaining({
          cardNumber: '4111222233334444'
        })
      })
    );
  });

  it('No debe emitir ningún evento si processWithRetries devuelve null (agotó reintentos)', async () => {
    mockCardRetriesService.processWithRetries.mockResolvedValue(null as any);

    await cardProcessorService.approve(payloadMock);

    expect(mockCardRetriesService.processWithRetries).toHaveBeenCalledWith(payloadMock);
    expect(mockKafkaEventBroker.publish).not.toHaveBeenCalled();
  });
});