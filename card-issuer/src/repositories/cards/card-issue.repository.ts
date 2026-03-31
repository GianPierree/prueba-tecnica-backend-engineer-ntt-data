import { injectable } from 'inversify';

import {
  ICardIssue,
  ICardIssueRepository,
} from '../../interfaces/cards/card-issue.interface';

@injectable()
export class CardIssueRepository implements ICardIssueRepository {
  private cardIssues: Map<string, ICardIssue> = new Map();
  
  async save(cardIssue: Omit<ICardIssue, 'id'>): Promise<ICardIssue> {
    const newCardIssue: ICardIssue = {
      ...cardIssue,
      id: crypto.randomUUID(),
      status: 'pending',
    };
    this.cardIssues.set(newCardIssue.id, newCardIssue);
    return newCardIssue;
  }

  async updateStatus(id: string, status: string): Promise<ICardIssue> {
    const card = this.cardIssues.get(id);
    
    if (!card) {
      const message = `Card with id ${id} not found`;
      console.warn(message);
      throw new Error(message);
    }

    card.status = status;
    this.cardIssues.set(id, card);
    
    return card;
  }
}