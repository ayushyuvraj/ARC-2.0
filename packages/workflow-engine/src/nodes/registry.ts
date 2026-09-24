import { WorkflowNode, WorkflowNodeType } from '@arc/domain-core';
import { INodeExecutor, NodeExecutionResult, WorkflowExecutionContext } from '../types.js';

// 1. START NODE
export class StartNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { ...context.state, ingestionStatus: 'VALIDATED', ingestedAt: new Date().toISOString() },
      durationMs: Date.now() - start + 2
    };
  }
}

// 2. END NODE
export class EndNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { ...context.state, finalWorkflowStatus: 'SUCCESS', completedAt: new Date().toISOString() },
      durationMs: Date.now() - start + 2
    };
  }
}

// 3. DETERMINISTIC TASK NODE (e.g. Ingestion, Matching, Report Compilation)
export class DeterministicTaskExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    const config = node.configuration || {};

    let outputs: Record<string, unknown> = {};

    if (config.componentId === 'tool_exact_matcher' || node.name.includes('Matcher')) {
      // Deterministic Matcher simulation processing bulk 85%+
      outputs = {
        deterministicMatchedCount: 8500,
        ambiguousCasesCount: 1500,
        unmatchedVendorCount: 200,
        exactMatchRate: '85.0%',
        throughputRowsPerSec: 42500,
        matchedRecordsSummary: '8,500 exact invoice pairs matched by GSTIN, Invoice Number, and Tax Amount.'
      };
    } else if (config.componentId === 'tool_report_compiler' || node.name.includes('Report')) {
      outputs = {
        reportArtifactId: `art_recon_report_${context.runId}`,
        reportName: 'Tax_Reconciliation_Audit_Report.pdf',
        reportStatus: 'COMPILED_AND_SEALED',
        totalReconciledCredit: '$1,452,900.00',
        contentHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8'
      };
    } else {
      outputs = {
        taskName: node.name,
        processed: true,
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: 'COMPLETED',
      outputs,
      durationMs: Date.now() - start + 12
    };
  }
}

// 4. AGENT NODE (e.g. Matching Agent, Tax Policy Agent)
export class AgentNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    const config = node.configuration || {};

    let outputs: Record<string, unknown> = {};

    if (node.name.includes('Matching') || config.agentId === 'agent_matching') {
      outputs = {
        agentId: 'agent_matching',
        reasoningSummary: 'Evaluated 1,500 ambiguous candidates. Detected 420 rounding tolerance differences under INR 1.00 and 80 punctuation discrepancies.',
        nearMatchesResolved: 500,
        unresolvedAmbiguities: 1000,
        a2aRequired: true,
        targetTaxPolicyOperation: 'evaluate_itc_admissibility'
      };
    } else if (node.name.includes('Tax Policy') || config.agentId === 'agent_tax_policy') {
      outputs = {
        agentId: 'agent_tax_policy',
        policyId: 'policy_kpmg_tax_v12',
        admissibleITC: '$42,300.00',
        inadmissibleITC: '$0.00',
        statutoryCitation: 'Section 16(2) Timing & Rounding Exemption Clause 4.2',
        complianceStatus: 'COMPLIANT_SUBJECT_TO_AUDITOR_SIGNOFF'
      };
    } else {
      outputs = {
        agentId: config.agentId || 'generic_agent',
        completion: `Agent '${node.name}' executed reasoning successfully.`,
        tokensUsed: 420
      };
    }

    return {
      status: 'COMPLETED',
      outputs,
      durationMs: Date.now() - start + 85
    };
  }
}

// 5. HUMAN APPROVAL NODE (A2UI Ambiguity Review Panel)
export class HumanApprovalExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();

    // Check if resuming from human approval
    if (context.resumeDecision) {
      return {
        status: 'COMPLETED',
        outputs: {
          humanDecision: context.resumeDecision,
          humanComment: context.humanComment || 'Approved discrepancy under Section 16(2)',
          approvedAt: new Date().toISOString()
        },
        durationMs: Date.now() - start + 2
      };
    }

    // Suspend run into WAITING_FOR_HUMAN and emit resume token
    const resumeToken = `res_tok_${Math.random().toString(36).substring(2, 12)}`;
    return {
      status: 'SUSPENDED',
      resumeToken,
      outputs: {
        approvalRequired: true,
        a2uiSurface: 'ambiguity_review',
        pendingRole: 'TAX_AUDITOR_REVIEWER',
        resumeToken
      },
      durationMs: Date.now() - start + 5
    };
  }
}

// 6. TOOL NODE
export class ToolNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { toolId: node.configuration?.toolId, executed: true },
      durationMs: Date.now() - start + 10
    };
  }
}

// 7. ORCHESTRATOR NODE
export class OrchestratorNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { routedTo: ['agent_matching', 'agent_tax_policy'], strategy: 'SEQUENTIAL_DELEGATION' },
      durationMs: Date.now() - start + 25
    };
  }
}

// 8. MCP NODE
export class MCPNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { mcpQuery: 'query_itc_rule', result: 'Rule valid' },
      durationMs: Date.now() - start + 30
    };
  }
}

// 9. SKILL NODE
export class SkillNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { skillId: node.configuration?.skillId, methodologyStep: 'Complete' },
      durationMs: Date.now() - start + 15
    };
  }
}

// 10. API NODE
export class APINodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { status: 200, response: 'OK' },
      durationMs: Date.now() - start + 40
    };
  }
}

// 11. DATA TRANSFORM NODE
export class DataTransformNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { transformed: true, sourceKeys: Object.keys(context.state) },
      durationMs: Date.now() - start + 5
    };
  }
}

// 12. CONDITION NODE
export class ConditionNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    const conditionMet = Boolean(context.state.ambiguousCasesCount || 1);
    return {
      status: 'COMPLETED',
      outputs: { conditionEvaluated: true, outcome: conditionMet ? 'true' : 'false' },
      nextEdgeHandles: [conditionMet ? 'true' : 'false'],
      durationMs: Date.now() - start + 2
    };
  }
}

// 13. LOOP NODE
export class LoopNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { iteration: 1, maxIterations: 3, done: true },
      durationMs: Date.now() - start + 2
    };
  }
}

// 14. PARALLEL NODE
export class ParallelNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { branchesDispatched: 2, syncMode: 'WAIT_ALL' },
      durationMs: Date.now() - start + 4
    };
  }
}

// 15. WAIT NODE
export class WaitNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { waitedSeconds: 1 },
      durationMs: Date.now() - start + 2
    };
  }
}

// 16. EVENT NODE
export class EventNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { eventPublished: 'RECONCILIATION_MILESTONE_REACHED' },
      durationMs: Date.now() - start + 5
    };
  }
}

// 17. SUB WORKFLOW NODE
export class SubWorkflowNodeExecutor implements INodeExecutor {
  async execute(node: WorkflowNode, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const start = Date.now();
    return {
      status: 'COMPLETED',
      outputs: { subWorkflowExecuted: true, subRunId: `sub_${Math.random().toString(36).substring(7)}` },
      durationMs: Date.now() - start + 10
    };
  }
}

// Node Executor Registry Map
export const NODE_EXECUTORS: Record<WorkflowNodeType, INodeExecutor> = {
  START: new StartNodeExecutor(),
  END: new EndNodeExecutor(),
  DETERMINISTIC_TASK: new DeterministicTaskExecutor(),
  AGENT: new AgentNodeExecutor(),
  HUMAN_APPROVAL: new HumanApprovalExecutor(),
  TOOL: new ToolNodeExecutor(),
  ORCHESTRATOR: new OrchestratorNodeExecutor(),
  MCP: new MCPNodeExecutor(),
  SKILL: new SkillNodeExecutor(),
  API: new APINodeExecutor(),
  DATA_TRANSFORM: new DataTransformNodeExecutor(),
  CONDITION: new ConditionNodeExecutor(),
  LOOP: new LoopNodeExecutor(),
  PARALLEL: new ParallelNodeExecutor(),
  WAIT: new WaitNodeExecutor(),
  EVENT: new EventNodeExecutor(),
  SUB_WORKFLOW: new SubWorkflowNodeExecutor()
};
