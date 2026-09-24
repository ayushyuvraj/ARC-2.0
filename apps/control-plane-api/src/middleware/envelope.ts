import { Request, Response, NextFunction } from 'express';

export function sendSuccess(res: Response, data: unknown, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error('API Error:', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_ERROR',
      message
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}
