import 'reflect-metadata';

import { CardDuplicationService } from './../../../../src/services/cards/card-duplication.service';

describe('Card Duplication Service Unit Tests', () => {
  let cardDuplicationService: CardDuplicationService;

  beforeEach(() => {
    cardDuplicationService = new CardDuplicationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isProcessed', () => {
    it('debe retornar false si el evento (cardId) no ha sido registrado aún', () => {
      const result = cardDuplicationService.isProcessed('uuid-desconocido');

      expect(result).toBe(false);
    });
  });

  describe('markProcessed', () => {
    it('debe registrar el evento como procesado y luego isProcessed debe retornar true', () => {
      const cardId = 'uuid-procesado-123';
      const attempts = 1;

      cardDuplicationService.markProcessed(cardId, attempts);
      const isNowProcessed = cardDuplicationService.isProcessed(cardId);

      expect(isNowProcessed).toBe(true);
    });
  });

  describe('markFailed', () => {
    it('debe registrar el evento como fallido (en el Map interno) y luego isProcessed debe retornar true', () => {
      const cardId = 'uuid-fallido-456';
      const attempts = 3;

      cardDuplicationService.markFailed(cardId, attempts);
      
      const isNowProcessed = cardDuplicationService.isProcessed(cardId);

      expect(isNowProcessed).toBe(true);
    });
  });
});