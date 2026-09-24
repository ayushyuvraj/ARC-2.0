import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess } from '../middleware/envelope.js';

export const registriesRouter = Router();

// Models Registry
registriesRouter.get('/registries/models', async (req, res, next) => {
  try {
    const models = await prisma.model.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, models);
  } catch (error) {
    next(error);
  }
});

// Tools Registry
registriesRouter.get('/registries/tools', async (req, res, next) => {
  try {
    const tools = await prisma.tool.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, tools);
  } catch (error) {
    next(error);
  }
});

// MCP Servers Registry
registriesRouter.get('/registries/mcp', async (req, res, next) => {
  try {
    const mcpServers = await prisma.mCPServer.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, mcpServers);
  } catch (error) {
    next(error);
  }
});

// Policies Registry
registriesRouter.get('/registries/policies', async (req, res, next) => {
  try {
    const policies = await prisma.policy.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, policies);
  } catch (error) {
    next(error);
  }
});

// Agents Registry
registriesRouter.get('/registries/agents', async (req, res, next) => {
  try {
    const agents = await prisma.agent.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, agents);
  } catch (error) {
    next(error);
  }
});

// Workflows Registry
registriesRouter.get('/registries/workflows', async (req, res, next) => {
  try {
    const workflows = await prisma.workflow.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, workflows);
  } catch (error) {
    next(error);
  }
});
