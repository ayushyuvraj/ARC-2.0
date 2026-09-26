# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 05: Harness Engineering & Execution Runtimes

---

## 1. The Core Equation: Agent = Model + Harness

Foundation models provide generalized probabilistic reasoning, but enterprise execution requires deterministic boundaries, predictable latency, policy adherence, and tool grounding.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ARC AGENT HARNESS                               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    CONTEXT WINDOW BUDGETING ENGINE                     │  │
│  │  System Prompt (15%) │ Retrieved Docs (35%) │ Scratchpad/History (50%) │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────┐        ▼        ┌──────────────────────────┐  │
│  │   HIERARCHICAL MEMORY    │ ───► MODEL ◄─── │   POLICY VERIFICATION    │  │
│  │  (Run / Agent / Org)     │   (LLM Brain)   │   (Rules, Prohibitions)  │  │
│  └──────────────────────────┘        │        └──────────────────────────┘  │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     EXECUTION & TOOLING HARNESS                       │  │
│  │   MCP Client  •  Deterministic Sandboxes  •  A2A Dispatcher  •  A2UI  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

The **Harness** surrounds the model with five operational layers:
1. **Context Window Budgeting**: Dynamic token slicing preventing overflow and reasoning degradation.
2. **Hierarchical Memory**: Scoped state persistence across runs, agents, and organizations.
3. **Tool & MCP Execution**: Sandboxed execution of deterministic algorithms, Python scripts, and MCP resources.
4. **Policy Verification**: Real-time validation against institutional guidelines and regulatory constraints.
5. **Observability & Accounting**: Fine-grained capture of every prompt token, completion token, latency millisecond, and dollar cost.

---

## 2. Context Window Budgeting Engine

To prevent catastrophic degradation when context windows become saturated, the ARC Agent Harness calculates a strict token budget before every model invocation:

$$\text{Budget}_{\text{Total}} = \text{Model}_{\text{ContextMax}} - \text{Margin}_{\text{Safety}}$$

Tokens are partitioned as follows:
* **System Persona & Skill Directives:** 15% of budget.
* **Institutional Policies & Constraints:** 15% of budget.
* **Retrieved Knowledge & RAG Grounding:** 30% of budget.
* **Conversational History & Memory:** 20% of budget (compacted using semantic summarization if exceeded).
* **Working Scratchpad & Output Reservation:** 20% reserved for model generation.

If inputs exceed the budget, the Harness performs **lossless compaction** (trimming oldest non-essential spans) followed by **semantic summarization**, rather than abrupt truncation.

---

## 3. Pluggable Model Provider Abstraction

ARC abstracts all foundation models behind `IModelProvider`:
```typescript
interface IModelProvider {
  id: string;
  providerType: 'OPENAI' | 'AZURE' | 'VERTEX' | 'ANTHROPIC' | 'LOCAL_MOCK';
  
  generateChatCompletion(request: ModelChatRequest): Promise<ModelChatResponse>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  calculateCost(tokens: { prompt: number; completion: number }): number;
}
```

### Mock Provider for Local Development
When cloud API keys are not supplied, ARC boots the `MockModelProvider`.
* Returns realistic, structured JSON reasoning traces matching the exact domain context (e.g. tax matching calculations, GST reconciliation decisions).
* Calculates realistic simulated token counts and latency profiles.
* Emits UI banners indicating: `SIMULATED EXECUTION PLANE: MockModelProvider Active`.

---

## 4. Deterministic-First Execution Strategy

A primary failure mode of enterprise AI is sending large raw datasets through LLMs. ARC enforces a **Deterministic-First** architecture:

```
Raw Invoices (10,000 Records)
       │
       ▼
┌─────────────────────────────────┐
│ DETERMINISTIC MATCHING ENGINE   │ (High-throughput in-memory DuckDB / SQL)
│ Exact GSTIN + InvoiceNo + Total │
└────────────────┬────────────────┘
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
8,500 Records         1,500 Records
Exact Matches         Ambiguous / Exceptions
(Zero LLM Cost)             │
                            ▼
               ┌───────────────────────────┐
               │    ARC AGENT HARNESS      │
               │ (Fuzzy, Tolerance, Policy)│
               └───────────────────────────┘
```

1. **Phase 1 — Deterministic Filter:** The `DeterministicMatcher` executes rules-based matching in milliseconds. Over 85% of records are matched with zero hallucination risk and zero token cost.
2. **Phase 2 — Agent Reasoning:** Only ambiguous records (e.g. minor decimal rounding, vendor name typos, invoice date discrepancies) are routed to the Agent Harness.

---

## 5. Model Context Protocol (MCP) Integration

ARC supports the open Model Context Protocol (MCP) as a first-class integration layer:
* **MCP Client:** The ARC runtime connects to local (stdio) or remote (SSE / HTTP) MCP servers.
* **Dynamic Tool Discovery:** When an agent references an MCP server, the harness queries the server's tools and resources, converts their schemas into the target model's function-calling format, and binds them to the execution context.
* **Health & Circuit Breaking:** If an MCP server fails health checks, the harness automatically marks the MCP connection as `DEGRADED`, warning dependent agents or failing over to fallback tools.

---

## 6. Hierarchical Memory Architecture

ARC manages 5 discrete memory tiers:
1. **Run Memory (`RUN`):** Ephemeral in-memory key-value scratchpad cleared upon workflow completion.
2. **Agent Memory (`AGENT`):** Persistent state retained across runs of the same agent identity (e.g. learned prompt adjustments, vendor-specific matching tendencies).
3. **Use Case Memory (`USE_CASE`):** Domain-specific cache shared across all agents and runs within a Use Case (e.g. monthly reconciliation balances).
4. **User Memory (`USER`):** Preferences and human approval history associated with a specific corporate user.
5. **Organization Memory (`ORGANIZATION`):** Global institutional facts, enterprise policies, and corporate chart of accounts.

---

## 7. Institutional Policy Enforcement Engine

Enterprise policies in ARC are not casual system prompt suggestions; they are legally binding compliance rules.
* **Provenance Verification:** Every policy records its approving authority (e.g. "KPMG Tax Risk Committee"), canonical document SHA-256 hash, and legal jurisdiction.
* **Two-Stage Enforcement:**
  1. **Pre-Invocation Injection:** The relevant policy requirements, prohibitions, and exception clauses are dynamically injected into the agent's context budget.
  2. **Post-Invocation Verification:** The agent's structured response is parsed by a deterministic policy validator to ensure no prohibited actions or out-of-scope recommendations are emitted. If a violation is detected, the run is flagged for audit and diverted to human review.
