import { WorkflowNode, WorkflowEdge, RunStatus } from '@arc/domain-core';

export interface WorkflowExecutionContext {
  runId: string;
  workflowId: string;
  environment: string;
  state: Record<string, unknown>;
  resumeDecision?: string;
  humanComment?: string;
}

export interface NodeExecutionResult {
  status: 'COMPLETED' | 'SUSPENDED' | 'FAILED';
  outputs: Record<string, unknown>;
  nextEdgeHandles?: string[];
  resumeToken?: string;
  error?: string;
  durationMs: number;
}

export interface INodeExecutor {
  execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult>;
}

export interface GraphValidationResult {
  valid: boolean;
  status: 'PASS' | 'WARNING' | 'BLOCKED';
  issues: Array<{
    nodeId?: string;
    level: 'ERROR' | 'WARNING';
    message: string;
  }>;
}
