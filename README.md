# KEAOS | Enterprise Agent Operating Studio

> **Institutional-grade studio for visually architecting, evaluating, auditing, and exporting enterprise multi-agent systems across industry-standard SDKs.**

---

## 🏛️ Architectural Overview

KEAOS cleanly segregates enterprise agent systems into **10 independent architectural pillars** connected via **strictly-typed sockets** to prevent invalid attachments:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          KEAOS STUDIO WORKSPACE                           │
│  [Visual Canvas]  [Meeting Simulator]  [Evaluation & Gate]  [Export SDK]   │
│  [Audit Ledger]   [Observability]      [Pillars Catalog]                  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│  10 SEPARATED PILLARS │                             │  MULTI-LLM ENGINE     │
│  • Model Provider     │                             │  • Google GenAI       │
│  • Skills (Extractors)│                             │  • Anthropic Claude   │
│  • MCP Servers        │                             │  • OpenAI (GPT-4o)    │
│  • Execution Tools    │◄───────────┐                │  • Ollama (Local)     │
│  • Ingress Gateway    │            │                │  • OpenRouter (200+)  │
│  • Episodic Memory    │            │                └───────────┬───────────┘
│  • Policies & Guards  │            │                            │
│  • Cryptographic Audit│            │                            │
│  • Observability      │            │                            │
│  • Cost & Benefit ROI │            │                            │
└──────────┬────────────┘            │                            │
           │                         │                            │
           ▼                         │                            ▼
┌────────────────────────────────────┴───────────────────────────────────────┐
│                      CORE AGENT ORCHESTRATOR                               │
│       Typed Sockets: model-in, skill-in, mcp-in, tools-in, etc.            │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│ CRYPTOGRAPHIC AUDIT │   │ ALIGNMENT GATEKEEPER│   │ MULTI-SDK EXPORTER  │
│ W3C SHA-256 Hashes  │   │ Golden Benchmarks   │   │ Google ADK, Lang-   │
│ Tamper-Proof Trail  │   │ LLM Judge Scoring   │   │ Graph, AutoGen, etc │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

## 🚀 Key Platform Features

1. **Strictly-Typed Socket Connections**:
   - Canvas nodes enforce type safety (`SOCKET_RULES`).
   - A `memory` block cannot attach to a `model-in` socket. Incompatible drops are blocked with an institutional alert.
2. **Model Agnostic & Zero-Simulation**:
   - Real, live API execution across **Google GenAI**, **Anthropic**, **OpenAI**, **Ollama (local)**, and **OpenRouter**.
   - No mock delays or synthetic text when credentials are provided.
   - Private, air-gapped on-device inference via Ollama (`http://localhost:11434`) with zero API key required.
3. **Multimodal Ingestion Engine**:
   - Ingest MP3/WAV audio recordings with native speech transcription and speaker diarization.
   - Parse raw `.txt`, `.vtt`, `.srt` files or paste text transcripts directly.
4. **W3C Cryptographic Audit Ledger**:
   - Generates real SHA-256 cryptographic hashes over raw inputs and synthesized outputs.
   - Tamper-detection proof records stored in the audit ledger.
5. **Quality Alignment Gate**:
   - Deployment to production is locked until the agent passes the Golden Dataset benchmark suite.
   - Automated LLM-as-a-judge scoring for Faithfulness (≥ 90%) and Action Item Extraction F1 (≥ 85%).
6. **Multi-SDK Code Generation**:
   - Generates production-ready, idiomatic Python code for **Google ADK**, **LangGraph**, **LangChain**, **Microsoft AutoGen**, and **CrewAI**.
7. **Authoritative Design Adherence (`src/design.md`)**:
   - Strict `0px` angular border radius on containers, cards, dialogs, inputs, and buttons.
   - Deep navy `#001E50` header, royal blue `#00338D` primary CTAs, subtle gray `#F5F6F8` surface.
   - Strict brand anonymity: zero mention of any corporate consulting firm or specific company name.

---

## 🛠️ Quickstart & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Installation
```bash
git clone <repo-url>
cd KEAOS
npm install
```

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```
Add any of your real API keys to `.env.local`:
```env
# Google GenAI (Gemini 2.0 Flash / Pro)
VITE_GEMINI_API_KEY=AIzaSy...

# Anthropic Claude (Claude 3.5 Sonnet / Haiku)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI (GPT-4o / Whisper)
VITE_OPENAI_API_KEY=sk-proj-...

# Ollama Local Endpoint (No key required)
VITE_OLLAMA_BASE_URL=http://localhost:11434

# OpenRouter (200+ Models)
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```

> [!TIP]
> You can also configure all keys directly in the browser via the **"Configure LLM APIs"** modal in the header. Credentials are saved in encrypted `localStorage`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📚 Documentation & Guides

For complete specifications and developer instructions:

- **[`AGENTS.md`](./AGENTS.md)**: Universal instructions for AI coding agents and human developers.
- **[`CLAUDE.md`](./CLAUDE.md)**: Instructions specifically tailored for Claude Code CLI.
- **[`.cursorrules`](./.cursorrules)**: Direct rules for Cursor IDE agents.
- **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**: Graph engine, typed sockets, and execution pipeline.
- **[`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md)**: Design tokens and component patterns based on `src/design.md`.
- **[`docs/MULTI_LLM_GUIDE.md`](./docs/MULTI_LLM_GUIDE.md)**: How to configure, invoke, and add new LLM providers.
- **[`docs/USE_CASE_BUILDING_GUIDE.md`](./docs/USE_CASE_BUILDING_GUIDE.md)**: Step-by-step guide to building new use cases.

---

## 🏛️ Project Directory Structure

```
KEAOS/
├── AGENTS.md                  # Universal AI agent instructions
├── CLAUDE.md                  # Claude Code CLI instructions
├── .cursorrules               # Cursor IDE agent instructions
├── .env.example               # Environment variables template
├── docs/                      # Architectural and developer guides
└── src/
    ├── design.md              # AUTHORITATIVE BRAND & DESIGN SPECIFICATION
    ├── constants/
    │   ├── designTokens.js    # Codified JS tokens and Tailwind classes
    │   ├── frameworks.js      # Multi-SDK definitions
    │   ├── goldenDataset.js   # Benchmark evaluation datasets
    │   └── pillars.js         # The 10 pillars and socket rules
    ├── components/
    │   ├── Header.jsx         # Header navigation and API status
    │   ├── Canvas.jsx         # Visual node graph with socket enforcer
    │   ├── Palette.jsx        # Component catalog sidebar
    │   ├── Inspector.jsx      # Multi-LLM model configuration panel
    │   ├── MeetingSimulator.jsx # Multimodal ingestion & simulation
    │   ├── EvaluationView.jsx # Golden dataset alignment gatekeeper
    │   ├── CodeExportView.jsx # Multi-SDK Python exporter
    │   ├── common/
    │   │   └── ScreenScaffold.jsx # Base wrapper for future screens
    │   └── screens/
    │       ├── AuditExplorerView.jsx # Cryptographic audit trail
    │       ├── ObservabilityView.jsx # OpenTelemetry traces & ROI
    │       └── PillarCatalogView.jsx # 10 pillars registry
    └── services/
        └── llmService.js      # Universal Multi-LLM API client
```
