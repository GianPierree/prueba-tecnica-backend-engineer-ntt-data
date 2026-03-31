export interface ICardEmission {
  cardIssuerId: string;
  id: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
}

export interface ICardEmissionService {
  generateCard(cardIssuerId: string): Promise<ICardEmission | null>;
}