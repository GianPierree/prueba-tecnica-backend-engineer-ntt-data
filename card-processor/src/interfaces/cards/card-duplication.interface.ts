export interface ICardDuplicationService {
  isProcessed(cardId: string): boolean;
  markProcessed(cardId: string, attempts: number): void;
  markFailed(cardId: string, attempts: number): void;
}