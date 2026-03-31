import { Router } from 'express';

import { TYPES } from '../types';
import { container } from '../configs/inversify.config';
import { validateDto } from '../middlewares/validate-dto.middleware';
import { CreateCardIssueDto } from '../dtos/create-card-issue.dto';
import { CardIssueController } from '../controllers/cards/card-issue.controller';

const router = Router();

const cardIssueController = container.get<CardIssueController>(TYPES.CardIssueController);

router.post('/', validateDto(CreateCardIssueDto), (req, res) => cardIssueController.create(req, res));

export { router as cardIssueRoutes };