import { ICardEmission } from '../../src/interfaces/cards/card-emission.interface';
import { ICardIssuePayload } from '../../src/interfaces/cards/card-issue-payload.interface';

export const payloadMock: ICardIssuePayload = { 
  source: 'req-uuid-123',
  cardId: 'card-123',
  status: 'pending',
  forceError: false
};

export const cardEmissionMock: ICardEmission = { 
  cardNumber: '4111222233334444', 
  cvv: '123',
  cardIssuerId: 'issuer-123',
  id: 'card-123',
  expirationDate: '12/25'
};