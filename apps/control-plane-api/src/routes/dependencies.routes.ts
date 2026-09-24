import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess } from '../middleware/envelope.js';
import { ImpactAnalysisRequestSchema } from '@arc/domain-core';

export const dependenciesRouter = Router();

// GET /api/v1/dependencies - List all dependency edges in the system
dependenciesRouter.get('/dependencies', async (req, res, next) => {
  try {
    const edges = await prisma.dependencyEdge.findMany();
    sendSuccess(res, edges);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/dependencies/impact-analysis - Real recursive downstream blast radius calculation
dependenciesRouter.post('/dependencies/impact-analysis', async (req, res, next) => {
  try {
    const { resourceId } = ImpactAnalysisRequestSchema.parse(req.body);

    const allEdges = await prisma.dependencyEdge.findMany();

    // Traverse recursively
    const affectedAgents = new Set<string>();
    const affectedWorkflows = new Set<string>();
    const affectedUseCases = new Set<string>();
    const affectedApps = new Set<string>();
    const affectedDeployments = new Set<string>();

    const queue: Array<{ id: string; type: string }> = [{ id: resourceId, type: 'ROOT' }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const outgoing = allEdges.filter((edge) => edge.sourceId === current.id);
      for (const edge of outgoing) {
        if (edge.targetType === 'AGENT') affectedAgents.add(edge.targetId);
        if (edge.targetType === 'WORKFLOW') affectedWorkflows.add(edge.targetId);
        if (edge.targetType === 'USE_CASE') affectedUseCases.add(edge.targetId);
        if (edge.targetType === 'APPLICATION') affectedApps.add(edge.targetId);
        if (edge.targetType === 'DEPLOYMENT') affectedDeployments.add(edge.targetId);

        queue.push({ id: edge.targetId, type: edge.targetType });
      }
    }

    const agents = await prisma.agent.findMany({ where: { id: { in: Array.from(affectedAgents) } } });
    const workflows = await prisma.workflow.findMany({ where: { id: { in: Array.from(affectedWorkflows) } } });
    const applications = await prisma.application.findMany({ where: { id: { in: Array.from(affectedApps) } } });
    const deployments = await prisma.deployment.findMany({
      where: { id: { in: Array.from(affectedDeployments) } },
      include: { target: true }
    });

    const isCritical = deployments.some((d) => d.environment === 'PRODUCTION');
    const riskLevel = isCritical ? 'CRITICAL' : applications.length > 0 ? 'HIGH' : workflows.length > 0 ? 'MEDIUM' : 'LOW';

    sendSuccess(res, {
      targetResourceId: resourceId,
      riskLevel,
      requiresGovernanceApproval: isCritical,
      impactSummary: `Disabling this resource will affect ${agents.length} agents, ${workflows.length} workflows, ${applications.length} applications, and ${deployments.length} active deployments.`,
      affectedAgents: agents.map((a) => ({ id: a.id, name: a.name })),
      affectedWorkflows: workflows.map((w) => ({ id: w.id, name: w.name })),
      affectedApplications: applications.map((a) => ({ id: a.id, name: a.name })),
      affectedDeployments: deployments.map((d) => ({ id: d.id, environment: d.environment, target: d.target.name }))
    });
  } catch (error) {
    next(error);
  }
});
