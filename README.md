# ARC — Enterprise Agentic Application & Runtime Control Platform

[![ARC Platform Acceptance](https://img.shields.io/badge/Platform%20Acceptance-29%2F29%20Passed%20(100%25)-emerald?style=for-the-badge&logo=checkmarx)](tests/platform-acceptance-29-steps.ts)
[![Architecture Spec](https://img.shields.io/badge/Architecture%20Spec-78%20Sections%20Complete-blue?style=for-the-badge)](docs/01_ARCHITECTURE_OVERVIEW.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](package.json)
[![Prisma ORM](https://img.shields.io/badge/Prisma-SQLite-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](packages/database/prisma/schema.prisma)
[![React Vite](https://img.shields.io/badge/React%2018-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](apps/web-portal)

> **ARC** stands for **Enterprise Agentic Application & Runtime Control Platform**. Workflows coordinate work, Agents perform reasoning, MCP connects agents to external tools/data, A2A connects agents to agents across clouds, A2UI connects agents to users via strictly validated generative UI, and Applications provide the business-facing product experience.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Install Dependencies & Build Workspace
```bash
# Clone the repository
git clone https://github.com/ayushyuvraj/ARC-2.0.git
cd "ARC-2.0"

# Install all workspace dependencies
npm install

# Build all core domain and engine packages
npm run build
```

### 3. Database Initialization & Seeding
```bash
# Generate Prisma Client & Run DB Migrations
npm run prisma:generate --workspace=@arc/database
npm run prisma:migrate --workspace=@arc/database

# Seed Database with 25+ Canonical Entities, TARS 2.0, Models & Policies
npm run seed --workspace=@arc/database
```

### 4. Launch the Platform
Start the **Control Plane REST API** (Port `4000`) and the **Web Portal** (Port `3000`):
```bash
# Terminal 1: Control Plane API Server (Port 4000)
npm start --workspace=@arc/control-plane-api

# Terminal 2: Web Portal Dev Server (Port 3000)
npm run dev --workspace=@arc/web-portal
```
- **Web Portal:** [http://localhost:3000](http://localhost:3000)
- **API Health:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **Swagger/REST Catalog:** [http://localhost:4000/api/v1/applications](http://localhost:4000/api/v1/applications)

---

## 🧪 Running the 29-Step Platform Acceptance Test

ARC includes an end-to-end platform acceptance demonstration verifying the complete INDIRECT TAX (TARS 2.0) lifecycle:

### Headless CLI Execution:
```bash
npx tsx tests/platform-acceptance-29-steps.ts
```
```
================================================================
🚀 ARC PLATFORM — 29-STEP FULL ACCEPTANCE DEMONSTRATION TEST
   Enterprise Indirect Tax Reconciliation & Platform Stability
================================================================

✅ [Step 01/29] Log into the ARC Control Plane Portal (Health check) (130ms)
✅ [Step 02/29] Open the global Applications catalog (14ms)
✅ [Step 03/29] Select "TARS 2.0" from authorized applications (15ms)
✅ [Step 04/29] Inspect TARS application metadata & Indirect Tax domain bindings (0ms)
✅ [Step 05/29] Verify registered TARS Tax Reconciliation Graph (wf_tars_recon_v2) (8ms)
✅ [Step 06/29] Load synthetic GST Invoices and Purchase Register datasets (2ms)
✅ [Step 07/29] Submit reconciliation run payload to Run Engine (91ms)
✅ [Step 08/29] Observe workflow execution reach WAITING_FOR_HUMAN checkpoint (13ms)
✅ [Step 09/29] Verify Deterministic Matcher offloading (85.0% exact match rate) (13ms)
✅ [Step 10/29] Verify Matching Agent reasoning on ambiguous invoice records (13ms)
✅ [Step 11/29] Observe A2A call dispatched across clouds (Azure -> Vertex AI) (31ms)
✅ [Step 12/29] Verify Tax Policy Agent statutory citation under Section 16(2) (10ms)
✅ [Step 13/29] Verify dynamic A2UI surface payload matches Controlled Vocabulary (4ms)
✅ [Step 14/29] Human auditor enters approval remark & signs off with resumeToken (57ms)
✅ [Step 15/29] Verify durable workflow engine resumes and completes (13ms)
✅ [Step 16/29] Verify final sealed reconciliation audit report artifact generated (10ms)
✅ [Step 17/29] Open completed Run telemetry dossier (11ms)
✅ [Step 18/29] Inspect distributed OpenTelemetry trace waterfall spans (9ms)
✅ [Step 19/29] Verify cryptographic artifact lineage DAG and content hash (10ms)
✅ [Step 20/29] Verify exact version snapshots of models, tools, and policies (12ms)
✅ [Step 21/29] Verify granular financial cost accounting and token expenditure (11ms)
✅ [Step 22/29] Query Continuous Evaluation regression benchmark matrix (7ms)
✅ [Step 23/29] Inspect Dependency Graph edges supporting TARS 2.0 (5ms)
✅ [Step 24/29] Open Application Deployment Target registry (7ms)
✅ [Step 25/29] Verify multi-cloud topology map (KPMG GCC, Azure, Vertex AI) (6ms)
✅ [Step 26/29] Toggle shared deterministic tool status to DISABLED in test sandbox (22ms)
✅ [Step 27/29] Verify recursive downstream blast-radius impact analysis alert (15ms)
✅ [Step 28/29] Re-enable the shared deterministic tool (status -> ACTIVE) (21ms)
✅ [Step 29/29] Re-execute reconciliation workflow to prove platform resilience (14ms)

================================================================
🎉 ALL 29 PLATFORM ACCEPTANCE STEPS PASSED WITHOUT FAILURE!
   ARC Platform stability, determinism, and governance verified.
================================================================
```

### Interactive Browser UI Execution:
1. Navigate to **[http://localhost:3000](http://localhost:3000)**.
2. Click the **`29-Step Acceptance Suite`** button in the global navbar (or select **TARS 2.0** and click **`Run 29-Step Acceptance Test`**).
3. Click **`Run Acceptance Test`** to watch the real-time execution progress, micro-second latency metrics, and expandable JSON evidence dossiers for each step.
4. Download the signed **Audit Certificate** (`ARC_Platform_29_Step_Acceptance_Certificate.json`).

---

## 🏛️ Master Architecture & Monorepo Structure

```
ARC 2.0/
├── apps/
│   ├── control-plane-api/     # Express.js REST API, OpenTelemetry Spans, A2A/A2UI Endpoints (Port 4000)
│   └── web-portal/            # React 18 + Vite Control Plane Web Portal & Canvas (Port 3000)
├── packages/
│   ├── domain-core/           # 25+ Canonical entity types, Zod schemas, lifecycle state machines
│   ├── database/              # Prisma SQLite ORM, migrations, seed data engine
│   └── workflow-engine/       # 17 node executors, DAG validation, durable checkpoints, NL synthesis
├── docs/                      # 10 comprehensive architectural specifications (78 sections)
├── samples/                   # Synthetic enterprise test datasets (GST invoices, Purchase Register)
├── tests/                     # 29-step platform acceptance demonstration test runner
└── .agents/skills/            # 6 Workspace Customization Skills for AI agent collaboration
```

---

## 📦 Delivered Implementation Roadmap (10 Phases)

| Phase | Milestone | Deliverables | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1** | Foundation & Data Architecture | Monorepo layout, `@arc/domain-core` types, Prisma schema, SQLite seed engine, REST API shell, React web portal. | ✅ Complete |
| **Phase 2** | Canonical Registries & Control Plane | Models, Tools, MCP, Skills, Policies, Agents, Orchestrators CRUD, ping health diagnostics, blast-radius calculator. | ✅ Complete |
| **Phase 3** | Graph Workflow Engine & Builder | 17 node executors, DAG validator, cycle detection, durable checkpoints (`WAITING_FOR_HUMAN`), `resumeToken`, `@xyflow/react` visual builder, NL synthesizer. | ✅ Complete |
| **Phase 4** | Observability, Tracing & Lineage | Hierarchical OpenTelemetry span tree, SHA-256 cryptographic artifact lineage DAG, financial cost accounting, Run Explorer. | ✅ Complete |
| **Phase 5** | Governance, RBAC & Boundary Guards | Multi-role approval queue (`TAX_LEAD`, `SECURITY_OFFICER`), risk scoring, RBAC matrix, data classification boundary guards (`PUBLIC` $\to$ `RESTRICTED`), audit trail. | ✅ Complete |
| **Phase 6** | Continuous Evaluation & Regressions | Golden Datasets, ground-truth benchmark suite, side-by-side model/prompt regression matrix (`+2.6% Acc`, `-1.0% Hallucination`, `-$8.30 Cost`), live benchmark runner. | ✅ Complete |
| **Phase 7** | A2A Inter-Agent Communication | `A2AMessageEnvelope` and `A2AResponseEnvelope`, agent directory, cross-cloud tracing (Azure GPT-4o $\to$ Vertex AI Gemini 1.5 Pro / GCC), telemetry log. | ✅ Complete |
| **Phase 8** | A2UI Generative Component System | Controlled Component Vocabulary (`Card`, `ComparisonPanel`, `EvidencePanel`, `ApprovalPanel`), zero script injection Zod validation, split-screen `A2UIStudio`. | ✅ Complete |
| **Phase 9** | Execution Planes & Multi-Cloud Topology | Decoupled deployment targets (KPMG GCC, Azure, Vertex AI, Local), `CloudExecutionPlaneAdapter`, `SIMULATED EXECUTION PLANE` banners, regional topology map. | ✅ Complete |
| **Phase 10** | TARS 2.0 Reference App & 29-Step Acceptance | Synthetic GSTR-2B & ERP datasets, automated CLI test suite, interactive browser runner modal, 29/29 platform acceptance test passes. | ✅ Complete |

---

## 🔒 Master Platform Invariants

1. **Never collapse everything into "Agent".** ARC strictly enforces 25+ discrete canonical entities: Applications, Use Cases, Workflows, Agents, Orchestrators, Models, Tools, MCPs, Skills, Policies, Deterministic Components, and Deployments.
2. **ARC is generic; TARS 2.0 is an application running ON ARC.** TARS 2.0 can be completely deleted from the database without altering ARC platform capabilities.
3. **Deterministic First.** High-throughput non-LLM components offload 85%+ of bulk record matches at 42,500 rows/sec; agents handle ambiguous exceptions and legal interpretation.
4. **No Fake Features.** Where external enterprise services cannot be connected locally, functional mock adapters are implemented and labeled `SIMULATED EXECUTION PLANE`.
5. **A2UI Security.** Agents never emit raw HTML or JavaScript; dynamic interfaces strictly render validated Controlled Vocabulary JSON components.

---

## 📚 Architectural Documentation Suite

1. [01. Architecture Overview & System Foundations](docs/01_ARCHITECTURE_OVERVIEW.md)
2. [02. Canonical Domain Model & Entity Specifications](docs/02_CANONICAL_DOMAIN_MODEL.md)
3. [03. Control Plane API Specification](docs/03_CONTROL_PLANE_API_SPEC.md)
4. [04. Graph Workflow Engine & Execution Specification](docs/04_GRAPH_WORKFLOW_ENGINE_SPEC.md)
5. [05. Harness Engineering & Execution Runtimes](docs/05_HARNESS_ENGINEERING_AND_RUNTIMES.md)
6. [06. A2A & A2UI Protocols](docs/06_A2A_AND_A2UI_PROTOCOLS.md)
7. [07. Observability, Lineage & Dependency Intelligence](docs/07_OBSERVABILITY_LINEAGE_AND_DEPENDENCIES.md)
8. [08. Continuous Evaluation & Enterprise Governance](docs/08_EVALUATION_AND_GOVERNANCE_SPEC.md)
9. [09. Sample Applications & TARS 2.0 Acceptance Specification](docs/09_SAMPLE_APPLICATIONS_AND_TARS_SPEC.md)
10. [10. Repository Structure & Implementation Roadmap](docs/10_REPOSITORY_STRUCTURE_AND_ROADMAP.md)

---

## ⚖️ License
Enterprise Proprietary — Copyright © 2026 ARC Platform Engineering. All Rights Reserved.
