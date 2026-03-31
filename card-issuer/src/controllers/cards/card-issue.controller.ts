import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from '../../types';
import { ICardIssueService } from '../../interfaces/cards/card-issue.interface';

@injectable()
export class CardIssueController {
  constructor(
    @inject(TYPES.CardIssueService) private readonly cardIssueService: ICardIssueService,
  ) {}

  async create(req: Request, res: Response) {
    try {
      const cardIssue = await this.cardIssueService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Card issue created successfully',
        requestId: req.requestId,
        cardIssue: {
          id: cardIssue.id,
          status: cardIssue.status,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
