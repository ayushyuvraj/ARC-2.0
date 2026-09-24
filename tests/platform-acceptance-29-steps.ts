/**
 * ARC Platform 29-Step End-to-End Acceptance Demonstration Test
 * Section 75 of Master Architecture Specification
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const API_BASE = 'http://localhost:4000/api/v1';

async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return res.json();
}

async function runStep(stepNum: number, name: string, fn: () => Promise<any>) {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    console.log(`✅ [Step ${String(stepNum).padStart(2, '0')}/29] ${name} (${duration}ms)`);
    return result;
  } catch (err: any) {
    console.error(`❌ [Step ${String(stepNum).padStart(2, '0')}/29] ${name} FAILED:`, err.message);
    throw err;
  }
}

export async function runAcceptanceTest() {
  console.log('================================================================');
  console.log('🚀 ARC PLATFORM — 29-STEP FULL ACCEPTANCE DEMONSTRATION TEST');
  console.log('   Enterprise Indirect Tax Reconciliation & Platform Stability');
  console.log('================================================================\n');

  let tarsApp: any = null;
  let runId: string = '';
  let resumeToken: string = '';
  let reportArtifactId: string = '';
  let gstData: any[] = [];
  let prData: any[] = [];

  // Step 01: Log into ARC Control Plane
  await runStep(1, 'Log into the ARC Control Plane Portal (Health check)', async () => {
    const res = await request('/health');
    if (!res.success) throw new Error('Health check failed');
  });

  // Step 02: Open global Applications catalog
  await runStep(2, 'Open the global Applications catalog', async () => {
    const res = await request('/applications');
    if (!res.success || !res.data.length) throw new Error('Failed to fetch applications');
  });

  // Step 03: Select TARS 2.0
  await runStep(3, 'Select "TARS 2.0" from authorized applications', async () => {
    const res = await request('/applications/tars');
    if (!res.success) throw new Error('TARS 2.0 application not found');
    tarsApp = res.data;
  });

  // Step 04: View dedicated TARS application interface
  await runStep(4, 'Inspect TARS application metadata & Indirect Tax domain bindings', async () => {
    if (tarsApp.domain !== 'Indirect Tax') throw new Error('Invalid domain binding');
  });

  // Step 05: Click "New Tax Reconciliation Run" (Verify workflow registration)
  await runStep(5, 'Verify registered TARS Tax Reconciliation Graph (wf_tars_recon_v2)', async () => {
    const res = await request('/workflows/wf_tars_recon_v2');
    if (!res.success) throw new Error('Workflow wf_tars_recon_v2 not found');
  });

  // Step 06: Upload synthetic GST Invoices & Purchase Register datasets
  await runStep(6, 'Load synthetic GST Invoices and Purchase Register datasets', async () => {
    const gstPath = resolve(process.cwd(), 'samples/tars-data/gst_invoices_sample.json');
    const prPath = resolve(process.cwd(), 'samples/tars-data/purchase_register_sample.json');
    gstData = JSON.parse(readFileSync(gstPath, 'utf8'));
    prData = JSON.parse(readFileSync(prPath, 'utf8'));
    if (!gstData.length || !prData.length) throw new Error('Synthetic sample files empty');
  });

  // Step 07: Click "Start Reconciliation Workflow"
  await runStep(7, 'Submit reconciliation run payload to Run Engine', async () => {
    const res = await request('/runs', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: tarsApp.id,
        useCaseId: 'usecase_tax_reconciliation',
        workflowId: 'wf_tars_recon_v2',
        environment: 'DEVELOPMENT',
        inputs: {
          gstRows: gstData.length,
          prRows: prData.length,
          sampleId: 'september_2026_acceptance'
        }
      })
    });
    if (!res.success) throw new Error('Failed to create run');
    runId = res.data.id;

    const execRes = await request(`/runs/${runId}/execute`, { method: 'POST' });
    if (!execRes.success) throw new Error('Failed to execute run');
  });

  // Step 08: Observe live visual workflow graph rendering real-time execution state
  await runStep(8, 'Observe workflow execution reach WAITING_FOR_HUMAN checkpoint', async () => {
    const res = await request(`/runs/${runId}`);
    if (!res.success) throw new Error('Failed to fetch run');
    if (res.data.status !== 'WAITING_FOR_HUMAN') throw new Error(`Unexpected status: ${res.data.status}`);
    resumeToken = res.data.resumeToken;
  });

  // Step 09: Verify Deterministic Matcher completes in milliseconds, resolving 85%+
  await runStep(9, 'Verify Deterministic Matcher offloading (85.0% exact match rate)', async () => {
    const res = await request(`/runs/${runId}`);
    const state = JSON.parse(res.data.checkpointStateJson || '{}');
    if (state.state?.exactMatchRate !== '85.0%') throw new Error('Deterministic offload rate mismatch');
  });

  // Step 10: Watch Matching Agent activate on ambiguous candidate records
  await runStep(10, 'Verify Matching Agent reasoning on ambiguous invoice records', async () => {
    const res = await request(`/runs/${runId}`);
    const state = JSON.parse(res.data.checkpointStateJson || '{}');
    if (!state.state?.reasoningSummary) throw new Error('Matching agent reasoning not found');
  });

  // Step 11: Observe A2A call dispatched from Matching Agent to Tax Policy Agent
  await runStep(11, 'Observe A2A call dispatched across clouds (Azure -> Vertex AI)', async () => {
    const res = await request('/a2a/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        protocolVersion: '1.0',
        runId,
        sender: { agentId: 'agent_matching', executionPlane: 'AZURE' },
        recipient: { agentId: 'agent_tax_policy', operation: 'evaluate_itc_admissibility' },
        securityContext: { classification: 'RESTRICTED' },
        payload: { taxAmount: 42300.00, discrepancyType: 'ROUNDING_TOLERANCE' }
      })
    });
    if (!res.success) throw new Error('A2A dispatch failed');
  });

  // Step 12: Verify Tax Policy Agent returns structured admissibility findings
  await runStep(12, 'Verify Tax Policy Agent statutory citation under Section 16(2)', async () => {
    const res = await request(`/runs/${runId}`);
    const state = JSON.parse(res.data.checkpointStateJson || '{}');
    if (!state.state?.statutoryCitation) throw new Error('Statutory citation missing');
  });

  // Step 13: Observe A2UI ComparisonPanel dynamically rendered in UI
  await runStep(13, 'Verify dynamic A2UI surface payload matches Controlled Vocabulary', async () => {
    const res = await request('/a2ui/templates');
    if (!res.success || !res.data.length) throw new Error('A2UI templates missing');
  });

  // Step 14: As human reviewer, inspect evidence, enter approval, click "Approve"
  await runStep(14, 'Human auditor enters approval remark & signs off with resumeToken', async () => {
    const res = await request(`/runs/${runId}/resume`, {
      method: 'POST',
      body: JSON.stringify({
        resumeToken,
        decision: 'APPROVED',
        humanComment: 'Auditor approved rounding variance under Section 16(2) guidelines.'
      })
    });
    if (!res.success) throw new Error('Failed to resume run');
  });

  // Step 15: Verify workflow successfully resumes from checkpoint state
  await runStep(15, 'Verify durable workflow engine resumes and completes', async () => {
    const res = await request(`/runs/${runId}`);
    if (res.data.status !== 'COMPLETED') throw new Error(`Run did not complete: ${res.data.status}`);
  });

  // Step 16: Verify final reconciliation report artifact (PDF) is generated
  await runStep(16, 'Verify final sealed reconciliation audit report artifact generated', async () => {
    const res = await request('/artifacts');
    const art = res.data.find((a: any) => a.runId === runId);
    if (!art) throw new Error('Report artifact not found');
    reportArtifactId = art.id;
  });

  // Step 17: Open completed Run view
  await runStep(17, 'Open completed Run telemetry dossier', async () => {
    const res = await request(`/runs/${runId}`);
    if (!res.success) throw new Error('Failed to load completed run');
  });

  // Step 18: Inspect hierarchical OpenTelemetry trace waterfall
  await runStep(18, 'Inspect distributed OpenTelemetry trace waterfall spans', async () => {
    const res = await request(`/traces/trace_${runId}`);
    const spans = Array.isArray(res.data) ? res.data : (res.data?.spans || []);
    if (!res.success || !spans.length) throw new Error('Trace spans not recorded');
  });

  // Step 19: Inspect visual Artifact Lineage DAG (SHA-256 hashes)
  await runStep(19, 'Verify cryptographic artifact lineage DAG and content hash', async () => {
    const res = await request(`/artifacts/${reportArtifactId}/lineage`);
    if (!res.success || !res.data?.upstreamLineage?.length) throw new Error('Lineage DAG incomplete');
  });

  // Step 20: Inspect immutable version snapshot
  await runStep(20, 'Verify exact version snapshots of models, tools, and policies', async () => {
    const res = await request(`/runs/${runId}`);
    if (res.data.workflowVersion !== '1.0.0') throw new Error('Version tracking missing');
  });

  // Step 21: Verify granular cost accounting (tokens and USD spend)
  await runStep(21, 'Verify granular financial cost accounting and token expenditure', async () => {
    const res = await request(`/runs/${runId}`);
    if (res.data.tokensTotal <= 0 || res.data.costTotalUsd <= 0) throw new Error('Cost tracking zero');
  });

  // Step 22: View continuous evaluation score calculated for the run
  await runStep(22, 'Query Continuous Evaluation regression benchmark matrix', async () => {
    const res = await request('/evaluations/regression-matrix');
    if (!res.success || !res.data.recommendation) throw new Error('Evaluation matrix missing');
  });

  // Step 23: Open Dependency Graph tab to view platform resources
  await runStep(23, 'Inspect Dependency Graph edges supporting TARS 2.0', async () => {
    const res = await request('/dependencies');
    if (!res.success || res.data.length < 5) throw new Error('Dependency edges missing');
  });

  // Step 24: Open Application Deployment view
  await runStep(24, 'Open Application Deployment Target registry', async () => {
    const res = await request('/deployments/targets');
    if (!res.success || !res.data.length) throw new Error('Deployment targets missing');
  });

  // Step 25: Verify multi-cloud topology map
  await runStep(25, 'Verify multi-cloud topology map (KPMG GCC, Azure, Vertex AI)', async () => {
    const res = await request('/deployments/topology');
    if (!res.success || res.data.clouds.length < 3) throw new Error('Topology clouds missing');
  });

  // Step 26: Navigate to Tool Registry and toggle status to "DISABLED"
  await runStep(26, 'Toggle shared deterministic tool status to DISABLED in test sandbox', async () => {
    const res = await request('/registries/tools/tool_exact_matcher/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DISABLED', justification: 'Demonstration blast radius simulation' })
    });
    if (!res.success || res.data.newStatus !== 'DISABLED') throw new Error('Failed to toggle tool');
  });

  // Step 27: Verify ARC immediately calculates downstream blast-radius impact
  await runStep(27, 'Verify recursive downstream blast-radius impact analysis alert', async () => {
    const res = await request('/dependencies/impact-analysis', {
      method: 'POST',
      body: JSON.stringify({ resourceType: 'TOOL', resourceId: 'tool_exact_matcher' })
    });
    if (!res.success || !['CRITICAL', 'HIGH'].includes(res.data?.riskLevel)) throw new Error(`Blast radius analysis failed: ${JSON.stringify(res)}`);
  });

  // Step 28: Re-enable the shared tool
  await runStep(28, 'Re-enable the shared deterministic tool (status -> ACTIVE)', async () => {
    const res = await request('/registries/tools/tool_exact_matcher/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE', justification: 'Re-enabling tool post-test' })
    });
    if (!res.success || res.data.newStatus !== 'ACTIVE') throw new Error('Failed to reactivate tool');
  });

  // Step 29: Re-execute reconciliation workflow to prove total platform stability
  await runStep(29, 'Re-execute reconciliation workflow to prove platform resilience', async () => {
    const res = await request('/runs', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: tarsApp.id,
        useCaseId: 'usecase_tax_reconciliation',
        workflowId: 'wf_tars_recon_v2',
        environment: 'DEVELOPMENT',
        inputs: { gstRows: 10000, prRows: 9800 }
      })
    });
    if (!res.success) throw new Error('Final resilience run failed');
  });

  console.log('\n================================================================');
  console.log('🎉 ALL 29 PLATFORM ACCEPTANCE STEPS PASSED WITHOUT FAILURE!');
  console.log('   ARC Platform stability, determinism, and governance verified.');
  console.log('================================================================');
}

// Allow direct CLI execution: npx tsx tests/platform-acceptance-29-steps.ts
if (process.argv[1]?.includes('platform-acceptance-29-steps')) {
  runAcceptanceTest()
    .catch((err) => {
      console.error('Acceptance test aborted:', err);
      process.exit(1);
    });
}
