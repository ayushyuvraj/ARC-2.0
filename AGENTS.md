# ARC Platform — AI Agent & Model Operational Rules

## 1. Core Platform Invariant
ARC stands for **Enterprise Agentic Application & Runtime Control Platform**.
- **ARC is the generic platform; TARS 2.0 is merely one application built ON ARC.**
- Never hardcode ARC around TARS or any specific domain. If TARS is deleted from the database, ARC must continue to function unchanged.
- Where an external enterprise service (Azure, Vertex, AWS, GCC) cannot be connected in development, implement a clean provider abstraction and a working local/mock adapter. Clearly label it as `SIMULATED EXECUTION PLANE` rather than pretending it exists.
- Never build fake features. No inert buttons, no dead mock endpoints.

## 2. Mandatory Conceptual Boundaries — Never Collapse Everything into "Agent"
ARC strictly distinguishes the following first-class concepts:
1. **Application** — The business-facing product/experience (branding, navigation, user groups, permissions, use cases).
2. **UseCase** — An executable business capability (inputs, outputs, triggers, workflow, policies, deployment targets).
3. **Workflow** — An execution graph (DAG, loops, parallel branches, joins, error handlers, approval gates).
4. **WorkflowNode** — Discrete execution unit with schema-validated inputs/outputs (17 node types).
5. **Agent** — Composable reasoning identity referencing models, tools, skills, policies, and memory. Agents DO NOT own these resources; they reference shared registries.
6. **Orchestrator** — First-class entity that routes tasks, sequences agents, and aggregates results.
7. **Model** — Model registry item with provider abstraction (reasoning, chat, embedding, multimodal).
8. **Tool** — Mechanistic execution capability (Python, SQL, REST API, calculation, matcher).
9. **MCP** — Model Context Protocol server connection (resources, tools, capabilities).
10. **Skill** — Procedural methodology ("HOW" to perform a task; distinct from a Tool which is the "MECHANISM").
11. **Policy** — Authoritative enterprise governance rule with legal provenance, authority, and effective dates.
12. **KnowledgeSource** — Grounding context connector (documents, vector store, SQL, graph).
13. **Memory** — Scoped state retention (Run, Agent, UseCase, User, Organization).
14. **DeterministicComponent** — High-throughput non-LLM engine (ETL, calculation, matching engine).
15. **A2A** — Agent-to-Agent communication endpoint, capability discovery, and tracing protocol.
16. **A2UI** — Agent-to-User Interface dynamic generative component schema.
17. **Run** — An execution instance with lifecycle status, cost, tokens, and outputs.
18. **Trace** — Distributed OpenTelemetry-compatible span tree with latency, cost, and metadata.
19. **Artifact** — Immutable versioned input/output with strict cryptographic content hashing and lineage.
20. **Dependency** — Graph edge enabling blast-radius impact analysis across the entire enterprise.

## 3. Harness Engineering Principles
- **Agent = Model + Harness**: The model supplies reasoning; the harness supplies context, tools, memory, deterministic pre/post-processing, policy verification, and cybernetic feedback loops.
- **Deterministic First**: Never send massive datasets row-by-row through an LLM. Deterministic components must process the bulk load (e.g. 85-95% exact matches); agents handle ambiguity, exceptions, and policy interpretation.
- **A2UI Security**: Agents can NEVER inject raw HTML or executable JavaScript. Agents emit strictly typed JSON payloads adhering to the A2UI schema (`Card`, `Table`, `ComparisonPanel`, `EvidencePanel`, etc.).
- **Immutability & Versioning**: Every production Run must identify the exact immutable version of every component used.
- **Blast Radius Analysis**: Disabling any shared model, tool, or policy must compute the downstream impact across all agents, workflows, and applications before approval.
