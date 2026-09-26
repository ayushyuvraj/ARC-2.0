import { Router } from 'express';
import { sendSuccess } from '../middleware/envelope.js';
import { prisma } from '@arc/database';

export const healthRouter = Router();

healthRouter.get('/health', async (req, res, next) => {
  try {
    // Quick DB liveness check
    const appCount = await prisma.application.count();
    sendSuccess(res, {
      status: 'HEALTHY',
      service: 'ARC Control Plane API',
      version: '1.0.0',
      database: 'CONNECTED',
      registeredApplications: appCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
