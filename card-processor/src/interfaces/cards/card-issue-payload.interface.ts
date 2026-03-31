export interface ICardIssuePayload {
  cardId: string;
  status: string;
  forceError: boolean;
  source: string;
}

export interface IDLQPayload {
  originalPayload: ICardIssuePayload;
  reason: string;
  attempts: number;
  failedAt: string;
  error: Record<string, unknown>;
}