import { WorkflowNode, WorkflowEdge } from '@arc/domain-core';
import { GraphValidationResult } from '../types.js';

export function validateWorkflowGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): GraphValidationResult {
  const issues: Array<{ nodeId?: string; level: 'ERROR' | 'WARNING'; message: string }> = [];

  // 1. START node check
  const startNodes = nodes.filter((n) => n.type === 'START');
  if (startNodes.length === 0) {
    issues.push({ level: 'ERROR', message: 'Workflow must have at least one START node.' });
  } else if (startNodes.length > 1) {
    issues.push({ level: 'ERROR', message: 'Multiple START nodes detected. Only one START node is permitted.' });
  }

  // 2. END node check
  const endNodes = nodes.filter((n) => n.type === 'END');
  if (endNodes.length === 0) {
    issues.push({ level: 'ERROR', message: 'Workflow must have at least one reachable END node.' });
  }

  // Build connectivity sets
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  for (const node of nodes) {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
  }

  for (const edge of edges) {
    outgoing.get(edge.sourceNodeId)?.push(edge.targetNodeId);
    incoming.get(edge.targetNodeId)?.push(edge.sourceNodeId);
  }

  // 3. Orphan nodes check
  for (const node of nodes) {
    if (node.type !== 'START' && (incoming.get(node.id)?.length || 0) === 0) {
      issues.push({
        nodeId: node.id,
        level: 'ERROR',
        message: `Node '${node.name}' (${node.id}) is an orphan with zero incoming edges.`
      });
    }
  }

  // 4. Dead-end nodes check
  for (const node of nodes) {
    if (node.type !== 'END' && (outgoing.get(node.id)?.length || 0) === 0) {
      issues.push({
        nodeId: node.id,
        level: 'WARNING',
        message: `Node '${node.name}' (${node.id}) has no outgoing edges and does not terminate at an END node.`
      });
    }
  }

  const hasErrors = issues.some((i) => i.level === 'ERROR');
  const hasWarnings = issues.some((i) => i.level === 'WARNING');

  return {
    valid: !hasErrors,
    status: hasErrors ? 'BLOCKED' : hasWarnings ? 'WARNING' : 'PASS',
    issues
  };
}
