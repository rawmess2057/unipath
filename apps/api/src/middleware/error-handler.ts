import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err.message, err.stack);

  if (res.headersSent) {
    console.error('Headers already sent, cannot send error response');
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError || env.NODE_ENV !== 'production'
    ? err.message
    : 'Internal server error';

  try {
    res.status(statusCode).json({ success: false, error: message });
  } catch (sendErr) {
    console.error('Error handler failed to send response:', sendErr);
    res.status(statusCode).type('text').send('Server error');
  }
}
