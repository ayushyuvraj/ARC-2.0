import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess } from '../middleware/envelope.js';
import { generateWorkflowFromNaturalLanguage, validateWorkflowGraph } from '@arc/workflow-engine';

export const workflowsRouter = Router();

// GET /api/v1/workflows/:id
workflowsRouter.get('/workflows/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const wf = await prisma.workflow.findUnique({ where: { id } });
    if (!wf) return res.status(404).json({ success: false, error: { message: `Workflow '${id}' not found` } });

    sendSuccess(res, {
      ...wf,
      nodes: JSON.parse(wf.nodesJson),
      edges: JSON.parse(wf.edgesJson)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/workflows/generate-from-nl & /api/v1/workflows/generate-from-prompt
const handleNLGeneration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const description = req.body.prompt || req.body.description;
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'Workflow description or prompt is required' } });
    }

    const proposal = generateWorkflowFromNaturalLanguage(description);
    const validation = validateWorkflowGraph(proposal.nodes, proposal.edges);

    sendSuccess(res, {
      ...proposal,
      validation
    });
  } catch (error) {
    next(error);
  }
};

workflowsRouter.post('/workflows/generate-from-nl', handleNLGeneration);
workflowsRouter.post('/workflows/generate-from-prompt', handleNLGeneration);

// POST /api/v1/workflows/:id/validate - Validate graph topology
workflowsRouter.post('/workflows/:id/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const wf = await prisma.workflow.findUnique({ where: { id } });
    if (!wf) return res.status(404).json({ success: false, error: { message: `Workflow '${id}' not found` } });

    const nodes = JSON.parse(wf.nodesJson);
    const edges = JSON.parse(wf.edgesJson);
    const validation = validateWorkflowGraph(nodes, edges);

    sendSuccess(res, validation);
  } catch (error) {
    next(error);
  }
});
