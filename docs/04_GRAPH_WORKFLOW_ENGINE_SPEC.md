# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 04: Graph Workflow Engine & Execution Specification

---

## 1. Workflow Architecture & Graph Model

ARC workflows are modeled as **directed graphs** $G = (V, E)$, where:
* $V$ is a finite set of `WorkflowNode` instances.
* $E$ is a set of directed `WorkflowEdge` instances connecting source handles to target handles.

Workflows are not limited to simple DAGs (Directed Acyclic Graphs); they support **bounded cycles (loops)** with explicit termination conditions and iteration counters to prevent infinite execution.

```
                              WORKFLOW TOPOLOGY
                              
                         ┌─────────────────┐
                         │   START NODE    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  DETERMINISTIC  │ (Ingestion & Normalization)
                         │      TASK       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  DETERMINISTIC  │ (Exact Matcher 85%+)
                         │      TASK       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    CONDITION    │ (Are there unmatched records?)
                         └────┬───────┬────┘
                     No records│       │Unmatched records exist
                               ▼       ▼
                     ┌───────────┐   ┌─────────────────┐
                     │   JOIN    │   │   AGENT NODE    │ (Matching Agent)
                     └─────┬─────┘   └────────┬────────┘
                           │                  │
                           │                  ▼
                           │         ┌─────────────────┐
                           │         │   AGENT (A2A)   │ (Tax Policy Agent)
                           │         └────────┬────────┘
                           │                  │
                           │                  ▼
                           │         ┌─────────────────┐
                           │         │ HUMAN APPROVAL  │ (Ambiguity Review Panel)
                           │         └────────┬────────┘
                           │                  │
                           │                  ▼
                           └─────────>┌─────────────────┐
                                      │  DETERMINISTIC  │ (Generate PDF Report)
                                      │      TASK       │
                                      └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │    END NODE     │
                                      └─────────────────┘
```

---

## 2. Graph Validation Rules

Before a workflow can be saved or deployed, the ARC Graph Validator runs the following verification passes:
1. **Connectivity Check:** Must contain exactly one enabled `START` node and at least one reachable `END` node.
2. **Orphan Node Detection:** Every node (except `START`) must have at least one incoming edge.
3. **Dead-End Detection:** Every node (except `END`) must have at least one outgoing edge.
4. **Cycle Boundedness:** Any cycle in the graph must contain a `LOOP` or `CONDITION` node with an explicit `maxIterations` property.
5. **Schema Compatibility:** The output schema of node $A$ must satisfy the input mapping requirements of downstream node $B$.
6. **Dependency State:** All referenced Agents, Models, Tools, MCPs, and Policies must be in an `ACTIVE` lifecycle status.

---

## 3. The 17 Workflow Node Types & Execution Contracts

Each node implements a uniform execution interface:
```typescript
interface INodeExecutor {
  execute(
    node: WorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<NodeExecutionResult>;
}

interface NodeExecutionResult {
  status: 'COMPLETED' | 'SUSPENDED' | 'FAILED';
  outputs: Record<string, unknown>;
  nextEdgeHandles?: string[]; // Determines which conditional edges to follow
  resumeToken?: string; // Generated if status is SUSPENDED
  error?: Error;
}
```

### Detailed Node Specifications

| # | Node Type | Purpose | Configuration Schema |
| :--- | :--- | :--- | :--- |
| **1** | `START` | Validates initial workflow inputs and initializes state. | `{ inputSchema: { ... } }` |
| **2** | `END` | Formulates final workflow outputs and marks Run as `COMPLETED`. | `{ outputSchema: { ... } }` |
| **3** | `AGENT` | Executes an ARC Agent with system prompt, memory, and bound tools. | `{ agentId: string, promptTemplate: string, maxTokens: number }` |
| **4** | `ORCHESTRATOR` | Dynamically routes sub-tasks across multiple agents. | `{ orchestratorId: string, taskDescription: string }` |
| **5** | `TOOL` | Executes a registered deterministic tool (Python sandbox, SQL query, etc.). | `{ toolId: string, parameters: Record<string, string> }` |
| **6** | `MCP` | Invokes a tool or resource exposed by an MCP Server. | `{ mcpServerId: string, toolName: string, arguments: Record<string, unknown> }` |
| **7** | `SKILL` | Executes a multi-step structured reasoning skill methodology. | `{ skillId: string, contextParams: Record<string, unknown> }` |
| **8** | `DETERMINISTIC_TASK` | Executes high-speed mathematical/data logic (matching engine, ETL). | `{ componentId: string, operation: string, batchSize: number }` |
| **9** | `API` | Calls an external REST/GraphQL/gRPC endpoint. | `{ method: 'GET'\|'POST', url: string, headers: Record<string, string>, body: Record<string, unknown> }` |
| **10**| `DATA_TRANSFORM` | Performs state transformation using JSONata or JavaScript expressions. | `{ expression: string, inputKey: string, outputKey: string }` |
| **11**| `CONDITION` | Evaluates boolean or multi-case logic to select target edge handle. | `{ expression: string, cases: Record<string, string> }` |
| **12**| `LOOP` | Iterates over arrays or repeats until condition is satisfied. | `{ itemsKey: string, itemAlias: string, maxIterations: number }` |
| **13**| `PARALLEL` | Spawns concurrent execution branches. | `{ branches: string[][], joinMode: 'WAIT_ALL' \| 'WAIT_ANY' }` |
| **14**| `HUMAN_APPROVAL` | Suspends execution into `WAITING_FOR_HUMAN`, issues approval request. | `{ title: string, description: string, approvalRole: string, a2uiSurfaceKey?: string }` |
| **15**| `WAIT` | Timed delay or event listener. | `{ durationSeconds?: number, waitForEvent?: string }` |
| **16**| `EVENT` | Publishes domain event to event bus. | `{ topic: string, payloadTemplate: Record<string, unknown> }` |
| **17**| `SUB_WORKFLOW` | Executes child workflow synchronously or asynchronously. | `{ subWorkflowId: string, inputMapping: Record<string, string> }` |

---

## 4. Run State Machine & Checkpointing

The Run Engine maintains execution state with durable checkpoints.

```
       ┌──────────┐
       │  QUEUED  │
       └────┬─────┘
            │ Worker picks up run
            ▼
       ┌──────────┐
       │ RUNNING  │◄───────────────────────────┐
       └────┬─────┘                            │
            │                                  │
     ┌──────┴─────────────────────┐            │
     │                            │            │
     ▼ (Hits HUMAN_APPROVAL)      ▼ (Error)    │ Resume Token
┌────────────────────┐      ┌──────────┐       │ Received
│ WAITING_FOR_HUMAN  │      │  FAILED  │       │
└─────────┬──────────┘      └──────────┘       │
          │                                    │
          └────────────────────────────────────┘
          │ (If Rejected or Timed Out)
          ▼
    ┌───────────┐
    │ CANCELLED │
    └───────────┘
```

### Checkpointing Semantics
- At the end of every node execution, ARC saves an immutable state checkpoint to the database:
  `checkpointState = { workflowState, activeNodeIds, completedNodeIds, nodeExecutionHistory }`.
- When entering `WAITING_FOR_HUMAN`, the engine persists a cryptographically random `resumeToken`.
- The worker releases thread/memory resources. The run can remain paused for minutes, days, or weeks without consuming compute resources.
- When an authorized user invokes `POST /api/v1/runs/:id/resume`, the engine re-instantiates the run from the exact checkpoint and continues down the graph.

---

## 5. Natural Language Workflow Generation

ARC provides a prompt-to-graph synthesis engine:
1. **User Prompt:** "Upload two tax datasets, validate schemas, perform high-speed deterministic matching, route ambiguous items to Matching Agent, perform tax policy check via A2A, require human review, and generate final PDF report."
2. **Intent Parsing:** Extracts pipeline stages, matching types, agents required, and approval points.
3. **Graph Synthesis:** Maps stages to registered ARC components and connects edges with valid handle mappings.
4. **Validation:** Runs the 6 graph validation rules.
5. **Human Approval Gate:** Returns the generated topology to the user in visual builder mode for inspection and explicit sign-off.
