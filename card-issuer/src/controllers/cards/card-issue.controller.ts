import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from '../../types';
import { ICardIssueService } from '../../interfaces/cards/card-issue.interface';
import { CardExistsError } from '../../utils/errors.util';

@injectable()
export class CardIssueController {
  constructor(
    @inject(TYPES.CardIssueService) private readonly cardIssueService: ICardIssueService,
  ) {}

  async create(req: Request, res: Response) {
    try {
      const cardIssue = await this.cardIssueService.create(req.body, req.requestId || 'unknown');
      res.status(201).json({
        success: true,
        message: 'Card issue created successfully',
        requestId: cardIssue.id,
        status: cardIssue.status,
      });
    } catch (error) {
      if (error instanceof CardExistsError) {
        return res.status(409).json({ error: error.message });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: (error as Error).message 
      });
    }
  }
}
