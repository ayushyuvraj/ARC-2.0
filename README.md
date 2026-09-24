# ARC — Enterprise Agentic Application & Runtime Control Platform

> **ARC** is the enterprise control and execution fabric; Workflows coordinate work, Agents perform reasoning, MCP connects agents to tools/data, A2A connects agents to agents, A2UI connects agents to users, and Applications provide the business-facing experience.

---

## Architecture & Specification Documents

This repository contains the complete, authoritative engineering specification for building ARC end-to-end. Any AI model or software engineer can build, test, and operate the platform using these specifications:

1. **[01. Architecture Overview & System Foundations](./docs/01_ARCHITECTURE_OVERVIEW.md)**
   * Executive vision, Control Plane vs. Execution Plane, 5 Pillars of Harness Engineering, System Invariants.
2. **[02. Canonical Domain Model & Entity Specifications](./docs/02_CANONICAL_DOMAIN_MODEL.md)**
   * Complete schema definitions, enums, relationships, and lifecycle states for all 25+ first-class domain entities.
3. **[03. Control Plane API Specification](./docs/03_CONTROL_PLANE_API_SPEC.md)**
   * REST endpoints, SSE streams, request/response JSON payloads, status codes, and error envelopes.
4. **[04. Graph Workflow Engine & Execution Specification](./docs/04_GRAPH_WORKFLOW_ENGINE_SPEC.md)**
   * Directed graph model, DAG validation, cycles/loops, parallel joins, human approval checkpoints, 17 node types, and Natural Language workflow synthesis.
5. **[05. Harness Engineering & Execution Runtimes](./docs/05_HARNESS_ENGINEERING_AND_RUNTIMES.md)**
   * Agent Harness (`Agent = Model + Harness`), Context window budgeting, Model Provider abstraction, Deterministic-first matching, MCP server integration, and Hierarchical Memory.
6. **[06. A2A & A2UI Protocols](./docs/06_A2A_AND_A2UI_PROTOCOLS.md)**
   * Agent-to-Agent (A2A) cross-cloud message envelope and trace interception; Agent-to-UI (A2UI) controlled component vocabulary and secure generative UI rendering.
7. **[07. Observability, Lineage & Dependency Intelligence](./docs/07_OBSERVABILITY_LINEAGE_AND_DEPENDENCIES.md)**
   * OpenTelemetry distributed trace spans, token/cost accounting, SHA-256 Artifact Lineage DAG, and recursive Dependency blast radius engine (`calculateDownstreamImpact`).
8. **[08. Continuous Evaluation & Enterprise Governance](./docs/08_EVALUATION_AND_GOVERNANCE_SPEC.md)**
   * Golden datasets, multi-metric evaluators, model/prompt regression matrix, RBAC roles, audit logs, and data classification boundary guards (`PUBLIC` to `RESTRICTED`).
9. **[09. Sample Applications & TARS 2.0 Acceptance Specification](./docs/09_SAMPLE_APPLICATIONS_AND_TARS_SPEC.md)**
   * Specifications for TARS 2.0 (Tax Reconciliation), Matching Intelligence, PPT Preparation, and the formal 29-step acceptance test verification script.
10. **[10. Repository Structure & Implementation Roadmap](./docs/10_REPOSITORY_STRUCTURE_AND_ROADMAP.md)**
    * Turborepo + pnpm monorepo layout, package boundaries, technology choices, and Phase 1 to Phase 10 execution sequence.

---

## Workspace Customization Skills (`.agents/skills/`)

For AI models and automated assistants operating within this repository, dedicated skills are installed under `.agents/skills/`:
* `arc-architect`: System architecture, canonical entities, domain boundaries, and invariant enforcement.
* `arc-workflow-engine`: Graph orchestrator execution, node contracts, checkpointing, and natural language translation.
* `arc-harness-engineering`: Agent harness, context budgeting, memory scoping, MCP, and deterministic execution.
* `arc-a2a-a2ui`: A2A message dispatcher and A2UI controlled component rendering.
* `arc-observability-governance`: Distributed tracing, artifact lineage, dependency impact analysis, and governance gates.
* `arc-tars-reference`: TARS 2.0 reference implementation guide and 29-step acceptance test harness.

---

## Master Platform Invariants
* **Never collapse everything into "Agent".** Distinguish Applications, Use Cases, Workflows, Agents, Orchestrators, Models, Tools, MCPs, Skills, Policies, Deterministic Components, and Deployments.
* **ARC is generic.** TARS 2.0 is an application running on ARC. TARS can be removed without altering ARC.
* **Deterministic First.** High-throughput non-LLM components process bulk data (85%+); agents handle exceptions, ambiguities, and policy interpretation.
* **No Fake Features.** Integrations with external execution planes or services implement functional local/mock adapters clearly labeled `SIMULATED EXECUTION PLANE`.
