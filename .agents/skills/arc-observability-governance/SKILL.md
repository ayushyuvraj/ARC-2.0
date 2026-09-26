---
name: arc-observability-governance
description: Guide for distributed tracing, artifact lineage DAGs, dependency impact analysis, RBAC, approval workflows, and continuous evaluation in ARC.
---

# ARC Observability & Governance Skill

## Purpose
This skill defines the observability, data governance, lineage tracking, and dependency intelligence layers of ARC.

## 1. Distributed Tracing & Span Hierarchy
Every Run generates a structured OpenTelemetry-compatible span tree:
```
Run [run_tax_reconcile_001]
└── WorkflowNode [ingest_datasets]
└── WorkflowNode [deterministic_matcher]
└── WorkflowNode [matching_agent_exception]
    ├── ModelInvocation [gpt-4o / vertex-claude]
    ├── MCPInvocation [tax_policy_mcp]
    └── A2ACall [MatchingAgent -> TaxPolicyAgent]
        └── ModelInvocation [tax_policy_reasoning]
└── WorkflowNode [human_approval_gate]
└── WorkflowNode [generate_final_report]
```
Each span captures:
- `spanId`, `parentSpanId`, `traceId`, `runId`
- `componentType` (`NODE`, `AGENT`, `MODEL`, `TOOL`, `MCP`, `A2A`, `POLICY`)
- `startTime`, `endTime`, `latencyMs`
- `status` (`OK`, `ERROR`)
- `tokenUsage` (prompt, completion, total) and calculated `costUsd`
- `inputMetadata` and `outputMetadata`

## 2. Artifact Lineage DAG
Artifacts represent persistent, versioned business inputs and outputs.
- Every artifact has a cryptographic content hash (SHA-256) and classification level.
- `derivedFrom`: Directed edges establish the exact data transformation history:
  `Raw Invoices (GST & PR)` $\to$ `Normalized Invoices` $\to$ `Exact Matches` $\to$ `Ambiguity Candidates` $\to$ `Approved Decisions` $\to$ `Reconciliation Summary PDF/JSON`.
- Users can visually trace any report row back to its source input file.

## 3. Dependency Graph & Blast Radius Impact Engine
ARC models dependencies between all platform components:
`Model` $\to$ `Agent` $\to$ `WorkflowNode` $\to$ `Workflow` $\to$ `UseCase` $\to$ `Application` $\to$ `Deployment`.

When any component state changes (e.g. `Tool` is set to `DISABLED`):
```typescript
function calculateDownstreamImpact(resourceId: string): ImpactAssessment {
  // Recursively traverses dependency edges
  // Returns:
  // - affectedAgents: Agent[]
  // - affectedWorkflows: Workflow[]
  // - affectedApplications: Application[]
  // - activeProductionDeployments: Deployment[]
  // - riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}
```
If a shared resource is disabled, ARC prevents silent runtime failure by transitioning dependent workflows into `DEGRADED` or `BLOCKED` states with explicit UI alerts.

## 4. Governance & Human Approval Workflows
- Mandatory approvals for sensitive transitions:
  1. Deploy Application to `Production`.
  2. Modify or disable a shared Tool or Model.
  3. Update a legally binding Policy.
  4. Change Security Classification.
- Audit Log records: `who`, `what`, `beforeState`, `afterState`, `timestamp`, `justification`, and `approvalId`.
