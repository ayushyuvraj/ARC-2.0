import { prisma } from '@arc/database';
import { WorkflowNode, WorkflowEdge, RunStatus } from '@arc/domain-core';
import { NODE_EXECUTORS } from '../nodes/registry.js';
import { WorkflowExecutionContext, NodeExecutionResult } from '../types.js';

export class WorkflowRunner {
  // Execute a run from START or from a checkpoint
  static async executeRun(runId: string): Promise<any> {
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { workflow: true }
    });

    if (!run) throw new Error(`Run '${runId}' not found.`);

    const nodes: WorkflowNode[] = JSON.parse(run.workflow.nodesJson);
    const edges: WorkflowEdge[] = JSON.parse(run.workflow.edgesJson);
    let currentState: Record<string, unknown> = JSON.parse(run.inputsJson || '{}');

    // Update status to RUNNING
    await prisma.run.update({
      where: { id: runId },
      data: { status: 'RUNNING', startTime: new Date() }
    });

    // Determine start point: find START node
    const startNode = nodes.find((n) => n.type === 'START');
    if (!startNode) throw new Error('Workflow has no START node.');

    let currentNode: WorkflowNode | undefined = startNode;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalCostUsd = 0.0;

    while (currentNode) {
      const executor = NODE_EXECUTORS[currentNode.type];
      if (!executor) throw new Error(`No executor registered for node type '${currentNode.type}'.`);

      const executionContext: WorkflowExecutionContext = {
        runId: run.id,
        workflowId: run.workflow.id,
        environment: run.environment,
        state: currentState
      };

      const spanStart = new Date();
      const result: NodeExecutionResult = await executor.execute(currentNode, executionContext);
      const spanEnd = new Date();

      // Accumulate output state
      currentState = { ...currentState, ...result.outputs };

      // Calculate simulated tokens and cost for Agent nodes
      let nodeTokens = { prompt: 0, completion: 0, total: 0 };
      let nodeCost = 0.0;
      if (currentNode.type === 'AGENT') {
        nodeTokens = { prompt: 1200, completion: 450, total: 1650 };
        nodeCost = 0.018;
        totalPromptTokens += nodeTokens.prompt;
        totalCompletionTokens += nodeTokens.completion;
        totalCostUsd += nodeCost;
      }

      // Persist OpenTelemetry-compatible Trace Span
      await prisma.traceSpan.create({
        data: {
          traceId: `trace_${run.id}`,
          runId: run.id,
          componentType: currentNode.type === 'AGENT' ? 'AGENT' : 'WORKFLOW_NODE',
          componentId: currentNode.id,
          componentVersion: currentNode.version || '1.0.0',
          operationName: `${currentNode.type}:${currentNode.name}`,
          startTime: spanStart,
          endTime: spanEnd,
          durationMs: result.durationMs,
          status: result.status === 'FAILED' ? 'ERROR' : 'OK',
          tokensPrompt: nodeTokens.prompt,
          tokensCompletion: nodeTokens.completion,
          tokensTotal: nodeTokens.total,
          costUsd: nodeCost,
          metadataJson: JSON.stringify({ outputs: result.outputs })
        }
      });

      // Handle checkpoint & suspension
      if (result.status === 'SUSPENDED') {
        await prisma.run.update({
          where: { id: run.id },
          data: {
            status: 'WAITING_FOR_HUMAN',
            resumeToken: result.resumeToken,
            checkpointStateJson: JSON.stringify({
              currentNodeId: currentNode.id,
              state: currentState
            }),
            tokensPrompt: totalPromptTokens,
            tokensCompletion: totalCompletionTokens,
            tokensTotal: totalPromptTokens + totalCompletionTokens,
            costModelUsd: totalCostUsd,
            costTotalUsd: totalCostUsd
          }
        });

        return {
          status: 'WAITING_FOR_HUMAN',
          runId: run.id,
          suspendedNodeId: currentNode.id,
          resumeToken: result.resumeToken,
          state: currentState
        };
      }

      // Create/Upsert Artifact if final report or data compilation step
      if (result.outputs.reportArtifactId) {
        const artId = String(result.outputs.reportArtifactId);
        await prisma.artifact.upsert({
          where: { id: artId },
          update: {
            contentHash: String(result.outputs.contentHash || 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8')
          },
          create: {
            id: artId,
            runId: run.id,
            name: String(result.outputs.reportName || 'Reconciliation_Report.pdf'),
            type: 'DOCUMENT_PDF',
            locationUri: `/artifacts/${run.id}/reconciliation_report.pdf`,
            contentHash: String(result.outputs.contentHash || 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8'),
            byteSize: 1048576,
            dataClassification: 'RESTRICTED',
            derivedFromIdsJson: JSON.stringify(['art_gst_invoices_raw', 'art_pr_records_raw'])
          }
        });
      }

      if (currentNode.type === 'END') {
        break;
      }

      // Route to next node via edges
      const outboundEdge = edges.find((e) => e.sourceNodeId === currentNode!.id);
      if (!outboundEdge) break;

      currentNode = nodes.find((n) => n.id === outboundEdge.targetNodeId);
    }

    // Finalize Run
    const completedRun = await prisma.run.update({
      where: { id: run.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        durationMs: 4200,
        outputsJson: JSON.stringify(currentState),
        checkpointStateJson: JSON.stringify(currentState),
        tokensPrompt: totalPromptTokens,
        tokensCompletion: totalCompletionTokens,
        tokensTotal: totalPromptTokens + totalCompletionTokens,
        costModelUsd: totalCostUsd,
        costTotalUsd: totalCostUsd
      }
    });

    return {
      status: 'COMPLETED',
      run: completedRun,
      outputs: currentState
    };
  }

  // Resume a suspended run from human review
  static async resumeRun(runId: string, resumeToken: string, decision: string, humanComment?: string): Promise<any> {
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { workflow: true }
    });

    if (!run) throw new Error(`Run '${runId}' not found.`);
    if (run.resumeToken !== resumeToken) {
      throw new Error(`Invalid resume token '${resumeToken}' for run '${runId}'.`);
    }

    const nodes: WorkflowNode[] = JSON.parse(run.workflow.nodesJson);
    const edges: WorkflowEdge[] = JSON.parse(run.workflow.edgesJson);
    const checkpoint = JSON.parse(run.checkpointStateJson || '{}');
    let currentState: Record<string, unknown> = {
      ...(checkpoint.state || {}),
      humanDecision: decision,
      humanComment: humanComment || 'Approved'
    };

    // Find node that follows the suspended node
    const suspendedNodeId = checkpoint.currentNodeId;
    const outboundEdge = edges.find((e) => e.sourceNodeId === suspendedNodeId);
    let currentNode = nodes.find((n) => n.id === outboundEdge?.targetNodeId);

    await prisma.run.update({
      where: { id: run.id },
      data: { status: 'RUNNING', resumeToken: null }
    });

    while (currentNode) {
      const executor = NODE_EXECUTORS[currentNode.type];
      const executionContext: WorkflowExecutionContext = {
        runId: run.id,
        workflowId: run.workflow.id,
        environment: run.environment,
        state: currentState,
        resumeDecision: decision,
        humanComment
      };

      const spanStart = new Date();
      const result: NodeExecutionResult = await executor.execute(currentNode, executionContext);
      const spanEnd = new Date();

      currentState = { ...currentState, ...result.outputs };

      await prisma.traceSpan.create({
        data: {
          traceId: `trace_${run.id}`,
          runId: run.id,
          componentType: 'WORKFLOW_NODE',
          componentId: currentNode.id,
          componentVersion: currentNode.version || '1.0.0',
          operationName: `${currentNode.type}:${currentNode.name}`,
          startTime: spanStart,
          endTime: spanEnd,
          durationMs: result.durationMs,
          status: 'OK',
          metadataJson: JSON.stringify({ outputs: result.outputs })
        }
      });

      if (result.outputs.reportArtifactId) {
        const artId = String(result.outputs.reportArtifactId);
        await prisma.artifact.upsert({
          where: { id: artId },
          update: {
            contentHash: String(result.outputs.contentHash || 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8')
          },
          create: {
            id: artId,
            runId: run.id,
            name: String(result.outputs.reportName || 'Reconciliation_Report.pdf'),
            type: 'DOCUMENT_PDF',
            locationUri: `/artifacts/${run.id}/reconciliation_report.pdf`,
            contentHash: String(result.outputs.contentHash || 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8'),
            byteSize: 1048576,
            dataClassification: 'RESTRICTED',
            derivedFromIdsJson: JSON.stringify(['art_gst_invoices_raw', 'art_pr_records_raw'])
          }
        });
      }

      if (currentNode.type === 'END') break;

      const nextEdge = edges.find((e) => e.sourceNodeId === currentNode!.id);
      if (!nextEdge) break;

      currentNode = nodes.find((n) => n.id === nextEdge.targetNodeId);
    }

    const finalizedRun = await prisma.run.update({
      where: { id: run.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        outputsJson: JSON.stringify(currentState),
        checkpointStateJson: JSON.stringify(currentState)
      }
    });

    return {
      status: 'COMPLETED',
      run: finalizedRun,
      outputs: currentState
    };
  }
}
