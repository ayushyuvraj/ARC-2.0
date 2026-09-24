# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 10: Repository Structure, Technology Stack & Implementation Roadmap

---

## 1. Repository Architecture (pnpm Workspaces + Turborepo)

ARC is organized as a high-performance TypeScript monorepo with strict package boundaries:

```
d:/Apps/My Experiments/ARC 2.0/
├── package.json                   # Root scripts & dev dependencies
├── pnpm-workspace.yaml            # Monorepo packages and apps
├── turbo.json                     # Turborepo task pipeline configuration
├── tsconfig.base.json             # Shared strict TypeScript base config
├── .gitignore                     # Monorepo git ignore rules
├── AGENTS.md                      # AI agent operational rules & platform invariants
│
├── .agents/                       # Antigravity IDE Workspace Customizations
│   └── skills/                    # Workspace skills for ARC platform engineering
│       ├── arc-architect/
│       ├── arc-workflow-engine/
│       ├── arc-harness-engineering/
│       ├── arc-a2a-a2ui/
│       ├── arc-observability-governance/
│       └── arc-tars-reference/
│
├── docs/                          # Master Architecture & Technical Specifications
│   ├── 01_ARCHITECTURE_OVERVIEW.md
│   ├── 02_CANONICAL_DOMAIN_MODEL.md
│   ├── 03_CONTROL_PLANE_API_SPEC.md
│   ├── 04_GRAPH_WORKFLOW_ENGINE_SPEC.md
│   ├── 05_HARNESS_ENGINEERING_AND_RUNTIMES.md
│   ├── 06_A2A_AND_A2UI_PROTOCOLS.md
│   ├── 07_OBSERVABILITY_LINEAGE_AND_DEPENDENCIES.md
│   ├── 08_EVALUATION_AND_GOVERNANCE_SPEC.md
│   ├── 09_SAMPLE_APPLICATIONS_AND_TARS_SPEC.md
│   └── 10_REPOSITORY_STRUCTURE_AND_ROADMAP.md
│
├── packages/
│   ├── domain-core/               # 25+ Canonical Entities, Zod Schemas, Domain Events
│   │   ├── src/
│   │   │   ├── entities/          # Application, UseCase, Workflow, Agent, Tool, Policy, etc.
│   │   │   ├── schemas/           # Zod validation schemas
│   │   │   ├── events/            # Domain event contracts
│   │   │   └── types/             # Shared TypeScript types
│   │   └── package.json
│   │
│   ├── workflow-engine/           # Graph Orchestrator, 17 Node Handlers, State Checkpointing
│   │   ├── src/
│   │   │   ├── graph/             # DAG validator, cycle detector, branch/join evaluator
│   │   │   ├── nodes/             # Handlers for 17 node types (AgentNode, ToolNode, HumanNode...)
│   │   │   ├── checkpoint/        # Durable state persistence & resume token manager
│   │   │   └── natural-language/  # Natural Language to Workflow graph synthesizer
│   │   └── package.json
│   │
│   ├── harness-runtime/           # Agent Harness, MCP Client, Memory, Deterministic Engines
│   │   ├── src/
│   │   │   ├── agent/             # Context window budgeting, prompt management
│   │   │   ├── memory/            # Scoped memory (Run, Agent, UseCase, Organization)
│   │   │   ├── deterministic/     # High-throughput matching engine, SQL, ETL
│   │   │   ├── mcp/               # Model Context Protocol client & resource binder
│   │   │   ├── policy/            # Authoritative policy compliance engine
│   │   │   ├── a2a/               # Agent-to-Agent message dispatcher & trace interceptor
│   │   │   └── a2ui/              # Controlled UI schema validator & surface dispatcher
│   │   └── package.json
│   │
│   ├── adapters-cloud/            # Pluggable Provider & Execution Plane Adapters
│   │   ├── src/
│   │   │   ├── models/            # OpenAI, Azure OpenAI, Vertex AI, Anthropic, MockModelProvider
│   │   │   ├── execution-planes/  # Azure, Vertex, GCC, On-Prem, Local Simulated
│   │   │   └── storage/           # Local file storage, S3/Blob storage adapters
│   │   └── package.json
│   │
│   ├── eval-harness/              # Continuous Evaluation, Golden Datasets, Regression Matrix
│   │   ├── src/
│   │   │   ├── datasets/          # Golden dataset repository & test case manager
│   │   │   ├── evaluators/        # Accuracy, hallucination, policy compliance, cost evaluators
│   │   │   └── regression/        # Side-by-side variant comparison (Model A vs B)
│   │   └── package.json
│   │
│   └── database/                  # Prisma ORM, SQLite/Postgres Client, Seed Engine
│       ├── prisma/
│       │   ├── schema.prisma      # Relational schema for all 25+ domain entities
│       │   └── seed.ts            # Seeds TARS 2.0, Matching, PPT, Agents, Models, Tools
│       ├── src/
│       │   └── repositories/      # ApplicationRepo, RunRepo, TraceRepo, DependencyRepo...
│       └── package.json
│
├── apps/
│   ├── control-plane-api/         # REST & SSE API for ARC Control Plane
│   │   ├── src/
│   │   │   ├── controllers/       # Application, Workflow, Run, Trace, Governance controllers
│   │   │   ├── routes/            # Express/Fastify routes (/api/v1/...)
│   │   │   ├── middleware/        # RBAC, audit logging, data classification guards
│   │   │   ├── services/          # Dependency blast radius engine, approval services
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   └── web-portal/                # Unified Enterprise UI (React 19 + Vite + Tailwind CSS)
│       ├── src/
│       │   ├── components/        # Enterprise UI Kit (DataGrid, Metric, Modal, Badges)
│       │   ├── features/
│       │   │   ├── portal/        # Application Catalog (/apps), Home Dashboard, Navigation
│       │   │   ├── workflow/      # Visual Graph Builder (@xyflow/react canvas)
│       │   │   ├── observability/ # Distributed Trace Waterfall, Artifact Lineage DAG
│       │   │   ├── governance/    # Approvals, Dependency Impact Viewer, Policy Registry
│       │   │   ├── evaluation/    # Golden Dataset Benchmarking & Regression Matrix
│       │   │   ├── a2ui/          # Dynamic Surface Renderer for agent-generated components
│       │   │   └── apps/          # TARS 2.0, Matching Intelligence, PPT App experiences
│       │   └── App.tsx
│       └── package.json
│
└── samples/
    └── tars-data/                 # Synthetic GST and Purchase Register datasets
        ├── gst_invoices_sample.json
        └── purchase_register_sample.json
```

---

## 2. Technology Stack Selection & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.5+ (Node 20+) | End-to-end type safety across backend schemas, graph topologies, A2UI contracts, and frontend components. |
| **Monorepo Tools** | pnpm + Turborepo | Instant workspace linking, strict isolation, and cached incremental builds. |
| **Backend Engine** | Express / Fastify + Zod | High-concurrency event routing, lightweight non-blocking I/O, native JSON Schema generation. |
| **Database & ORM** | Prisma ORM (SQLite / PostgreSQL) | Strongly typed relational queries, automated migrations, zero external database setup required for local development. |
| **Frontend Framework** | React 19 + Vite | State-of-the-art React compiler performance, sub-second Hot Module Replacement (HMR). |
| **Visual Workflow Canvas**| `@xyflow/react` (React Flow Pro standard) | Industry-standard graph orchestration canvas with custom node handles, minimaps, and live node status styling. |
| **Styling & Aesthetics** | Tailwind CSS + Lucide Icons | Clean, high-density, professional enterprise design system tailored for audit, tax, and risk applications. |

---

## 3. The 10-Phase Implementation Roadmap

```
Phase 01: Foundation & Data Architecture
          ├── Monorepo setup (pnpm, turbo, tsconfig)
          ├── Prisma schema with all 25+ domain entities
          ├── Database seed script (TARS 2.0, Matching, PPT, Agents, Models, Tools)
          └── API server shell & Base Frontend Portal layout
          
Phase 02: Canonical Registries & Control Plane Services
          ├── Registries API & UI for Models, Tools, MCPs, Skills, Policies
          └── Shared-resource agent configuration engine

Phase 03: Graph Workflow Engine & Execution Engine
          ├── Visual Workflow Builder (@xyflow/react canvas)
          ├── 17 Node Type Executors & DAG Validator
          ├── Run State Machine (QUEUED -> RUNNING -> COMPLETED)
          └── Natural Language to Workflow Graph Generator

Phase 04: Observability, Distributed Tracing & Lineage
          ├── OpenTelemetry Trace Span hierarchy & cost/token accounting
          ├── Directional Artifact Lineage DAG (SHA-256 content hashing)
          └── Observability Dashboard & Trace Waterfall Viewer

Phase 05: Governance, RBAC, Approvals & Dependency Graph
          ├── Recursive Dependency Engine (Blast radius & impact assessment)
          ├── Multi-role Human Approval workflows
          └── Data Classification Boundary Guards (PUBLIC to RESTRICTED)

Phase 06: Continuous Evaluation Platform & Regression Suite
          ├── Golden Dataset & Test Case management
          ├── Multi-metric evaluators (accuracy, hallucination, policy compliance)
          └── Side-by-side Model/Prompt Regression Matrix

Phase 07: A2A (Agent-to-Agent) Inter-Agent Fabric
          ├── Agent Registry discovery & capability schema routing
          ├── A2A Request/Response Envelope Dispatcher
          └── Cross-cloud execution plane trace propagation

Phase 08: A2UI Dynamic Generative Component System
          ├── Controlled Component Vocabulary (Card, Table, ComparisonPanel, EvidencePanel)
          ├── Strict Zod JSON Schema Validation (prevents script injection)
          └── Dynamic React Surface Renderer & Human action callbacks

Phase 09: Execution Planes & Multi-Cloud Deployment Abstractions
          ├── Decoupled Deployment Targets (Azure, Vertex, GCC, On-Prem, Local)
          ├── Pluggable Cloud Provider Adapters
          └── Multi-Cloud Topology Visualizer

Phase 10: TARS 2.0 Reference Application & Acceptance Test
          ├── Synthetic GST & Purchase Register datasets
          ├── End-to-end TARS Tax Reconciliation workflow
          └── Execution and verification of the full 29-step acceptance test
```

---

## 4. Acceptance Gate Policy

No phase proceeds to the next until its automated tests pass and its user-facing capabilities are demonstrably verifiable. This guarantees continuous vertical stability throughout the build process.
