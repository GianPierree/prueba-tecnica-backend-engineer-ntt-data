export class CardExistsError extends Error {
  readonly statusCode = 409;

  constructor(documentNumber: string) {
    super(`Customer with document ${documentNumber} already has an active card`);
    this.name = 'CardExistsError';
  }
}