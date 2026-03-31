import { ICardIssue } from "../../src/interfaces/cards/card-issue.interface";

export const source = 'req-uuid-123';

export const cardIssuePayload: Omit<ICardIssue, 'id'> = {
  customer: {
    documentType: 'DNI',
    documentNumber: '12345678',
    fullName: 'Juan Perez',
    age: 30,
    email: 'juan@test.com',
  },
  product: {
    type: 'VISA',
    currency: 'PEN',
  },
  status: 'PENDING',
  forceError: false,
};

export const savedCardMock: ICardIssue = {
  ...cardIssuePayload,
  id: 'db-uuid-456',
};

export const payload: Omit<ICardIssue, 'id'> = {
  customer: {
    documentType: 'DNI',
    documentNumber: '11654321',
    fullName: 'Juan Perez',
    age: 30,
    email: 'juan@test.com',
  },
  product: { type: 'VISA', currency: 'PEN' },
  status: 'pending',
  forceError: false,
};