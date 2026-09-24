# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 07: Observability, Lineage & Dependency Intelligence

---

## 1. Distributed Tracing & Execution Observability

ARC implements an OpenTelemetry-compatible tracing infrastructure tailored for multi-agent workflows.

```
Run: run_tax_recon_0924 (Total Duration: 4,820ms | Cost: $0.038 | Status: COMPLETED)
│
├── Span: Node[ingest_normalize_data] (140ms | Cost: $0.000 | COMPLETED)
│
├── Span: Node[deterministic_matching_engine] (320ms | Cost: $0.000 | COMPLETED)
│     └── Tool: exact_hash_join (318ms | 10,000 rows processed)
│
├── Span: Node[matching_agent_reasoning] (2,450ms | Cost: $0.024 | COMPLETED)
│     ├── Agent: MatchingAgent (Model: gpt-4o | Tokens: 1,840)
│     └── A2ACall: TaxPolicyAgent:EvaluateITC (1,220ms | Cost: $0.014 | COMPLETED)
│           └── Agent: TaxPolicyAgent (Model: gemini-1.5-pro | Tokens: 950)
│
├── Span: Node[human_approval_gate] (Suspended for 12m 40s | COMPLETED by user: j.doe@kpmg.com)
│
└── Span: Node[generate_reconciliation_report] (410ms | Cost: $0.000 | COMPLETED)
      └── Tool: pdf_report_compiler (Artifact created: art_recon_final_pdf)
```

### Trace Span Attributes
Every span captures:
* **Identification:** `spanId`, `parentSpanId`, `traceId`, `runId`.
* **Component Metadata:** `componentType` (`NODE`, `AGENT`, `MODEL`, `TOOL`, `MCP`, `A2A`, `POLICY`), `componentId`, `version`.
* **Timing:** `startTime`, `endTime`, `durationMs`.
* **Accounting:** `promptTokens`, `completionTokens`, `totalTokens`, `costUsd`.
* **Input/Output Metadata:** Sanitized input summary, output summary, error message (if any).

---

## 2. Artifact Lineage DAG

Every significant business input, intermediate transformation, and final deliverable is an **Artifact**.
ARC enforces **cryptographic content hashing (SHA-256)** and maintains a directional graph of data derivation.

```
       [Raw GST Invoices (CSV)]             [Purchase Register (CSV)]
       (art_gst_raw | SHA-256)              (art_pr_raw | SHA-256)
                   │                                   │
                   └─────────────────┬─────────────────┘
                                     ▼
                       [Normalized Invoices (JSON)]
                       (art_normalized | SHA-256)
                                     │
                      ┌──────────────┴──────────────┐
                      ▼                             ▼
           [Exact Matches (JSON)]       [Ambiguous Records (JSON)]
           (art_exact_matched)          (art_ambiguous_cases)
                      │                             │
                      │                             ▼
                      │                 [A2A Tax Opinions (JSON)]
                      │                 (art_tax_opinions)
                      │                             │
                      │                             ▼
                      │                 [Human Approved Decisions]
                      │                 (art_approved_decisions)
                      │                             │
                      └──────────────┬──────────────┘
                                     ▼
                    [Final Reconciliation Audit PDF]
                    (art_final_audit_report | SHA-256)
```

### Lineage Capabilities
* **Auditability:** Any line item in the final reconciliation report can be traced back through its derivation chain to the exact row and byte offset of the original uploaded file.
* **Immutability:** If an artifact's content changes, its SHA-256 changes, immediately invalidating any downstream cached results.

---

## 3. Enterprise Dependency Graph & Blast Radius Engine

ARC maintains an active dependency graph of all platform entities:

$$\text{Model} \longrightarrow \text{Agent} \longrightarrow \text{WorkflowNode} \longrightarrow \text{Workflow} \longrightarrow \text{UseCase} \longrightarrow \text{Application} \longrightarrow \text{Deployment}$$

### The Impact Analysis Algorithm
Before an administrator or engineer can disable, deprecate, or modify a shared resource (such as a Model or a Tool), ARC computes its **downstream blast radius**:

```typescript
interface ImpactAssessment {
  targetResourceId: string;
  targetResourceType: 'MODEL' | 'TOOL' | 'MCP' | 'POLICY' | 'SKILL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  affectedSummary: string;
  affectedAgents: Array<{ id: string; name: string }>;
  affectedWorkflows: Array<{ id: string; name: string }>;
  affectedApplications: Array<{ id: string; name: string }>;
  activeProductionDeployments: Array<{ id: string; target: string }>;
  
  requiresGovernanceApproval: boolean;
}

function calculateDownstreamImpact(
  resourceId: string,
  resourceType: string,
  dependencyGraph: DependencyGraph
): ImpactAssessment {
  // 1. Traverse all outbound edges from resourceId recursively
  const affectedAgents = dependencyGraph.findDependents(resourceId, 'AGENT');
  const affectedWorkflows = dependencyGraph.findDependents(affectedAgents, 'WORKFLOW');
  const affectedApps = dependencyGraph.findDependents(affectedWorkflows, 'APPLICATION');
  const prodDeployments = dependencyGraph.findDeployments(affectedApps, 'PRODUCTION');
  
  // 2. Assess Risk Level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (affectedWorkflows.length > 0) riskLevel = 'MEDIUM';
  if (affectedApps.length > 0) riskLevel = 'HIGH';
  if (prodDeployments.length > 0) riskLevel = 'CRITICAL';
  
  return {
    targetResourceId: resourceId,
    targetResourceType: resourceType,
    riskLevel,
    affectedSummary: `Disabling this component will impact ${affectedAgents.length} agents, ${affectedWorkflows.length} workflows, ${affectedApps.length} applications, and ${prodDeployments.length} active production deployments.`,
    affectedAgents,
    affectedWorkflows,
    affectedApplications: affectedApps,
    activeProductionDeployments: prodDeployments,
    requiresGovernanceApproval: riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
  };
}
```

### Lifecycle State Propagation
When a shared Tool is set to `DISABLED`:
1. ARC updates the tool's status to `DISABLED`.
2. All dependent Agents transition from `ACTIVE` $\to$ `DEGRADED`.
3. All dependent Workflows transition from `ACTIVE` $\to$ `BLOCKED` (or `AVAILABLE_WITH_WARNING` if fallback tools exist).
4. The ARC Portal immediately surfaces actionable warning alerts, preventing silent execution failures in production.
