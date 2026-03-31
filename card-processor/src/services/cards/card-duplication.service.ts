import { injectable } from 'inversify';
import pino from 'pino';
import { ICardDuplicationService } from '../../interfaces/cards/card-duplication.interface';

@injectable()
export class CardDuplicationService implements ICardDuplicationService {
  private processedEvents = new Map<string, { processedAt: Date; attempts: number }>();
  
  private logger = pino({
    name: CardDuplicationService.name,
    transport: { 
      target: 'pino-pretty', 
      options: { colorize: true, ignore: 'pid,hostname' } 
    },
  });

  isProcessed(cardId: string): boolean {
    return this.processedEvents.has(cardId);
  }

  markProcessed(cardId: string, attempts: number): void {
    this.processedEvents.set(cardId, {
      processedAt: new Date(),
      attempts,
    });
    this.logger.info(`Event marked as processed: cardId=${cardId}`);
  }

  markFailed(cardId: string, attempts: number): void {
    this.processedEvents.set(cardId, {
      processedAt: new Date(),
      attempts,
    });
    this.logger.warn(`Event marked as failed (DLQ): cardId=${cardId}`);
  }
}