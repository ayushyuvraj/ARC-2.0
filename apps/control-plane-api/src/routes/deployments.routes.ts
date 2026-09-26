import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess, sendError } from '../middleware/envelope.js';
import { getCloudAdapter } from '../services/cloud-adapters.service.js';
import { z } from 'zod';

export const deploymentsRouter = Router();

// 1. GET /api/v1/deployments/targets - List all Deployment Targets
deploymentsRouter.get('/deployments/targets', async (_req, res, next) => {
  try {
    const targets = await prisma.deploymentTarget.findMany({
      include: {
        deployments: {
          include: {
            application: { select: { id: true, name: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const parsed = targets.map((t) => ({
      ...t,
      egressRestrictions: JSON.parse(t.egressRestrictionsJson || '[]'),
      activeWorkloadsCount: t.deployments.length
    }));

    sendSuccess(res, parsed);
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/v1/deployments/topology - Multi-Cloud Topology Map
deploymentsRouter.get('/deployments/topology', async (_req, res, next) => {
  try {
    const targets = await prisma.deploymentTarget.findMany({
      include: {
        deployments: {
          include: { application: true }
        }
      }
    });

    const topology = {
      clouds: [
        {
          provider: 'KPMG_GCC',
          providerName: 'KPMG Sovereign GCC Enclave',
          region: 'eu-central (Frankfurt)',
          networkPerimeter: 'Air-Gapped Private VPC (FIPS 140-3 HSM)',
          egressPolicy: 'STRICT_BLOCK_INTERNET',
          healthStatus: 'HEALTHY',
          uptimePercentage: 99.99,
          targets: targets.filter((t) => t.type === 'KPMG_GCC')
        },
        {
          provider: 'AZURE',
          providerName: 'Microsoft Azure Commercial',
          region: 'eastus2 (Virginia)',
          networkPerimeter: 'Azure Private Link & Isolated Subnet',
          egressPolicy: 'PRIVATE_LINK_PEERED',
          healthStatus: 'HEALTHY',
          uptimePercentage: 99.98,
          targets: targets.filter((t) => t.type === 'AZURE')
        },
        {
          provider: 'VERTEX',
          providerName: 'Google Cloud Platform (GCP)',
          region: 'us-central1 (Iowa)',
          networkPerimeter: 'GCP VPC Service Controls (VPC-SC)',
          egressPolicy: 'SERVICE_PERIMETER_RESTRICTED',
          healthStatus: 'HEALTHY',
          uptimePercentage: 99.95,
          targets: targets.filter((t) => t.type === 'VERTEX')
        }
      ],
      totalDeploymentsCount: targets.reduce((acc, t) => acc + t.deployments.length, 0),
      crossCloudConnectivity: 'ACTIVE_MTLS_ENCLAVE_MESH'
    };

    sendSuccess(res, topology);
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/v1/deployments/targets/:id/ping - Diagnostic Cloud Adapter Ping
deploymentsRouter.post('/deployments/targets/:id/ping', async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await prisma.deploymentTarget.findUnique({ where: { id } });

    if (!target) {
      return sendError(res, 'TARGET_NOT_FOUND', `Deployment target ${id} not found`, 404);
    }

    const adapter = getCloudAdapter(target.type);
    const pingResult = await adapter.ping(target);

    sendSuccess(res, pingResult);
  } catch (error) {
    next(error);
  }
});

// 4. GET /api/v1/deployments - List All Application Deployments
deploymentsRouter.get('/deployments', async (req, res, next) => {
  try {
    const deployments = await prisma.deployment.findMany({
      include: {
        application: true,
        target: true
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, deployments);
  } catch (error) {
    next(error);
  }
});

// 5. POST /api/v1/deployments - Deploy Application / UseCase to Target
const CreateDeploymentSchema = z.object({
  applicationId: z.string(),
  useCaseId: z.string().optional(),
  targetId: z.string(),
  environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']).default('DEVELOPMENT'),
  version: z.string().default('1.0.0'),
  runtimeConfig: z.record(z.unknown()).default({})
});

deploymentsRouter.post('/deployments', async (req, res, next) => {
  try {
    const body = CreateDeploymentSchema.parse(req.body);

    const app = await prisma.application.findUnique({ where: { id: body.applicationId } });
    if (!app) {
      return sendError(res, 'APPLICATION_NOT_FOUND', `Application ${body.applicationId} not found`, 404);
    }

    const target = await prisma.deploymentTarget.findUnique({ where: { id: body.targetId } });
    if (!target) {
      return sendError(res, 'TARGET_NOT_FOUND', `Deployment target ${body.targetId} not found`, 404);
    }

    // If production, verify governance approval or require approval gate
    if (body.environment === 'PRODUCTION') {
      const existingApproval = await prisma.approvalRequest.findFirst({
        where: {
          targetResourceId: body.applicationId,
          actionType: 'DEPLOY_PRODUCTION',
          status: 'APPROVED'
        }
      });

      if (!existingApproval) {
        return sendError(
          res,
          'APPROVAL_REQUIRED',
          `Promoting ${app.name} to PRODUCTION on target ${target.name} requires signed governance approval in Approvals Queue.`,
          403
        );
      }
    }

    const deployment = await prisma.deployment.create({
      data: {
        applicationId: body.applicationId,
        useCaseId: body.useCaseId || null,
        targetId: body.targetId,
        environment: body.environment,
        version: body.version,
        runtimeConfigJson: JSON.stringify(body.runtimeConfig),
        status: 'DEPLOYED'
      },
      include: {
        application: true,
        target: true
      }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        who: 'platform-operator@kpmg.com',
        what: 'DEPLOY_APPLICATION',
        resourceType: 'DEPLOYMENT',
        resourceId: deployment.id,
        justification: `Application ${app.name} deployed to ${target.name} (${body.environment}).`,
        environment: body.environment
      }
    });

    sendSuccess(res, deployment, 201);
  } catch (error) {
    next(error);
  }
});
