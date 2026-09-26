# KEAOS Use Case Building Playbook
*Step-by-step methodology for constructing, testing, and deploying enterprise agent use cases.*

---

## 1. The Use Case Lifecycle

```
Step 1: Make Use Case Modal ───► Select Multi-Agent Framework (Google ADK, LangGraph, etc.)
                                          │
Step 2: Visual Canvas       ───► Attach & Configure 10 Segregated Pillars via Typed Sockets
                                          │
Step 3: Ingestion Simulator ───► Ingest Multimodal Media (Audio, Documents, Text) & Run Traces
                                          │
Step 4: Alignment Gate      ───► Benchmark against Golden Dataset (Faithfulness & Action F1)
                                          │
Step 5: Code Export         ───► Generate & Download Production Python Code for your Framework
```

---

## 2. Step-by-Step Guide

### Step 1: Initialize Use Case
1. Click **"Make Use Case"** in the top navigation bar.
2. Select your target framework from the dropdown:
   - **Google ADK**: Fast multimodal inference, direct Google Cloud integration.
   - **LangGraph**: Stateful cyclic agent graphs with human-in-the-loop checkpoints.
   - **LangChain**: LCEL pipelines and structured output parsers.
   - **Microsoft AutoGen**: Multi-agent conversational debate and round-robin collaboration.
   - **CrewAI**: Role-based agent teams with autonomous task delegation.
3. Choose a template or custom use case name (e.g. *Contract Intelligence Agent*, *Customer Support Escalation*, *Financial Statement Auditor*).
4. Click **"Initialize Agent Architecture"**.

### Step 2: Assemble Pillars on the Canvas
1. Drag or click blocks from the left Component Palette:
   - Connect 1 **Foundation Model** to `model-in`.
   - Connect 1 or more **Skills** to `skill-in`.
   - Connect **MCP Servers** to `mcp-in`.
   - Connect **Execution Tools** to `tools-in`.
   - Attach **Gateway** and **Memory** to their respective sockets.
   - Attach **Policies & Guardrails** to `policies-in`.
2. Select any node to customize its configuration properties in the right **Inspector**.

### Step 3: Run Ingestion & Verify Trace Execution
1. Navigate to the **Meeting Simulator** tab.
2. Upload audio recordings (MP3/WAV), conversation transcripts (.TXT), or paste direct text.
3. Click **"Run Agent Simulation"**.
4. Observe step-by-step progress through each attached pillar:
   - Rate limit check
   - PII masking
   - Memory query
   - Live multi-LLM synthesis
   - W3C SHA-256 cryptographic audit generation
   - Telemetry span logging

### Step 4: Validate Alignment Gate
1. Navigate to the **Evaluation & Gate** tab.
2. Set your minimum governance thresholds:
   - Minimum Faithfulness Score (Default: 90%)
   - Minimum Action Item F1 (Default: 85%)
   - Minimum PII Redaction Rate (Default: 100%)
   - Maximum Latency (Default: 2.0s)
3. Click **"Run Full Benchmark Suite"**.
4. The multi-LLM judge evaluates all test cases against ground truth.
5. If all benchmarks pass, the **"Deploy Agent"** button unlocks in the header.

### Step 5: Export Production Code
1. Navigate to the **Export SDK** tab.
2. Switch between framework tabs (Google ADK, LangGraph, LangChain, AutoGen, CrewAI).
3. The exported Python code automatically mirrors your canvas configuration (attached tools, PII policies, prompt, temperature, model).
4. Click **"Copy Code"** or **"Download .py"**.
