---
name: arc-harness-engineering
description: Guide for building and operating ARC's execution runtimes and harness layers. Covers the Agent Harness (Agent = Model + Harness), context budgeting, memory scoping, MCP integrations, deterministic matching, and policy enforcement.
---

# ARC Harness Engineering Skill

## Purpose
This skill guides the implementation of the execution scaffolding surrounding foundation models in ARC.

## Core Formula: Agent = Model + Harness
An LLM alone cannot satisfy enterprise requirements. The ARC Agent Harness provides:
1. **Context Window Budgeting**: Dynamic token allocation across system prompts, tool schemas, retrieved knowledge, conversational history, and working scratchpad. Prevents context overflow and context degradation.
2. **Deterministic-First Execution**:
   - Never iterate massive datasets row-by-row through an LLM.
   - Run datasets through deterministic components first (e.g. SQL join, exact hash match).
   - Only ambiguous, anomalous, or exception records pass to the Agent Harness.
3. **Model Context Protocol (MCP)**:
   - ARC connects agents to tools and data through standardized MCP servers.
   - MCP connections expose tools, resources, and prompts dynamically with authentication and health checking.
4. **Authoritative Policy Enforcement**:
   - Enterprise policies are not merely soft system prompt suggestions.
   - ARC Policy engine evaluates inputs and outputs against formal constraints, prohibitions, and applicability rules.
   - Preserves legal provenance, canonical source documents, effective dates, and authority.
5. **Hierarchical Memory**:
   - `RUN`: Scratchpad memory valid only for the active execution run.
   - `AGENT`: Cross-run episodic or operational memory for an agent identity.
   - `USE_CASE`: Business-level memory shared across runs of a specific use case.
   - `ORGANIZATION`: Institutional facts, rules, and global preferences.

## Pluggable Model Providers
All model calls route through `IModelProvider`:
```typescript
interface IModelProvider {
  id: string;
  provider: 'openai' | 'azure' | 'vertex' | 'anthropic' | 'mock';
  chat(request: ChatRequest): Promise<ChatResponse>;
  embed(request: EmbedRequest): Promise<EmbedResponse>;
  calculateCost(tokens: TokenUsage): number;
}
```
For local development where external API keys are absent, the `MockModelProvider` returns realistic structured JSON payloads and tracks realistic simulated token usage.
