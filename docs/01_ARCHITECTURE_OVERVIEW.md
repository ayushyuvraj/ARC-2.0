# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 01: Architecture Overview & System Foundations

---

## 1. System Vision & Purpose

**ARC** is an enterprise-grade AI application platform designed to design, govern, compose, deploy, execute, observe, evaluate, and manage multi-agent and deterministic enterprise applications at scale.

Modern enterprise adoption of AI fails when systems collapse all abstractions into a single prompt or a black-box "agent." ARC rejects this collapse. In ARC:
* **Applications** deliver business-facing experiences, branding, navigation, permissions, and user journeys.
* **Use Cases** deliver discrete, executable business capabilities (e.g., Tax Reconciliation, Credit Risk Assessment).
* **Workflows** coordinate tasks across directed graphs with branching, loops, joins, human gates, and error handlers.
* **Deterministic Components** handle high-volume data ingestion, mathematical matching, ETL, and validations.
* **Agents** perform probabilistic reasoning, contextual interpretation, and decision synthesis.
* **MCP (Model Context Protocol)** connects agents to tools, enterprise data lakes, and contextual resources.
* **A2A (Agent-to-Agent)** connects heterogeneous agents across clouds, runtimes, and security boundaries.
* **A2UI (Agent-to-User Interface)** safely renders task-specific generative UI surfaces without script injection.
* **Control Plane** governs configuration, registries, approvals, dependencies, versions, and policies.
* **Execution Planes** execute workloads across Azure, AWS, Google Cloud (Vertex), KPMG GCC, on-prem, and local runtimes.

---

## 2. Fundamental Architectural Division: Control Plane vs. Execution Plane

ARC enforces a strict physical and logical decoupling between the **Control Plane** and the **Execution Planes**.

```
                             ARC PLATFORM ARCHITECTURE
                             
                    ┌────────────────────────────────────────┐
                    │             CONTROL PLANE              │
                    │  (Definitions, Governance, Registries) │
                    ├────────────────────────────────────────┤
                    │ • Application & Use Case Registries    │
                    │ • Graph Workflow Composer & Engine     │
                    │ • Agent, Model, Tool & MCP Registries  │
                    │ • Policy Authority & Governance        │
                    │ • Dependency Graph & Blast Radius      │
                    │ • Distributed Trace & Observability    │
                    │ • Continuous Evaluation Harness        │
                    └───────────────────┬────────────────────┘
                                        │
                         deployment & orchestration
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ EXECUTION PLANE │            │ EXECUTION PLANE │            │ EXECUTION PLANE │
│    AZURE CLOUD  │            │  VERTEX AI/GCP  │            │    KPMG GCC     │
├─────────────────┤            ├─────────────────┤            ├─────────────────┤
│ • Matching Agent│<────A2A───>│ • Tax Agent     │<────A2A───>│ • Orchestrator  │
│ • Azure OpenAI  │            │ • Gemini Pro    │            │ • Deterministic │
│ • Blob Storage  │            │ • BigQuery Tool │            │   Calculation   │
└─────────────────┘            └─────────────────┘            └─────────────────┘
         │                              │                              │
         └──────────────────────┬───────┴──────────────────────────────┘
                                │
                 telemetry, traces, run state deltas
                                │
                                ▼
                    ┌────────────────────────┐
                    │  OBSERVABILITY FABRIC  │
                    │ Runs • Traces • Costs  │
                    │   Artifact Lineage     │
                    └────────────────────────┘
```

### 2.1 The Control Plane
The Control Plane is the authoritative central brain:
* **Metadata & Configuration:** Stores canonical definitions of Applications, Use Cases, Workflows, Agents, Models, Tools, MCPs, Skills, Policies, and Deployments.
* **Validation & Gates:** Ensures that workflows are topologically valid, data classifications are honored, and required approvals are granted before deployment.
* **State & Checkpoints:** Tracks active Run statuses, manages human approval resume tokens, and aggregates distributed trace spans.
* **Impact Engine:** Maintains the enterprise dependency graph to instantly compute the downstream blast radius if any shared model, tool, or policy is altered or disabled.

### 2.2 The Execution Planes
Execution Planes are the execution substrates where code actually executes.
* **Decoupled Infrastructure:** An execution plane may be a private Kubernetes cluster in KPMG GCC, managed serverless containers in Azure, Vertex AI Agent Engine in GCP, an AWS ECS cluster, or a local Docker sandbox for development.
* **Heterogeneous Runtimes:** An agent running in Vertex can collaborate with an agent running in Azure via the standard A2A protocol.
* **Simulated Execution Planes:** When real cloud credentials are absent during development, ARC utilizes local simulated execution plane adapters that accurately emulate network latency, egress boundaries, and execution behavior, visibly labeled as `SIMULATED EXECUTION PLANE`.

---

## 3. The 5 Pillars of Harness Engineering in ARC

An enterprise agent is never just an LLM with a prompt:
$$\text{Enterprise Agent} = \text{Model} + \text{Harness}$$

ARC implements the 5 core pillars of Harness Engineering:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              ARC AGENT HARNESS                               │
├──────────────────────────────┬───────────────────────────────────────────────┤
│ 1. Information & Context     │ • Context window dynamic budgeting            │
│    Harness                   │ • Hierarchical memory (Run, Agent, Org)       │
│                              │ • Vector store & document knowledge retrieval │
├──────────────────────────────┼───────────────────────────────────────────────┤
│ 2. Execution & Tooling       │ • Model Context Protocol (MCP) clients        │
│    Harness                   │ • Sandboxed deterministic execution engines   │
│                              │ • API gateway adapters with rate limits       │
├──────────────────────────────┼───────────────────────────────────────────────┤
│ 3. Cybernetic & Control      │ • Graph state machines (DAG + loops)          │
│    Fabric                    │ • Closed-loop feedback (Eval -> Adjust)       │
│                              │ • Human-in-the-loop (HITL) approval gates     │
│                              │ • Authoritative institutional policy engine   │
├──────────────────────────────┼───────────────────────────────────────────────┤
│ 4. Inter-Entity Protocols    │ • A2A (Agent-to-Agent) peer discovery         │
│                              │ • A2UI (Agent-to-UI) safe generative surfaces │
│                              │ • Cross-cloud security & tenant boundaries    │
├──────────────────────────────┼───────────────────────────────────────────────┤
│ 5. Evaluation &              │ • Golden dataset regression benchmark         │
│    Observability Harness     │ • OpenTelemetry-compatible distributed traces │
│                              │ • SHA-256 cryptographic artifact lineage      │
│                              │ • Granular token and financial cost tracking  │
└──────────────────────────────┴───────────────────────────────────────────────┘
```

---

## 4. Architectural Invariants

1. **ARC is Generic:** ARC must never be coupled to a single business use case. TARS 2.0 (Tax Reconciliation), Matching Intelligence, and PPT Preparation are applications built *on* ARC.
2. **Deterministic-First:** Never push bulk tabular datasets through an LLM. High-throughput deterministic engines filter, validate, and match 85-95% of data; agents are reserved for edge cases, ambiguity, and human explanations.
3. **Shared-Resource Model:** Agents DO NOT own models, tools, MCPs, or policies. They reference shared registry items.
4. **No Arbitrary Script Injection:** In A2UI mode, agents return strictly typed JSON component descriptions validated against a fixed vocabulary (`Card`, `Table`, `ComparisonPanel`, `EvidencePanel`). The frontend never renders unsanitized agent-generated code.
5. **Traceability & Immutability:** Every Run snapshot captures the exact version hashes of all participating agents, models, prompts, tools, and policies.
