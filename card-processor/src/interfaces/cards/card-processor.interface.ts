import { ICardIssuePayload } from "./card-issue-payload.interface";

export interface ICardProcessor {
  id: string;
  status: string;
  forceError: boolean;
}

export interface ICardProcessorRepository {
  save(cardProcessor: Omit<ICardProcessor, 'id' | 'status'>): Promise<ICardProcessor>;
}

export interface ICardProcessorService {
  approve(cardProcessor: ICardIssuePayload): Promise<void>;
}