import {
  Request, Response, NextFunction } from 'express';

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = crypto.randomUUID();
  req.requestId = correlationId;
  res.setHeader('x-request-id', correlationId);

  next();
};