import 'reflect-metadata';

import { ICardDuplicationService } from '../../../../src/interfaces/cards/card-duplication.interface';
import { ICardEmissionService } from '../../../../src/interfaces/cards/card-emission.interface';
import { IKafkaEventBroker } from '../../../../src/interfaces/kafka/kafka-event-broker.interface';
import { CardRetriesService } from './../../../../src/services/cards/card-retries.service';
import { KAFKA_TOPICS } from '../../../../src/shared/constants';
import { payloadMock } from './../../../mocks/cards.mock';

jest.mock('../../../../src/utils/event-counter.util', () => ({
  EventCounterUtil: {
    getInstance: jest.fn().mockReturnValue({
      next: jest.fn().mockReturnValue(999),
    }),
  },
}));

describe('Card Retries Service Unit Tests', () => {
  let cardRetriesService: CardRetriesService;
  let mockCardEmissionService: jest.Mocked<ICardEmissionService>;
  let mockKafkaBroker: jest.Mocked<IKafkaEventBroker>;
  let mockDuplicationService: jest.Mocked<ICardDuplicationService>;

  beforeEach(() => {
    mockCardEmissionService = {
      generateCard: jest.fn(),
    };
    mockKafkaBroker = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      publish: jest.fn(),
    };
    mockDuplicationService = {
      isProcessed: jest.fn(),
      markProcessed: jest.fn(),
      markFailed: jest.fn(),
    };

    cardRetriesService = new CardRetriesService(
      mockCardEmissionService,
      mockKafkaBroker,
      mockDuplicationService
    );

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('debe abortar y retornar null si el evento ya fue procesado (duplicado)', async () => {
    mockDuplicationService.isProcessed.mockReturnValue(true);

    const result = await cardRetriesService.processWithRetries(payloadMock);

    expect(result).toBeNull();
    expect(mockCardEmissionService.generateCard).not.toHaveBeenCalled();
  });

  it('debe procesar exitosamente al primer intento sin delays', async () => {
    const cardMock = { id: 'card-1' } as any;
    mockDuplicationService.isProcessed.mockReturnValue(false);
    mockCardEmissionService.generateCard.mockResolvedValue(cardMock);

    const result = await cardRetriesService.processWithRetries(payloadMock);

    expect(result).toEqual(cardMock);
    expect(mockCardEmissionService.generateCard).toHaveBeenCalledTimes(1);
    expect(mockDuplicationService.markProcessed).toHaveBeenCalledWith(payloadMock.cardId, 0);
    expect(mockKafkaBroker.publish).not.toHaveBeenCalled();
  });

  it('debe reintentar y tener éxito en el segundo intento (después de 1 segundo)', async () => {
    const cardMock = { id: 'card-1' } as any;
    mockDuplicationService.isProcessed.mockReturnValue(false);
    
    mockCardEmissionService.generateCard
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(cardMock);

    const promise = cardRetriesService.processWithRetries(payloadMock);
    
    await jest.advanceTimersByTimeAsync(1000);
    
    const result = await promise;

    expect(result).toEqual(cardMock);
    expect(mockCardEmissionService.generateCard).toHaveBeenCalledTimes(2);
    expect(mockDuplicationService.markProcessed).toHaveBeenCalledWith(payloadMock.cardId, 1);
  });

  it('debe agotar los 3 reintentos (4 ejecuciones totales), enviar al DLQ y retornar null', async () => {
    mockDuplicationService.isProcessed.mockReturnValue(false);
    mockCardEmissionService.generateCard.mockResolvedValue(null);

    const promise = cardRetriesService.processWithRetries(payloadMock);
    
    await jest.advanceTimersByTimeAsync(1000);
    await jest.advanceTimersByTimeAsync(2000);
    await jest.advanceTimersByTimeAsync(4000);
    await jest.advanceTimersByTimeAsync(4000);

    const result = await promise;

    expect(result).toBeNull();
    
    expect(mockCardEmissionService.generateCard).toHaveBeenCalledTimes(4);
    
    expect(mockDuplicationService.markFailed).toHaveBeenCalledWith(payloadMock.cardId, 4);
    
    expect(mockKafkaBroker.publish).toHaveBeenCalledWith(
      KAFKA_TOPICS.CARD_DLQ,
      expect.objectContaining({
        type: KAFKA_TOPICS.CARD_DLQ,
        source: payloadMock.source,
        id: 999,
        data: expect.objectContaining({
          reason: 'Exhausted retries',
          attempts: 4,
          originalPayload: payloadMock
        })
      })
    );
  });
});