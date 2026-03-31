import 'reflect-metadata';
import { CardIssueRepository } from '../../../../src/repositories/cards/card-issue.repository';
import { ICardIssue } from '../../../../src/interfaces/cards/card-issue.interface';
import { payload } from '../../../mocks/cards.mock';

describe('Card Issue Repository Unit Test', () => {
  let cardIssueRepository: CardIssueRepository;

  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: jest.fn().mockReturnValue('mock-uuid-1234-5678'),
      },
    });
  });

  beforeEach(() => {
    cardIssueRepository = new CardIssueRepository();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('debe guardar una nueva solicitud asignándole un ID y estado "pending"', async () => {
      const result = await cardIssueRepository.save(payload);

      expect(result).toEqual({
        ...payload,
        id: 'mock-uuid-1234-5678',
        status: 'pending',
      });
    });
  });

  describe('findByDocumentNumber', () => {
    it('debe retornar la tarjeta si existe una coincidencia con el documentNumber', async () => {
      
      await cardIssueRepository.save(payload);

      const result = await cardIssueRepository.findByDocumentNumber('11654321');

      expect(result).not.toBeNull();
      expect(result?.customer.documentNumber).toBe('11654321');
      expect(result?.id).toBe('mock-uuid-1234-5678');
    });

    it('debe retornar null si no hay ninguna tarjeta con ese documentNumber', async () => {
      const result = await cardIssueRepository.findByDocumentNumber('99999999');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('debe actualizar el estado de una tarjeta existente y retornarla', async () => {
      const payload: Omit<ICardIssue, 'id'> = {
        customer: { documentNumber: '11111111' },
      } as any;
      
      await cardIssueRepository.save(payload);

      const updatedCard = await cardIssueRepository.updateStatus('mock-uuid-1234-5678', 'ISSUED');

      expect(updatedCard.id).toBe('mock-uuid-1234-5678');
      expect(updatedCard.status).toBe('ISSUED');

      const checkCard = await cardIssueRepository.findByDocumentNumber('11111111');
      expect(checkCard?.status).toBe('ISSUED');
    });

    it('debe lanzar un error y mostrar un console.warn si el ID de la tarjeta no existe', async () => {
      const nonExistentId = 'uuid-fantasma';

      await expect(cardIssueRepository.updateStatus(nonExistentId, 'FAILED')).rejects.toThrow(`Card with id ${nonExistentId} not found`);
      
      expect(console.warn).toHaveBeenCalledWith(`Card with id ${nonExistentId} not found`);
    });
  });
});