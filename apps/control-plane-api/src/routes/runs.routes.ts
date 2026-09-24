import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess } from '../middleware/envelope.js';
import { CreateRunSchema } from '@arc/domain-core';

export const runsRouter = Router();

// GET /api/v1/runs - List runs with optional filters
runsRouter.get('/runs', async (req, res, next) => {
  try {
    const { applicationId, status } = req.query;
    const runs = await prisma.run.findMany({
      where: {
        ...(applicationId ? { applicationId: String(applicationId) } : {}),
        ...(status ? { status: String(status) } : {})
      },
      include: {
        application: true,
        useCase: true,
        traces: true,
        artifacts: true
      },
      orderBy: { startTime: 'desc' },
      take: 50
    });

    sendSuccess(res, runs);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/runs/:id - Get specific run with traces & artifacts
runsRouter.get('/runs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const run = await prisma.run.findUnique({
      where: { id },
      include: {
        application: true,
        useCase: true,
        workflow: true,
        deployment: { include: { target: true } },
        traces: { orderBy: { startTime: 'asc' } },
        artifacts: true
      }
    });

    if (!run) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: `Run '${id}' not found` }
      });
    }

    sendSuccess(res, run);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/runs - Create and queue a new Run
runsRouter.post('/runs', async (req, res, next) => {
  try {
    const validated = CreateRunSchema.parse(req.body);

    const run = await prisma.run.create({
      data: {
        applicationId: validated.applicationId,
        useCaseId: validated.useCaseId,
        workflowId: validated.workflowId,
        environment: validated.environment,
        inputsJson: JSON.stringify(validated.inputs),
        status: 'QUEUED'
      }
    });

    sendSuccess(res, run, 201);
  } catch (error) {
    next(error);
  }
});
