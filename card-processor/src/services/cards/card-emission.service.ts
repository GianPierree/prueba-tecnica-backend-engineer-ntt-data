import { injectable } from 'inversify';
import pino from 'pino';

import {
  ICardEmissionService,
  ICardEmission,
} from '../../interfaces/cards/card-emission.interface';

@injectable()
export class CardEmissionService implements ICardEmissionService {

  private logger = pino({
    name: CardEmissionService.name,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  });

  async generateCard(cardIssuerId: string): Promise<ICardEmission | null> {
    const delay = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const isSuccess = Math.random() < 0.8; 
    
    if (!isSuccess) {
      this.logger.error('BANK_INTEGRATION_ERROR: Card generation failed.');
      return null;
    }

    const card = {
      cardIssuerId,
      id: crypto.randomUUID(),
      cardNumber: this.generateFakeCardNumber(),
      expirationDate: this.generateFakeExpirationDate(),
      cvv: this.generateFakeCvv(),
    };

    this.logger.info(`Card generated successfully: ${JSON.stringify(card)}`);
    return card;
  }

  private generateFakeCardNumber(): string {
    let num = '4';
    for (let i = 0; i < 15; i++) {
      num += Math.floor(Math.random() * 10).toString();
    }
    return num.match(/.{1,4}/g)?.join(' ') || num;
  }

  private generateFakeExpirationDate(): string {
    const month = Math.floor(Math.random() * 12) + 1;
    const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1; 
    
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedYear = year.toString().slice(-2);
    
    return `${formattedMonth}/${formattedYear}`;
  }

  private generateFakeCvv(): string {
    return Math.floor(100 + Math.random() * 900).toString(); 
  }
}