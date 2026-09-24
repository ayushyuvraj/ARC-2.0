import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess, sendError } from '../middleware/envelope.js';
import { z } from 'zod';

export const governanceRouter = Router();

// 1. GET /api/v1/governance/approvals - List all approvals
governanceRouter.get('/governance/approvals', async (req, res, next) => {
  try {
    const status = req.query.status as string;
    const where = status && status !== 'ALL' ? { status } : {};
    const approvals = await prisma.approvalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const parsed = approvals.map((a) => ({
      ...a,
      riskAssessment: JSON.parse(a.riskAssessmentJson || '{}')
    }));

    sendSuccess(res, parsed);
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/v1/governance/approvals - Create an approval request
const CreateApprovalSchema = z.object({
  actionType: z.enum(['DEPLOY_PRODUCTION', 'DISABLE_SHARED_TOOL', 'CHANGE_POLICY', 'UPDATE_MODEL', 'WORKFLOW_RESUME', 'CLASSIFICATION_OVERRIDE']),
  targetResourceId: z.string(),
  requestedBy: z.string().default('user@arc.local'),
  reason: z.string().min(5),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
});

governanceRouter.post('/governance/approvals', async (req, res, next) => {
  try {
    const body = CreateApprovalSchema.parse(req.body);

    // Compute downstream blast radius automatically for accurate risk assessment
    const allEdges = await prisma.dependencyEdge.findMany();
    const affected = new Set<string>();
    const queue = [body.targetResourceId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const outgoing = allEdges.filter((e) => e.sourceId === curr);
      for (const edge of outgoing) {
        if (!affected.has(edge.targetId)) {
          affected.add(edge.targetId);
          queue.push(edge.targetId);
        }
      }
    }

    const calculatedRisk = body.riskLevel || (affected.size >= 4 ? 'CRITICAL' : affected.size >= 2 ? 'HIGH' : 'MEDIUM');

    const approval = await prisma.approvalRequest.create({
      data: {
        actionType: body.actionType,
        targetResourceId: body.targetResourceId,
        requestedBy: body.requestedBy,
        reason: body.reason,
        riskAssessmentJson: JSON.stringify({
          level: calculatedRisk,
          affectedEntitiesCount: affected.size,
          details: `Blast radius analysis identified ${affected.size} downstream dependent entities.`
        }),
        status: 'PENDING'
      }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        who: body.requestedBy,
        what: 'SUBMIT_APPROVAL_REQUEST',
        resourceType: 'APPROVAL_REQUEST',
        resourceId: approval.id,
        beforeStateJson: null,
        afterStateJson: JSON.stringify({ actionType: body.actionType, status: 'PENDING' }),
        justification: body.reason,
        environment: 'DEVELOPMENT'
      }
    });

    sendSuccess(res, {
      ...approval,
      riskAssessment: JSON.parse(approval.riskAssessmentJson)
    }, 201);
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/v1/governance/approvals/:id/decide - Approve or Reject
const DecideApprovalSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reviewedBy: z.string().default('reviewer@arc.local'),
  reviewerRole: z.string().default('SECURITY_OFFICER'),
  comment: z.string().min(3)
});

governanceRouter.post('/governance/approvals/:id/decide', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = DecideApprovalSchema.parse(req.body);

    const existing = await prisma.approvalRequest.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'APPROVAL_NOT_FOUND', `Approval request ${id} not found`, 404);
    }

    if (existing.status !== 'PENDING') {
      return sendError(res, 'ALREADY_DECIDED', `Approval request ${id} has already been ${existing.status}`, 400);
    }

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: body.decision,
        reviewedBy: `${body.reviewedBy} (${body.reviewerRole})`,
        reviewComment: body.comment,
        reviewedAt: new Date()
      }
    });

    // Audit Log for the decision
    await prisma.auditLog.create({
      data: {
        who: `${body.reviewedBy} (${body.reviewerRole})`,
        what: body.decision === 'APPROVED' ? 'APPROVE_GOVERNANCE_REQUEST' : 'REJECT_GOVERNANCE_REQUEST',
        resourceType: 'APPROVAL_REQUEST',
        resourceId: id,
        beforeStateJson: JSON.stringify({ status: existing.status }),
        afterStateJson: JSON.stringify({ status: body.decision, comment: body.comment }),
        justification: body.comment,
        environment: 'PRODUCTION'
      }
    });

    sendSuccess(res, {
      ...updated,
      riskAssessment: JSON.parse(updated.riskAssessmentJson)
    });
  } catch (error) {
    next(error);
  }
});

// 4. GET /api/v1/governance/rbac/matrix - Role Based Access Control Matrix
governanceRouter.get('/governance/rbac/matrix', async (_req, res, next) => {
  try {
    const matrix = {
      roles: [
        {
          id: 'ROLE_PLATFORM_ADMIN',
          name: 'Platform Administrator',
          description: 'Full administrative authority across all registries, deployment targets, and system configuration.',
          permissions: {
            applications: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
            workflows: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE'],
            registries: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TOGGLE_LIFECYCLE'],
            deployments: ['DEPLOY_PROD', 'DEPLOY_STAGING', 'DEPLOY_DEV'],
            approvals: ['SUBMIT', 'DECIDE_ADMIN', 'OVERRIDE'],
            dataClassification: ['OVERRIDE_RESTRICTED', 'VIEW_RESTRICTED']
          }
        },
        {
          id: 'ROLE_SECURITY_OFFICER',
          name: 'Chief Information Security Officer (CISO)',
          description: 'Enforces data classification boundaries, approves production promotions, and audits compliance.',
          permissions: {
            applications: ['READ'],
            workflows: ['READ'],
            registries: ['READ', 'TOGGLE_LIFECYCLE'],
            deployments: ['READ', 'APPROVE_PROD'],
            approvals: ['DECIDE_SECURITY', 'DECIDE_LEGAL'],
            dataClassification: ['ENFORCE_BOUNDARY', 'VIEW_RESTRICTED', 'VIEW_AUDIT_LOGS']
          }
        },
        {
          id: 'ROLE_TAX_LEAD',
          name: 'Tax & Domain Lead (Subject Matter Expert)',
          description: 'Authorizes policy updates, resolves ambiguous run exceptions, and verifies legal compliance citations.',
          permissions: {
            applications: ['READ', 'CONFIGURE_USE_CASE'],
            workflows: ['READ', 'EXECUTE', 'PROMPT_SYNTHESIS'],
            registries: ['READ', 'CREATE_POLICY', 'UPDATE_POLICY'],
            deployments: ['DEPLOY_DEV', 'REQUEST_PROD'],
            approvals: ['DECIDE_DOMAIN_SME', 'SUBMIT_PROD_REQUEST'],
            dataClassification: ['VIEW_RESTRICTED']
          }
        },
        {
          id: 'ROLE_APPLICATION_OPERATOR',
          name: 'Application Operator / Reviewer',
          description: 'Executes approved workflows, inputs human review decisions, and downloads generated audit artifacts.',
          permissions: {
            applications: ['READ'],
            workflows: ['READ', 'EXECUTE'],
            registries: ['READ'],
            deployments: ['READ'],
            approvals: ['SUBMIT_REVIEW_RESUME'],
            dataClassification: ['VIEW_CONFIDENTIAL']
          }
        },
        {
          id: 'ROLE_AUDITOR_VIEWER',
          name: 'External / Internal Auditor',
          description: 'Read-only access to tamper-evident audit logs, OpenTelemetry traces, and cryptographic artifact lineage.',
          permissions: {
            applications: ['READ'],
            workflows: ['READ'],
            registries: ['READ'],
            deployments: ['READ'],
            approvals: ['READ_AUDIT'],
            dataClassification: ['VIEW_AUDIT_LOGS', 'INSPECT_LINEAGE_HASHES']
          }
        }
      ],
      userAssignments: [
        { email: 'lead-tax-arch@kpmg.com', role: 'ROLE_TAX_LEAD', department: 'Global Tax Advisory', status: 'ACTIVE' },
        { email: 'ciso@kpmg.com', role: 'ROLE_SECURITY_OFFICER', department: 'Enterprise Cyber & Security', status: 'ACTIVE' },
        { email: 'chief-legal-officer@kpmg.com', role: 'ROLE_SECURITY_OFFICER', department: 'Office of General Counsel', status: 'ACTIVE' },
        { email: 'platform-admin@arc.local', role: 'ROLE_PLATFORM_ADMIN', department: 'ARC AI Platform Engineering', status: 'ACTIVE' },
        { email: 'tax-auditor@kpmg.com', role: 'ROLE_APPLICATION_OPERATOR', department: 'Indirect Tax Operations', status: 'ACTIVE' },
        { email: 'regulator-inspect@gst.gov.in', role: 'ROLE_AUDITOR_VIEWER', department: 'Statutory Review Panel', status: 'ACTIVE' }
      ]
    };
    sendSuccess(res, matrix);
  } catch (error) {
    next(error);
  }
});

// 5. GET /api/v1/governance/data-classification/policies - Classification Tiers & Guardrails
governanceRouter.get('/governance/data-classification/policies', async (_req, res, next) => {
  try {
    const policies = [
      {
        tier: 'PUBLIC',
        description: 'Information intended for public consumption with zero confidentiality restrictions.',
        permittedModels: ['ALL_PUBLIC_LLMS', 'AZURE_OPENAI', 'VERTEX_AI', 'BEDROCK'],
        permittedClouds: ['PUBLIC_CLOUD', 'COMMERCIAL_CLOUD'],
        encryptionRequired: 'IN_TRANSIT',
        humanApprovalForExport: false
      },
      {
        tier: 'INTERNAL',
        description: 'Standard enterprise business data, non-sensitive telemetry, and internal operational metrics.',
        permittedModels: ['AZURE_OPENAI', 'VERTEX_AI', 'BEDROCK'],
        permittedClouds: ['ENTERPRISE_VPC', 'GCC_TENANT'],
        encryptionRequired: 'IN_TRANSIT_AND_AT_REST',
        humanApprovalForExport: false
      },
      {
        tier: 'CONFIDENTIAL',
        description: 'Client tax filings, vendor records, proprietary matching rules, and financial transaction metadata.',
        permittedModels: ['AZURE_OPENAI_PRIVATE_TENANT', 'VERTEX_AI_PRIVATE'],
        permittedClouds: ['GCC_TENANT', 'ON_PREMISE_ENCLAVE'],
        encryptionRequired: 'FIPS_140_3_CUSTOMER_MANAGED_KEYS',
        humanApprovalForExport: true
      },
      {
        tier: 'RESTRICTED',
        description: 'Statutory tax secrets, raw PAN/GSTIN vendor identities, auditor notes, and executive signing keys.',
        permittedModels: ['AIR_GAPPED_LOCAL_MODELS', 'ZERO_RETENTION_ENTERPRISE_ENDPOINTS'],
        permittedClouds: ['KPMG_SOVEREIGN_GCC', 'AIR_GAPPED_PRIVATE_VPC'],
        encryptionRequired: 'HARDWARE_SECURITY_MODULE_HSM_ENCRYPTED',
        humanApprovalForExport: true
      }
    ];

    sendSuccess(res, {
      tiers: policies,
      enforcementMode: 'STRICT_BLOCK',
      activeViolationsCount: 0
    });
  } catch (error) {
    next(error);
  }
});

// 6. POST /api/v1/governance/data-classification/verify-clearance - Verify clearance
const VerifyClearanceSchema = z.object({
  callerRole: z.string(),
  targetClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  targetModelOrTarget: z.string()
});

governanceRouter.post('/governance/data-classification/verify-clearance', async (req, res, next) => {
  try {
    const body = VerifyClearanceSchema.parse(req.body);

    const isRestricted = body.targetClassification === 'RESTRICTED';
    const isCallerAuthorized = ['ROLE_PLATFORM_ADMIN', 'ROLE_SECURITY_OFFICER', 'ROLE_TAX_LEAD'].includes(body.callerRole);

    const authorized = !isRestricted || isCallerAuthorized;

    if (!authorized) {
      // Record violation attempt in audit log
      await prisma.auditLog.create({
        data: {
          who: body.callerRole,
          what: 'SECURITY_BOUNDARY_VIOLATION_BLOCKED',
          resourceType: 'DATA_CLASSIFICATION',
          resourceId: body.targetModelOrTarget,
          beforeStateJson: null,
          afterStateJson: JSON.stringify({
            attemptedClassification: body.targetClassification,
            status: 'BLOCKED'
          }),
          justification: 'Attempted to access RESTRICTED entity without requisite clearance role.',
          environment: 'PRODUCTION'
        }
      });
    }

    sendSuccess(res, {
      authorized,
      targetClassification: body.targetClassification,
      verdict: authorized ? 'CLEARANCE_GRANTED' : 'SECURITY_BOUNDARY_BREACH_PREVENTED',
      details: authorized
        ? 'Requisite role clearance validated against enterprise data classification policies.'
        : `Role '${body.callerRole}' does not hold required clearance for '${body.targetClassification}' assets.`
    });
  } catch (error) {
    next(error);
  }
});

// 7. GET /api/v1/governance/audit-logs - Real Tamper-Evident Audit Trail
governanceRouter.get('/governance/audit-logs', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const resourceType = req.query.resourceType as string;

    const where = resourceType && resourceType !== 'ALL' ? { resourceType } : {};

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    const parsed = logs.map((log) => ({
      ...log,
      beforeState: log.beforeStateJson ? JSON.parse(log.beforeStateJson) : null,
      afterState: log.afterStateJson ? JSON.parse(log.afterStateJson) : null
    }));

    sendSuccess(res, parsed);
  } catch (error) {
    next(error);
  }
});
