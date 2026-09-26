---
name: arc-workflow-engine
description: Guide for building, validating, executing, and testing ARC graph workflows. Covers node execution contracts, DAG validation, cycles/loops, parallel execution, human approvals, checkpointing, and natural language to workflow generation.
---

# ARC Workflow Engine Skill

## Purpose
This skill defines how to implement and extend ARC's graph-based workflow engine.

## Graph Architecture Requirements
ARC workflows are **directed graphs**, not mere linear lists. The engine must support:
- Sequential execution
- Branching and condition evaluation (`if/else`)
- Loops and iterations with cycle counters and maximum iteration bounds
- Parallel forks and synchronization joins (`all`, `any`, `quorum`)
- Human approval pauses with resume tokens
- Sub-workflows and event triggers
- Node-level timeouts, retry policies, and error fallbacks

## Minimum Supported Node Types (17 Nodes)
1. `START` / `END` — Workflow entry and exit points with input/output validation.
2. `AGENT` — Invokes an ARC Agent with prompt, context, and bound tools/skills.
3. `ORCHESTRATOR` — Dynamically routes tasks to multiple sub-agents.
4. `TOOL` — Directly executes a registered deterministic or API tool.
5. `MCP` — Invokes a tool or resource exposed by a registered MCP server.
6. `SKILL` — Executes a structured multi-step methodology.
7. `DETERMINISTIC_TASK` — Runs high-speed non-LLM logic (matching, calculation, ETL).
8. `API` — Invokes an external REST, GraphQL, or gRPC endpoint.
9. `DATA_TRANSFORM` — JSONata, JQ, or mapping transformation on state.
10. `CONDITION` — Evaluates logical expressions against workflow state to select outbound edge.
11. `LOOP` — Iterates over collections or repeats until condition is met.
12. `PARALLEL` — Spawns parallel execution branches.
13. `HUMAN_APPROVAL` — Suspends workflow into `WAITING_FOR_HUMAN`, issues approval request, waits for resume signal.
14. `WAIT` — Timed delay or event trigger listener.
15. `EVENT` — Publishes or subscribes to enterprise event bus topics.
16. `SUB_WORKFLOW` — Invokes another workflow as a modular child graph.

## Run Lifecycle State Machine
```
   [QUEUED] ──> [RUNNING] ──> [COMPLETED]
                   │    ▲
      suspend      ▼    │ resume
             [WAITING_FOR_HUMAN]
                   │
         error     ▼     cancel
             [FAILED] / [CANCELLED]
```

## Checkpointing & State Isolation
- Every node execution produces an immutable state delta.
- The workflow state is saved to the database on every node completion.
- Human approval creates a unique `resumeToken`. When the user approves or rejects via API/UI, the engine loads the checkpoint and resumes execution seamlessly.

## Natural Language Workflow Generation
ARC includes a prompt-to-graph translator that converts business descriptions into validated workflow topologies:
1. Parse user intent and detect required business stages.
2. Map stages to registered ARC Agents, Tools, and Policies.
3. Generate node and edge configurations in ARC Canonical Workflow JSON.
4. Run graph validation (verify no orphaned nodes, valid input/output schemas).
5. Present to human for review and approval before saving as active version.
