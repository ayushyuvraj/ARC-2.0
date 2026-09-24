import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess } from '../middleware/envelope.js';
import { CreateRunSchema, ResumeRunSchema } from '@arc/domain-core';
import { WorkflowRunner } from '@arc/workflow-engine';

export const runsRouter = Router();

// GET /api/v1/runs - List runs with optional filters
runsRouter.get('/runs', async (req: Request, res: Response, next: NextFunction) => {
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
runsRouter.get('/runs/:id', async (req: Request, res: Response, next: NextFunction) => {
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

    sendSuccess(res, {
      ...run,
      inputs: JSON.parse(run.inputsJson || '{}'),
      outputs: run.outputsJson ? JSON.parse(run.outputsJson) : null,
      checkpoint: JSON.parse(run.checkpointStateJson || '{}')
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/runs - Create and queue a new Run
runsRouter.post('/runs', async (req: Request, res: Response, next: NextFunction) => {
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

// POST /api/v1/runs/:id/execute - Run the graph workflow
runsRouter.post('/runs/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const execution = await WorkflowRunner.executeRun(id);
    sendSuccess(res, execution);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/runs/:id/resume - Resume workflow paused for human approval
runsRouter.post('/runs/:id/resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { resumeToken, decision, humanComment } = ResumeRunSchema.parse(req.body);

    const resumed = await WorkflowRunner.resumeRun(id, resumeToken, decision, humanComment);
    sendSuccess(res, resumed);
  } catch (error) {
    next(error);
  }
});
