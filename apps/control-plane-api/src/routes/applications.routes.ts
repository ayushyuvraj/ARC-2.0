import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess } from '../middleware/envelope.js';
import { CreateApplicationSchema } from '@arc/domain-core';

export const applicationsRouter = Router();

// GET /api/v1/applications - List all applications
applicationsRouter.get('/applications', async (req, res, next) => {
  try {
    const apps = await prisma.application.findMany({
      include: {
        useCases: true,
        deployments: {
          include: { target: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = apps.map((app) => ({
      ...app,
      branding: JSON.parse(app.brandingJson),
      permissions: JSON.parse(app.permissionsJson),
      userGroups: JSON.parse(app.userGroupsJson)
    }));

    sendSuccess(res, parsed);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/applications/:slugOrId - Get application details
applicationsRouter.get('/applications/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const app = await prisma.application.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        useCases: true,
        deployments: {
          include: { target: true }
        },
        runs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: `Application '${id}' not found` }
      });
    }

    sendSuccess(res, {
      ...app,
      branding: JSON.parse(app.brandingJson),
      permissions: JSON.parse(app.permissionsJson),
      userGroups: JSON.parse(app.userGroupsJson)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/applications - Create a new application
applicationsRouter.post('/applications', async (req, res, next) => {
  try {
    const validated = CreateApplicationSchema.parse(req.body);
    const created = await prisma.application.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        owner: validated.owner,
        businessUnit: validated.businessUnit,
        domain: validated.domain,
        brandingJson: JSON.stringify(validated.branding),
        uiMode: validated.uiMode
      }
    });

    sendSuccess(res, created, 201);
  } catch (error) {
    next(error);
  }
});
