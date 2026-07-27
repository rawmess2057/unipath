import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler.js';

export interface AuthUser {
  id: string;
  clerkId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const clerkId = req.headers['x-clerk-user-id'] as string | undefined;

  if (!clerkId) {
    return next(new AppError(401, 'Authentication required'));
  }

  req.user = { id: clerkId, clerkId };
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const clerkId = req.headers['x-clerk-user-id'] as string | undefined;

  if (clerkId) {
    req.user = { id: clerkId, clerkId };
  }

  next();
}
