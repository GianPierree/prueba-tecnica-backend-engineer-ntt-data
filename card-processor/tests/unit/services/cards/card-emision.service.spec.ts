import 'reflect-metadata';

import { CardEmissionService } from './../../../../src/services/cards/card-emission.service';

describe('CardEmissionService', () => {
  let cardEmissionService: CardEmissionService;

  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: jest.fn().mockReturnValue('mocked-uuid-1234-5678'),
      },
    });
  });

  beforeEach(() => {
    cardEmissionService = new CardEmissionService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('debe generar una tarjeta exitosamente cuando Math.random es menor a 0.8', async () => {
    const cardIssuerId = 'issuer-123';
    
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const generatePromise = cardEmissionService.generateCard(cardIssuerId);
        
    jest.advanceTimersByTime(500);
    
    const result = await generatePromise;

    expect(result).not.toBeNull();
    expect(result).toEqual({
      cardIssuerId: 'issuer-123',
      id: 'mocked-uuid-1234-5678',
      cardNumber: '4555 5555 5555 5555', 
      expirationDate: expect.any(String), 
      cvv: '550', 
    });
  });

  it('debe retornar null (fallo simulado de banco) cuando Math.random es mayor o igual a 0.8', async () => {
    const cardIssuerId = 'issuer-456';
    
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const generatePromise = cardEmissionService.generateCard(cardIssuerId);
    jest.advanceTimersByTime(500);
    const result = await generatePromise;

    expect(result).toBeNull();
  });

  it('debe retornar null sin importar el factor aleatorio si forceError es true', async () => {
    const cardIssuerId = 'issuer-789';
    
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const generatePromise = cardEmissionService.generateCard(cardIssuerId, true);
    jest.advanceTimersByTime(500);
    const result = await generatePromise;

    expect(result).toBeNull();
  });

  it('debe generar un número de tarjeta con el formato correcto (16 dígitos separados por espacios y empieza con 4)', async () => {
    jest.spyOn(Math, 'random').mockRestore();
    
    let result = null;
    while (!result) {
      const promise = cardEmissionService.generateCard('issuer-test');
      jest.advanceTimersByTime(500);
      result = await promise;
    }

    const cardRegex = /^4\d{3} \d{4} \d{4} \d{4}$/;
    expect(result?.cardNumber).toMatch(cardRegex);
    expect(result?.cvv).toMatch(/^\d{3}$/);
    expect(result?.expirationDate).toMatch(/^\d{2}\/\d{2}$/);
  });
});