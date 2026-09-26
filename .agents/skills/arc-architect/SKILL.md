---
name: arc-architect
description: Comprehensive architecture guide for the ARC (Agentic Application & Runtime Control) platform. Use when designing, creating, or modifying canonical entities, control plane APIs, execution plane abstractions, or domain boundaries.
---

# ARC Platform Architecture Skill

## Purpose
This skill provides the architectural blueprints, invariants, and domain contracts for building and maintaining the ARC platform. Any model working on ARC must follow these instructions.

## Core Architectural Invariants
1. **Separation of Concerns:**
   - **Control Plane**: Manages definitions, registries, governance, policies, approvals, dependency graphs, versions, and observability metadata.
   - **Execution Plane**: Executes workflows, agents, deterministic tasks, tools, and models. Runs on Azure, AWS, GCP/Vertex, KPMG GCC, on-prem, or local simulated environments.
2. **Generic Platform Principle:**
   - ARC is the generic foundation. TARS 2.0, Matching Intelligence, and PPT Preparation are applications built *on* ARC.
   - If TARS is removed from the database, zero lines of ARC core code should break.
3. **Pluggable Adapter Pattern:**
   - All external integrations (Models, Tools, MCP, A2A, Deployment Targets, Storage, Identity) must implement strict interfaces (`IModelProviderAdapter`, `IToolAdapter`, `IMCPAdapter`, etc.).
   - When external credentials are unavailable, provide fully functional local/mock adapters clearly labeled `SIMULATED EXECUTION PLANE`.

## Canonical Domain Model (25+ Entities)
ARC strictly prevents collapsing concepts into "Agent":
- `Application`: Business-facing product experience with branding, UI mode (`GENERATED`, `GENERATED_A2UI`, `CUSTOM`, `HYBRID`), navigation, and permissions.
- `UseCase`: Executable business capability with inputs, outputs, triggers, and workflow references.
- `Workflow`: Directed graph with nodes and edges supporting branching, loops, parallel joins, retries, and human approvals.
- `WorkflowNode`: Discrete node with typed input/output schema and configuration.
- `Agent`: Reusable reasoning identity referencing Models, Frameworks, Runtimes, Tools, MCPs, Skills, Policies, and Memory.
- `Orchestrator`: First-class entity for task routing, agent sequencing, delegation, and state aggregation.
- `Model`: Provider-agnostic model registry item (reasoning, chat, embedding, multimodal).
- `Tool`: Mechanistic execution capability (Python, SQL, REST, matcher).
- `MCP`: Model Context Protocol server configuration (endpoint, tools, resources, capabilities).
- `Skill`: Reusable methodology ("HOW" to perform a task).
- `Policy`: Authoritative governance document with legal provenance, effective dates, and applicability rules.
- `KnowledgeSource`: Connector to documents, databases, vector stores, or enterprise data lakes.
- `DeterministicComponent`: High-throughput non-LLM computation (ETL, calculation, matching engine).
- `A2AEndpoint`: Agent-to-Agent routing and capability discovery.
- `A2UIComponent`: Controlled generative UI schema definition.
- `Run`, `Trace`, `Artifact`, `Dependency`, `Approval`, `EvaluationSuite`, `Deployment`.

## Technology Choices
- **Monorepo:** pnpm + Turborepo
- **Backend:** Node.js + Express / Fastify + TypeScript (API-first, OpenAPI typed)
- **Database:** Prisma ORM with SQLite for development, PostgreSQL-ready schema
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + Lucide Icons + `@xyflow/react` for graph builder
- **Tracing:** OpenTelemetry-compatible span trees with token, latency, and cost metadata
