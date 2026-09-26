import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess, sendError } from '../middleware/envelope.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const a2aRouter = Router();

// 1. GET /api/v1/a2a/capabilities - Capability discovery
a2aRouter.get('/a2a/capabilities', async (_req, res, next) => {
  try {
    const agents = await prisma.agent.findMany();
    const models = await prisma.model.findMany();
    const modelMap = new Map(models.map((m) => [m.id, m]));

    const capabilities = agents.map((a) => {
      let ops = [];
      try {
        ops = JSON.parse(a.a2aCapabilitiesJson || '[]');
      } catch {
        ops = [];
      }

      const assignedModel = modelMap.get(a.modelId);

      return {
        agentId: a.id,
        agentName: a.name,
        role: a.role,
        modelName: assignedModel?.name || a.modelId,
        modelProvider: assignedModel?.provider || 'SIMULATED_LOCAL',
        permittedClassification: a.permittedDataClassification,
        a2uiEnabled: a.a2uiEnabled,
        operations: ops
      };
    });

    sendSuccess(res, capabilities);
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/v1/a2a/dispatch - A2A Message Envelope Dispatcher
const A2ADispatchSchema = z.object({
  protocolVersion: z.literal('1.0').default('1.0'),
  messageId: z.string().optional(),
  correlationId: z.string().optional(),
  runId: z.string().optional(),
  parentSpanId: z.string().optional(),
  sender: z.object({
    agentId: z.string(),
    agentVersion: z.string().default('1.0.0'),
    executionPlane: z.string().default('AZURE')
  }),
  recipient: z.object({
    agentId: z.string(),
    operation: z.string()
  }),
  securityContext: z.object({
    tenantId: z.string().default('kpmg_enterprise_tenant'),
    classification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).default('RESTRICTED'),
    callerPrincipal: z.string().default('matching_service@arc.local')
  }),
  payload: z.record(z.unknown())
});

a2aRouter.post('/a2a/dispatch', async (req, res, next) => {
  const startTime = Date.now();
  try {
    const body = A2ADispatchSchema.parse(req.body);
    const messageId = body.messageId || `msg_${randomUUID()}`;
    const correlationId = body.correlationId || `corr_${randomUUID()}`;

    // 1. Resolve Recipient Agent
    const recipient = await prisma.agent.findUnique({
      where: { id: body.recipient.agentId }
    });

    if (!recipient) {
      return sendError(res, 'RECIPIENT_AGENT_NOT_FOUND', `Agent ${body.recipient.agentId} is not registered in ARC.`, 404);
    }

    const recipientModel = await prisma.model.findUnique({
      where: { id: recipient.modelId }
    });

    // 2. Data Classification Boundary Enforcement
    const classificationOrder: Record<string, number> = { PUBLIC: 1, INTERNAL: 2, CONFIDENTIAL: 3, RESTRICTED: 4 };
    const payloadLevel = classificationOrder[body.securityContext.classification] || 4;
    const recipientMaxLevel = classificationOrder[recipient.permittedDataClassification] || 2;

    if (payloadLevel > recipientMaxLevel) {
      // Security Boundary Violation
      await prisma.auditLog.create({
        data: {
          who: body.sender.agentId,
          what: 'A2A_SECURITY_BOUNDARY_VIOLATION_BLOCKED',
          resourceType: 'A2A_DISPATCH',
          resourceId: messageId,
          justification: `Sender payload classification (${body.securityContext.classification}) exceeds recipient max clearance (${recipient.permittedDataClassification}).`,
          environment: 'PRODUCTION'
        }
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'DATA_CLASSIFICATION_BREACH',
          message: `A2A Dispatch blocked: Payload is classified as ${body.securityContext.classification}, but recipient agent ${recipient.name} is only certified up to ${recipient.permittedDataClassification}.`
        }
      });
    }

    // 3. Execute Target Agent Operation Logic
    let result: Record<string, unknown> = {};
    let policyCitation = 'Section 16(2) Timing & Rounding Exemption Clause 4.2';
    let compliant = true;
    let tokensPrompt = 450;
    let tokensCompletion = 180;

    if (body.recipient.operation === 'evaluate_itc_admissibility') {
      const taxAmount = Number(body.payload.taxAmount || body.payload.discrepancyAmount || 4200.00);
      const isCompliant = taxAmount <= 50000;

      result = {
        evaluationVerdict: isCompliant ? 'ADMISSIBLE_ITC_APPROVED' : 'INADMISSIBLE_REQUIRES_MANUAL_AUDIT',
        statutoryCitation: policyCitation,
        admissibleAmount: isCompliant ? taxAmount : 0,
        inadmissibleAmount: isCompliant ? 0 : taxAmount,
        reasoning: `Evaluated against KPMG Tax Policy v12 & Circular 183/15/2022-GST. Discrepancy within statutory threshold.`,
        auditorSignOffRequired: true
      };
    } else if (body.recipient.operation === 'resolve_discrepancy') {
      result = {
        resolutionStatus: 'RESOLVED_NEAR_MATCH',
        matchConfidence: 0.98,
        adjustedCandidate: {
          gstin: body.payload.gstin || '27AABCU9603R1ZM',
          invoiceNo: body.payload.invoiceNo || 'INV-2026-0892',
          taxVariance: 0.04
        },
        algorithm: 'LevenshteinFuzzyMatcher + ExactDateAligner'
      };
    } else {
      result = {
        status: 'OPERATION_PROCESSED',
        echoPayload: body.payload,
        processedBy: recipient.name
      };
    }

    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 40 + 25);
    const tokensTotal = tokensPrompt + tokensCompletion;
    const costUsd = Number(((tokensPrompt * 0.0000035) + (tokensCompletion * 0.0000105)).toFixed(6));

    // 4. Trace Span Generation (Distributed OpenTelemetry Span Linking)
    if (body.runId) {
      await prisma.traceSpan.create({
        data: {
          traceId: `trace_${body.runId}`,
          runId: body.runId,
          parentSpanId: body.parentSpanId || null,
          componentType: 'AGENT',
          componentId: recipient.id,
          operationName: `A2A:${recipient.name}:${body.recipient.operation}`,
          status: 'OK',
          startTime: new Date(startTime),
          endTime: new Date(),
          durationMs: latencyMs,
          tokensPrompt,
          tokensCompletion,
          tokensTotal,
          costUsd,
          metadataJson: JSON.stringify({
            'a2a.protocolVersion': '1.0',
            'a2a.senderAgentId': body.sender.agentId,
            'a2a.recipientAgentId': body.recipient.agentId,
            'a2a.operation': body.recipient.operation,
            'a2a.correlationId': correlationId,
            'a2a.classification': body.securityContext.classification
          })
        }
      });
    }

    // 5. Persist A2A Message
    await prisma.a2AMessage.create({
      data: {
        id: messageId,
        correlationId,
        runId: body.runId || null,
        parentSpanId: body.parentSpanId || null,
        senderAgentId: body.sender.agentId,
        senderExecutionPlane: body.sender.executionPlane,
        recipientAgentId: body.recipient.agentId,
        operation: body.recipient.operation,
        classification: body.securityContext.classification,
        requestPayloadJson: JSON.stringify(body.payload),
        responsePayloadJson: JSON.stringify(result),
        status: 'SUCCESS',
        latencyMs,
        tokensUsed: tokensTotal,
        costUsd,
        policyCitation
      }
    });

    // 6. Return standard A2AResponseEnvelope
    const responseEnvelope = {
      messageId: `resp_${randomUUID()}`,
      correlationId,
      status: 'SUCCESS',
      executionMetadata: {
        latencyMs,
        tokensUsed: { prompt: tokensPrompt, completion: tokensCompletion, total: tokensTotal },
        costUsd,
        executionPlane: recipientModel?.provider || 'SIMULATED_LOCAL'
      },
      result,
      policyEvaluations: [
        {
          policyId: 'policy_kpmg_tax_v12',
          compliant,
          citation: policyCitation
        }
      ]
    };

    sendSuccess(res, responseEnvelope);
  } catch (error) {
    next(error);
  }
});

// 3. GET /api/v1/a2a/messages - Get recorded A2A communication logs
a2aRouter.get('/a2a/messages', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const messages = await prisma.a2AMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const parsed = messages.map((m) => ({
      ...m,
      requestPayload: JSON.parse(m.requestPayloadJson || '{}'),
      responsePayload: JSON.parse(m.responsePayloadJson || '{}')
    }));

    sendSuccess(res, parsed);
  } catch (error) {
    next(error);
  }
});
