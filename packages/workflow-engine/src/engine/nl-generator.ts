import { WorkflowNode, WorkflowEdge } from '@arc/domain-core';

export interface NLWorkflowProposal {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  summary: string;
}

export function generateWorkflowFromNaturalLanguage(description: string): NLWorkflowProposal {
  const lower = description.toLowerCase();

  const nodes: WorkflowNode[] = [
    {
      id: 'node_start',
      type: 'START',
      name: 'Ingestion & Schema Validation',
      configuration: {},
      inputMapping: {},
      outputMapping: {},
      dependencies: [],
      enabled: true,
      version: '1.0.0'
    }
  ];

  const edges: WorkflowEdge[] = [];
  let prevNodeId = 'node_start';

  // Topic / Document / KPMG Template detection
  if (lower.includes('topic') || lower.includes('content') || lower.includes('template') || lower.includes('kpmg') || lower.includes('format') || lower.includes('doc') || lower.includes('ppt')) {
    const topicAgentId = 'node_topic_extractor';
    nodes.push({
      id: topicAgentId,
      type: 'AGENT',
      name: 'Content Analysis & Topic Extraction Agent',
      configuration: { agentId: 'agent_matching' },
      inputMapping: {},
      outputMapping: {},
      dependencies: [prevNodeId],
      enabled: true,
      version: '1.0.0'
    });
    edges.push({ id: `e_${prevNodeId}_${topicAgentId}`, sourceNodeId: prevNodeId, targetNodeId: topicAgentId });
    prevNodeId = topicAgentId;

    const templateEngineId = 'node_kpmg_template_engine';
    nodes.push({
      id: templateEngineId,
      type: 'DETERMINISTIC_TASK',
      name: 'KPMG Template & Layout Formatter',
      configuration: { componentId: 'tool_report_compiler' },
      inputMapping: {},
      outputMapping: {},
      dependencies: [prevNodeId],
      enabled: true,
      version: '1.0.0'
    });
    edges.push({ id: `e_${prevNodeId}_${templateEngineId}`, sourceNodeId: prevNodeId, targetNodeId: templateEngineId });
    prevNodeId = templateEngineId;
  }

  // Deterministic step detection
  if (lower.includes('deterministic') || lower.includes('match') || lower.includes('reconcil') || lower.includes('filter')) {
    const matcherId = 'node_deterministic_matcher';
    nodes.push({
      id: matcherId,
      type: 'DETERMINISTIC_TASK',
      name: 'Deterministic Hash Matcher (85%+)',
      configuration: { componentId: 'tool_exact_matcher' },
      inputMapping: {},
      outputMapping: {},
      dependencies: [prevNodeId],
      enabled: true,
      version: '1.0.0'
    });
    edges.push({ id: `e_${prevNodeId}_${matcherId}`, sourceNodeId: prevNodeId, targetNodeId: matcherId });
    prevNodeId = matcherId;
  }

  // Agent step detection
  if (lower.includes('agent') || lower.includes('ambiguous') || lower.includes('reasoning') || lower.includes('discrepan')) {
    const agentId = 'node_matching_agent';
    nodes.push({
      id: agentId,
      type: 'AGENT',
      name: 'Matching Agent (Azure Cloud)',
      configuration: { agentId: 'agent_matching' },
      inputMapping: {},
      outputMapping: {},
      dependencies: [prevNodeId],
      enabled: true,
      version: '1.0.0'
    });
    edges.push({ id: `e_${prevNodeId}_${agentId}`, sourceNodeId: prevNodeId, targetNodeId: agentId });
    prevNodeId = agentId;
  }

  // Policy / A2A step detection
  if (lower.includes('policy') || lower.includes('tax') || lower.includes('a2a') || lower.includes('legal') || lower.includes('compliance')) {
    const policyAgentId = 'node_tax_policy_agent';
    nodes.push({
      id: policyAgentId,
      type: 'AGENT',
      name: 'Tax Policy Agent (Vertex AI A2A)',
      configuration: { agentId: 'agent_tax_policy' },
      inputMapping: {},
      outputMapping: {},
      dependencies: [prevNodeId],
      enabled: true,
      version: '1.0.0'
    });
    edges.push({ id: `e_${prevNodeId}_${policyAgentId}`, sourceNodeId: prevNodeId, targetNodeId: policyAgentId });
    prevNodeId = policyAgentId;
  }

  // Human approval step detection
  if (lower.includes('human') || lower.includes('approval') || lower.includes('review') || lower.includes('sign-off') || lower.includes('kpmg')) {
    const humanId = 'node_human_approval';
    nodes.push({
      id: humanId,
      type: 'HUMAN_APPROVAL',
      name: 'Executive Review & Sign-Off Panel (A2UI)',
      configuration: { a2uiSurfaceKey: 'ambiguity_review', approvalRole: 'AUDITOR' },
      inputMapping: {},
      outputMapping: {},
      dependencies: [prevNodeId],
      enabled: true,
      version: '1.0.0'
    });
    edges.push({ id: `e_${prevNodeId}_${humanId}`, sourceNodeId: prevNodeId, targetNodeId: humanId });
    prevNodeId = humanId;
  }

  // Report generation / Compiler step
  const compilerId = 'node_report_compiler';
  nodes.push({
    id: compilerId,
    type: 'DETERMINISTIC_TASK',
    name: 'Compile Final Formatted Deliverable',
    configuration: { componentId: 'tool_report_compiler' },
    inputMapping: {},
    outputMapping: {},
    dependencies: [prevNodeId],
    enabled: true,
    version: '1.0.0'
  });
  edges.push({ id: `e_${prevNodeId}_${compilerId}`, sourceNodeId: prevNodeId, targetNodeId: compilerId });
  prevNodeId = compilerId;

  // Final END node
  const endId = 'node_end';
  nodes.push({
    id: endId,
    type: 'END',
    name: 'Workflow Finalized & Sealed',
    configuration: {},
    inputMapping: {},
    outputMapping: {},
    dependencies: [prevNodeId],
    enabled: true,
    version: '1.0.0'
  });
  edges.push({ id: `e_${prevNodeId}_${endId}`, sourceNodeId: prevNodeId, targetNodeId: endId });

  return {
    name: 'AI Generated Enterprise Workflow',
    description,
    nodes,
    edges,
    summary: `Synthesized pipeline with ${nodes.length} nodes including content extraction, template formatting, reasoning, and executive sign-off.`
  };
}
