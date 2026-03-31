import 'reflect-metadata';

import { ICardIssue, ICardIssueRepository } from '../../../../src/interfaces/cards/card-issue.interface';
import { IKafkaEventBroker } from '../../../../src/interfaces/kafka/kafka-event-broker.interface';
import { CardIssueService } from './../../../../src/services/cards/card-issue.service';
import { KAFKA_TOPICS } from '../../../../src/shared/constants';
import { CardExistsError } from '../../../../src/utils/errors.util';
import { cardIssuePayload, savedCardMock, source } from '../../../mocks/cards.mock';

jest.mock('../../../../src/utils/event-counter.util', () => ({
  EventCounterUtil: {
    getInstance: jest.fn().mockReturnValue({
      next: jest.fn().mockReturnValue(100), 
    }),
  },
}));

describe('Card Issue Service Unit Test', () => {
  let cardIssueService: CardIssueService;
  let mockCardIssueRepository: jest.Mocked<ICardIssueRepository>;
  let mockKafkaEventBroker: jest.Mocked<IKafkaEventBroker>;

  beforeEach(() => {
    mockCardIssueRepository = {
      save: jest.fn(),
      findByDocumentNumber: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<ICardIssueRepository>;

    mockKafkaEventBroker = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<IKafkaEventBroker>;

    cardIssueService = new CardIssueService(
      mockCardIssueRepository,
      mockKafkaEventBroker
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear la solicitud, guardarla y publicar un evento en Kafka', async () => {
      mockCardIssueRepository.findByDocumentNumber.mockResolvedValue(null);
      mockCardIssueRepository.save.mockResolvedValue(savedCardMock);

      const result = await cardIssueService.create(cardIssuePayload, source);

      expect(mockCardIssueRepository.findByDocumentNumber).toHaveBeenCalledWith('12345678');
      expect(mockCardIssueRepository.save).toHaveBeenCalledWith(cardIssuePayload);      
      expect(result).toEqual({
        id: 'db-uuid-456',
        status: 'PENDING',
      });
      expect(mockKafkaEventBroker.publish).toHaveBeenCalledWith(
        KAFKA_TOPICS.CARD_REQUESTED,
        expect.objectContaining({
          id: 100, 
          source: source,
          type: KAFKA_TOPICS.CARD_REQUESTED,
          specversion: '1.0',
          data: expect.objectContaining({
            cardId: 'db-uuid-456',
            status: 'PENDING',
            forceError: false,
            source: source,
          }),
        })
      );
    });

    it('debe lanzar CardExistsError si el cliente ya tiene una tarjeta solicitada', async () => {
      const existingCard = { id: 'old-uuid' } as ICardIssue;
      mockCardIssueRepository.findByDocumentNumber.mockResolvedValue(existingCard);

      await expect(cardIssueService.create(cardIssuePayload, source)).rejects.toThrow(CardExistsError);
      
      expect(mockCardIssueRepository.save).not.toHaveBeenCalled();
      expect(mockKafkaEventBroker.publish).not.toHaveBeenCalled();
    });

    it('debe lanzar un error genérico si el repositorio falla al guardar', async () => {
      mockCardIssueRepository.findByDocumentNumber.mockResolvedValue(null);
      const dbError = new Error('Database connection failed');
      mockCardIssueRepository.save.mockRejectedValue(dbError);

      await expect(cardIssueService.create(cardIssuePayload, source)).rejects.toThrow('Database connection failed');
      expect(mockKafkaEventBroker.publish).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('debe actualizar el estado de la tarjeta y retornar la data actualizada', async () => {
      const cardId = 'card-uuid-123';
      const newStatus = 'ISSUED';
      const updatedCardMock = { id: cardId, status: newStatus } as ICardIssue;
      
      mockCardIssueRepository.updateStatus.mockResolvedValue(updatedCardMock);

      const result = await cardIssueService.updateStatus(cardId, newStatus);

      expect(mockCardIssueRepository.updateStatus).toHaveBeenCalledWith(cardId, newStatus);
      expect(result).toEqual(updatedCardMock);
    });

    it('debe propagar el error si el repositorio falla al actualizar', async () => {
      const errorMock = new Error('Not found');
      mockCardIssueRepository.updateStatus.mockRejectedValue(errorMock);

      await expect(cardIssueService.updateStatus('id', 'FAILED')).rejects.toThrow('Not found');
    });
  });
});