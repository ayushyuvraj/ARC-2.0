---
name: arc-a2a-a2ui
description: Guide for implementing Agent-to-Agent (A2A) inter-agent communication and Agent-to-User Interface (A2UI) generative component rendering in ARC.
---

# ARC A2A & A2UI Protocol Skill

## Purpose
This skill governs the two foundational inter-entity protocols of ARC: A2A (how agents communicate with other agents) and A2UI (how agents dynamically generate rich, secure UI surfaces for human users).

## 1. A2A (Agent to Agent) Protocol
Agents may reside on different runtimes, networks, clouds, or execution planes. ARC provides a location-transparent discovery and messaging layer.

### A2A Envelope Specification
```typescript
interface A2ARequestEnvelope {
  requestId: string;
  sourceAgentId: string;
  targetAgentId: string;
  runId: string;
  parentSpanId: string;
  operation: string;
  payload: Record<string, unknown>;
  securityContext: {
    tenantId: string;
    classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    callerIdentity: string;
  };
  timestamp: string;
}
```

### Trace Interception
- Every A2A dispatch generates an OpenTelemetry span linked to the caller's trace context.
- Records: caller, callee, latency, status, policy evaluation, cost, and token usage.
- Sensitive payloads are sanitized according to security classification before appearing in UI trace logs.

## 2. A2UI (Agent to User Interface) System
ARC empowers agents to dynamically request task-specific UI experiences without allowing arbitrary JavaScript/HTML injection.

### Security Invariant
Agents **NEVER** return raw HTML, JSX, or executable code. Agents return structured JSON payloads strictly conforming to the `A2UIComponent` schema.

### Controlled Component Vocabulary
Only approved components are rendered by the frontend engine:
- `Card`: Container with title, badge, description, and status.
- `Table`: Typed tabular data with column definitions, formatting, sorting.
- `ComparisonPanel`: Side-by-side discrepancy review (e.g. GST vs Purchase Register).
- `EvidencePanel`: Citation, source document snippets, and policy clause references.
- `ApprovalPanel`: Structured action buttons (`Approve`, `Reject`, `Request Changes`) with commentary input.
- `Form`: Typed input fields with validation rules.
- `Chart`: Bar, line, donut, and distribution charts.
- `Timeline`: Chronological sequence of events or audit steps.
- `DataGrid`: Advanced filtering, pagination, and multi-row selection.

### Validation & Rendering Flow
1. Agent produces an A2UI JSON payload.
2. ARC Control Plane validates the payload against Zod / JSON Schema.
3. Frontend A2UI Surface Renderer dynamically maps valid component nodes to native React components.
4. Human actions (clicks, approvals, inputs) emit typed events back to the ARC Run Engine.
