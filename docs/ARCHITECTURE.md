# KEAOS System Architecture & Technical Specification

## 1. High-Level Architecture Overview

KEAOS is structured as a **Reactive Multi-Pillar Agent Studio** built on top of React 18, Vite, Tailwind CSS v4, and `@xyflow/react`.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           KEAOS Studio Workspace                                │
└───────────────┬─────────────────────────────────────────────────┬───────────────┘
                │                                                 │
        ┌───────▼────────┐                                ┌───────▼────────┐
        │ Visual Canvas  │                                │ Ingestion &    │
        │ & Node Graph   │                                │ Execution      │
        └───────┬────────┘                                └───────┬────────┘
                │                                                 │
  ┌─────────────┼─────────────┐                           ┌───────┴────────┐
  │ Typed Socket Enforcer     │                           │ Multi-LLM API  │
  │ • model-in    • skill-in  │                           │ Engine         │
  │ • mcp-in      • tools-in  │                           │ • Google       │
  │ • gateway-in  • memory-in │                           │ • Anthropic    │
  │ • policies-in • audit-in  │                           │ • OpenAI       │
  │ • obs-in      • roi-in    │                           │ • Ollama Local │
  └─────────────┬─────────────┘                           │ • OpenRouter   │
                │                                         └───────┬────────┘
        ┌───────▼────────┐                                        │
        │  Core Agent    ├────────────────────────────────────────┘
        │ Orchestrator   │
        └───────┬────────┘
                │
    ┌───────────┴───────────┬───────────────────────┐
    │                       │                       │
┌───▼────────────────┐ ┌────▼──────────────┐ ┌──────▼──────────────┐
│ Cryptographic SHA  │ │ Alignment Gate    │ │ Multi-SDK Code      │
│ Audit Ledger       │ │ LLM Judge Suite   │ │ Exporter            │
│ (WebCrypto API)    │ │ (Golden Dataset)  │ │ (5 Frameworks)      │
└────────────────────┘ └───────────────────┘ └─────────────────────┘
```

---

## 2. The 10 Segregated Pillars

KEAOS avoids monolithic agent definitions by treating every capability as a distinct, composable pillar block:

1. **Model (`model`)**: Foundation intelligence brain. Configurable with Google, Anthropic, OpenAI, Ollama, or OpenRouter. Socket: `model-in` (Max: 1).
2. **Skills (`skills`)**: Specialized NLP capabilities (Summarizer, Action Item Extractor, Key Decisions). Socket: `skill-in` (Max: Unlimited).
3. **MCP Servers (`mcp`)**: Model Context Protocol integrations (Calendar, Slack, Jira, Database). Socket: `mcp-in` (Max: Unlimited).
4. **Tools (`tools`)**: Execution and ingestion tools (Audio Transcriber, Document Parser, Search). Socket: `tools-in` (Max: Unlimited).
5. **Gateway (`gateway`)**: Ingress traffic controller (Rate Limiters, Token Budget Caps). Socket: `gateway-in` (Max: 1).
6. **Memory (`memory`)**: Long-term episodic memory, vector retrieval, commitment tracking across meetings. Socket: `memory-in` (Max: 1).
7. **Policies (`policies`)**: Pre-execution sanitizers and post-execution guardrails (PII Masking, Salary Redaction). Socket: `policies-in` (Max: Unlimited).
8. **Audit (`audit`)**: Cryptographic SHA-256 ledger recording raw inputs, outputs, and timestamps. Socket: `audit-in` (Max: 1).
9. **Observability (`observability`)**: OpenTelemetry span collectors, latency waterfall trackers, token accounting. Socket: `observability-in` (Max: 1).
10. **Cost & Benefit (`cost-benefit`)**: ROI calculator balancing API compute costs against human labor hours saved. Socket: `cost-benefit-in` (Max: 1).

---

## 3. Strict Typed Socket Enforcement (`src/components/Canvas.jsx`)

Connections are validated inside `Canvas.jsx` via the `isValidConnection` callback:
```javascript
const isValidConnection = (connection) => {
  const { source, target, targetHandle } = connection;
  const sourceNode = nodes.find(n => n.id === source);
  const targetNode = nodes.find(n => n.id === target);

  if (targetNode.type === 'agentCore') {
    const requiredPillar = SOCKET_RULES[targetHandle];
    const sourcePillar = sourceNode.data.pillarType;
    return requiredPillar === sourcePillar;
  }
  return false;
};
```
If a user attempts an invalid drop (e.g. connecting a Memory block to a Tool handle), the connection is rejected and an alert banner is displayed.

---

## 4. Multi-LLM Execution Pipeline (`src/services/llmService.js`)

When a meeting is simulated or evaluated:
1. **Ingress Gate**: Checks rate limits and budget caps.
2. **Policy Sanitization**: PII policies scan the transcript for financial compensation or sensitive entities.
3. **Memory Retrieval**: Historical commitments or past action items are loaded into context.
4. **Universal LLM Dispatch**: Calls `synthesizeMeetingUniversal` which dynamically executes against:
   - Google GenAI (via `@google/genai`)
   - Anthropic (via direct browser fetch with `anthropic-dangerous-direct-browser-access`)
   - OpenAI (via chat completions with `response_format: { type: "json_object" }`)
   - Ollama (via local endpoint `http://localhost:11434`)
   - OpenRouter (via openrouter.ai gateway)
5. **Cryptographic Fingerprint**: Generates a real SHA-256 hash using the browser's `crypto.subtle.digest('SHA-256', buffer)`.
6. **Telemetry & Audit**: Logs duration, token counts, and step results into the execution ledger.

---

## 5. Deployment Gatekeeper (`src/components/EvaluationView.jsx`)

Agents cannot be deployed to production arbitrarily. Deployment is protected by the **Alignment Gatekeeper**:
- The agent must be evaluated against ground-truth golden datasets.
- A live LLM judge evaluates **Faithfulness Score** (≥ 90%) and **Action Item Extraction F1** (≥ 85%).
- Only when all benchmarks pass does the "Deploy Agent" button unlock.
