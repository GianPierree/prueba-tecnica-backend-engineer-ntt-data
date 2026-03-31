export interface ICardEmission {
  cardIssuerId: string;
  id: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  error?: object;
}

export interface ICardEmissionService {
  generateCard(cardIssuerId: string, forceError?: boolean): Promise<ICardEmission | null>;
}