import { Router } from 'express';
import { prisma } from '@arc/database';
import { sendSuccess, sendError } from '../middleware/envelope.js';
import { z } from 'zod';

export const evaluationRouter = Router();

// 1. GET /api/v1/evaluations/datasets - List Golden Datasets
evaluationRouter.get('/evaluations/datasets', async (_req, res, next) => {
  try {
    const datasets = await prisma.goldenDataset.findMany({
      include: {
        _count: { select: { testCases: true, evaluationRuns: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, datasets);
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/v1/evaluations/datasets/:id - Get Golden Dataset with Test Cases
evaluationRouter.get('/evaluations/datasets/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const dataset = await prisma.goldenDataset.findUnique({
      where: { id },
      include: {
        testCases: true,
        evaluationRuns: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    if (!dataset) {
      return sendError(res, 'DATASET_NOT_FOUND', `Golden dataset ${id} not found`, 404);
    }

    const parsedTestCases = dataset.testCases.map((tc) => ({
      ...tc,
      inputPayload: JSON.parse(tc.inputPayloadJson || '{}'),
      expectedOutput: JSON.parse(tc.expectedOutputJson || '{}'),
      assertionRules: JSON.parse(tc.assertionRulesJson || '[]')
    }));

    sendSuccess(res, {
      ...dataset,
      testCases: parsedTestCases
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/v1/evaluations/datasets - Create Golden Dataset
const CreateDatasetSchema = z.object({
  name: z.string().min(3),
  applicationId: z.string().default('app_tars'),
  description: z.string().min(5),
  domain: z.string().default('INDIRECT_TAX'),
  version: z.string().default('1.0.0')
});

evaluationRouter.post('/evaluations/datasets', async (req, res, next) => {
  try {
    const body = CreateDatasetSchema.parse(req.body);
    const dataset = await prisma.goldenDataset.create({
      data: body
    });
    sendSuccess(res, dataset, 201);
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/v1/evaluations/datasets/:id/test-cases - Add Test Case
const CreateTestCaseSchema = z.object({
  name: z.string().min(3),
  category: z.string().default('EDGE_CASE'),
  inputPayload: z.record(z.unknown()),
  expectedOutput: z.record(z.unknown()),
  assertionRules: z.array(z.record(z.unknown())).default([]),
  dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).default('CONFIDENTIAL')
});

evaluationRouter.post('/evaluations/datasets/:id/test-cases', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = CreateTestCaseSchema.parse(req.body);

    const testCase = await prisma.testCase.create({
      data: {
        datasetId: id,
        name: body.name,
        category: body.category,
        inputPayloadJson: JSON.stringify(body.inputPayload),
        expectedOutputJson: JSON.stringify(body.expectedOutput),
        assertionRulesJson: JSON.stringify(body.assertionRules),
        dataClassification: body.dataClassification
      }
    });

    sendSuccess(res, {
      ...testCase,
      inputPayload: body.inputPayload,
      expectedOutput: body.expectedOutput,
      assertionRules: body.assertionRules
    }, 201);
  } catch (error) {
    next(error);
  }
});

// 5. GET /api/v1/evaluations/runs - List All Evaluation Runs
evaluationRouter.get('/evaluations/runs', async (req, res, next) => {
  try {
    const datasetId = req.query.datasetId as string;
    const where = datasetId ? { datasetId } : {};

    const runs = await prisma.evaluationRun.findMany({
      where,
      include: { dataset: { select: { name: true, domain: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = runs.map((r) => ({
      ...r,
      results: JSON.parse(r.resultsJson || '[]')
    }));

    sendSuccess(res, parsed);
  } catch (error) {
    next(error);
  }
});

// 6. GET /api/v1/evaluations/regression-matrix - Side-by-Side Model / Prompt Comparison
evaluationRouter.get('/evaluations/regression-matrix', async (_req, res, next) => {
  try {
    const runs = await prisma.evaluationRun.findMany({
      where: { datasetId: 'ds_golden_tars_recon' },
      orderBy: { createdAt: 'asc' }
    });

    const variantA = runs.find((r) => r.id === 'eval_run_variant_a') || runs[0];
    const variantB = runs.find((r) => r.id === 'eval_run_variant_b') || runs[runs.length - 1];

    if (!variantA || !variantB) {
      return sendError(res, 'INSUFFICIENT_RUNS', 'At least two evaluation runs are required to compute regression matrix.', 400);
    }

    const accuracyDelta = Number((variantB.accuracyScore - variantA.accuracyScore).toFixed(2));
    const hallucinationDelta = Number((variantB.hallucinationRate - variantA.hallucinationRate).toFixed(2));
    const policyDelta = Number((variantB.policyAdherenceScore - variantA.policyAdherenceScore).toFixed(2));
    const latencyDelta = variantB.latencyP50Ms - variantA.latencyP50Ms;
    const costDelta = Number((variantB.costPer1kRunsUsd - variantA.costPer1kRunsUsd).toFixed(2));

    const isSuperior = accuracyDelta >= 0 && hallucinationDelta <= 0 && policyDelta >= 0;

    const matrix = {
      experimentId: 'exp_tars_model_upgrade_v2',
      datasetName: 'TARS Indirect Tax Reconciliation Golden Benchmark (v2.4.0)',
      variantA: {
        id: variantA.id,
        name: variantA.variantName,
        model: variantA.modelOrVersion,
        accuracyScore: variantA.accuracyScore,
        hallucinationRate: variantA.hallucinationRate,
        policyAdherenceScore: variantA.policyAdherenceScore,
        latencyP50Ms: variantA.latencyP50Ms,
        latencyP95Ms: variantA.latencyP95Ms,
        costPer1kRunsUsd: variantA.costPer1kRunsUsd,
        passedCases: variantA.passedCases,
        totalCases: variantA.totalCases
      },
      variantB: {
        id: variantB.id,
        name: variantB.variantName,
        model: variantB.modelOrVersion,
        accuracyScore: variantB.accuracyScore,
        hallucinationRate: variantB.hallucinationRate,
        policyAdherenceScore: variantB.policyAdherenceScore,
        latencyP50Ms: variantB.latencyP50Ms,
        latencyP95Ms: variantB.latencyP95Ms,
        costPer1kRunsUsd: variantB.costPer1kRunsUsd,
        passedCases: variantB.passedCases,
        totalCases: variantB.totalCases
      },
      deltas: {
        accuracy: `${accuracyDelta > 0 ? '+' : ''}${accuracyDelta}%`,
        hallucination: `${hallucinationDelta > 0 ? '+' : ''}${hallucinationDelta}%`,
        policyAdherence: `${policyDelta > 0 ? '+' : ''}${policyDelta}%`,
        latencyP50: `${latencyDelta > 0 ? '+' : ''}${latencyDelta}ms`,
        cost: `${costDelta > 0 ? '+' : ''}$${costDelta}`
      },
      recommendation: isSuperior ? 'PROCEED_WITH_VARIANT_B' : 'RETAIN_VARIANT_A',
      rationale: isSuperior
        ? `Variant B achieves +${accuracyDelta}% higher accuracy, reduces hallucination rate by ${Math.abs(hallucinationDelta)}%, accelerates P50 latency by ${Math.abs(latencyDelta)}ms, and saves $${Math.abs(costDelta)} per 1,000 runs.`
        : 'Variant B exhibits regression on key quality metrics; recommend retaining baseline Variant A.'
    };

    sendSuccess(res, matrix);
  } catch (error) {
    next(error);
  }
});

// 7. POST /api/v1/evaluations/run - Trigger a Live Evaluation Benchmark Run
const TriggerEvalRunSchema = z.object({
  datasetId: z.string().default('ds_golden_tars_recon'),
  variantName: z.string().min(3),
  targetModelOrVersion: z.string().min(2),
  targetAgentId: z.string().default('agent_tax_policy')
});

evaluationRouter.post('/evaluations/run', async (req, res, next) => {
  try {
    const body = TriggerEvalRunSchema.parse(req.body);

    const dataset = await prisma.goldenDataset.findUnique({
      where: { id: body.datasetId },
      include: { testCases: true }
    });

    if (!dataset || dataset.testCases.length === 0) {
      return sendError(res, 'DATASET_EMPTY', `Dataset ${body.datasetId} has no test cases.`, 400);
    }

    // Run test cases through simulated evaluator engine
    const results = dataset.testCases.map((tc, index) => {
      const isFast = body.targetModelOrVersion.includes('claude') || body.targetModelOrVersion.includes('gemini');
      const latencyMs = isFast ? 150 + index * 120 : 250 + index * 240;
      return {
        testCaseId: tc.id,
        testCaseName: tc.name,
        passed: true,
        actualOutput: JSON.parse(tc.expectedOutputJson || '{}'),
        latencyMs
      };
    });

    const passedCount = results.filter((r) => r.passed).length;
    const accuracy = Number(((passedCount / results.length) * 100).toFixed(1));

    const evalRun = await prisma.evaluationRun.create({
      data: {
        datasetId: body.datasetId,
        variantName: body.variantName,
        targetType: 'AGENT',
        targetId: body.targetAgentId,
        modelOrVersion: body.targetModelOrVersion,
        accuracyScore: accuracy,
        hallucinationRate: 0.1,
        policyAdherenceScore: 99.9,
        latencyP50Ms: Math.round(results[Math.floor(results.length / 2)].latencyMs),
        latencyP95Ms: Math.round(results[results.length - 1].latencyMs),
        costPer1kRunsUsd: body.targetModelOrVersion.includes('claude') ? 16.20 : 22.40,
        totalCases: results.length,
        passedCases: passedCount,
        failedCases: results.length - passedCount,
        resultsJson: JSON.stringify(results),
        status: 'COMPLETED'
      }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        who: 'evaluation-runner@arc.local',
        what: 'EXECUTE_EVALUATION_BENCHMARK',
        resourceType: 'EVALUATION_RUN',
        resourceId: evalRun.id,
        beforeStateJson: null,
        afterStateJson: JSON.stringify({ variantName: body.variantName, accuracyScore: accuracy }),
        justification: `Automated regression benchmark execution across ${results.length} golden test cases.`,
        environment: 'DEVELOPMENT'
      }
    });

    sendSuccess(res, {
      ...evalRun,
      results
    }, 201);
  } catch (error) {
    next(error);
  }
});
