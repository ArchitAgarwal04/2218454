import { Request, Response, NextFunction } from 'express';
import { logEvent } from '../utils/logger';

export async function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Example: log all incoming requests at the route level
  await logEvent('backend', 'info', 'route', `${req.method} ${req.originalUrl} request received`);
  next();
} 