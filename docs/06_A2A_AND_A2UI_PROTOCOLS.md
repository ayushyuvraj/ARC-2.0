# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 06: A2A (Agent-to-Agent) & A2UI (Agent-to-UI) Protocols

---

## 1. A2A (Agent-to-Agent) Communication Protocol

ARC provides a unified, location-transparent protocol for inter-agent communication across different runtimes, networks, and cloud execution planes.

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│        MATCHING AGENT           │                 │        TAX POLICY AGENT         │
│   (Running in Azure Cloud)      │                 │     (Running in Vertex AI)      │
└────────────────┬────────────────┘                 └────────────────┬────────────────┘
                 │                                                   ▲
                 │ 1. Dispatches A2A Request Envelope                │
                 ▼                                                   │
  ┌─────────────────────────────────────────────────────────────┐    │
  │                     A2A DISPATCH FABRIC                     │────┘
  │  • Resolves Endpoint & Target Runtime via Agent Registry    │
  │  • Enforces Data Classification & Tenant Isolation         │
  │  • Injects OpenTelemetry Parent Span ID                     │
  │  • Records Latency, Tokens, and Cost in Central Trace       │
  └─────────────────────────────────────────────────────────────┘
```

### 1.1 The A2A Message Envelope Specification
```typescript
interface A2AMessageEnvelope {
  protocolVersion: '1.0';
  messageId: string; // uuidv7
  correlationId: string;
  runId: string;
  parentSpanId: string;
  
  sender: {
    agentId: string;
    agentVersion: string;
    executionPlane: 'AZURE' | 'VERTEX' | 'GCC' | 'ON_PREM' | 'LOCAL';
  };
  
  recipient: {
    agentId: string;
    operation: string; // Capability being invoked, e.g. "evaluate_itc_admissibility"
  };
  
  securityContext: {
    tenantId: string;
    classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    callerPrincipal: string;
  };
  
  payload: Record<string, unknown>;
  timestamp: string; // ISO 8601 UTC
}
```

### 1.2 A2A Response Envelope
```typescript
interface A2AResponseEnvelope {
  messageId: string;
  correlationId: string; // Matches request messageId
  status: 'SUCCESS' | 'REJECTED' | 'ERROR';
  
  executionMetadata: {
    latencyMs: number;
    tokensUsed: { prompt: number; completion: number; total: number };
    costUsd: number;
    executionPlane: string;
  };
  
  result: Record<string, unknown>;
  policyEvaluations?: Array<{
    policyId: string;
    compliant: boolean;
    citation: string;
  }>;
  
  error?: {
    code: string;
    message: string;
  };
}
```

### 1.3 Distributed Trace Interception
Every A2A transaction automatically generates a child trace span in the primary workflow trace:
- Parent: `MatchingAgent:AnalyzeDiscrepancy`
- Child Span: `A2A:TaxPolicyAgent:EvaluateITC`
This ensures full visibility into cross-cloud agent latency, token expenditure, and data handoffs.

---

## 2. A2UI (Agent-to-User Interface) System

In complex enterprise workflows, text-only chat responses are inadequate. When an agent detects an ambiguity or requires human oversight, it must be able to request a rich, interactive UI surface.

### 2.1 The Cardinal Security Rule
$$\textbf{Agents CANNOT inject arbitrary HTML, JSX, or executable JavaScript.}$$

Agents are strictly restricted to producing structured JSON payloads that conform to ARC's **Controlled Component Vocabulary**. The ARC frontend validates the JSON against schemas and renders approved, secure React components.

---

## 3. The Controlled Component Vocabulary

The frontend A2UI engine recognizes and renders the following component types:

### 3.1 `Card`
Standard metric, status, or summary card.
```json
{
  "type": "Card",
  "props": {
    "title": "GST Inward Tax Credit Summary",
    "status": "WARNING",
    "metrics": [
      { "label": "Matched Value", "value": "$1,452,900" },
      { "label": "Ambiguous Value", "value": "$42,300" }
    ]
  }
}
```

### 3.2 `ComparisonPanel` (Critical for Reconciliation)
Side-by-side comparison of records with discrepancy highlighting.
```json
{
  "type": "ComparisonPanel",
  "props": {
    "title": "Vendor Invoice Ambiguity Review",
    "leftEntity": {
      "title": "GST Portal Record (GSTR-2B)",
      "fields": {
        "Supplier GSTIN": "27AAACG0564K1Z2",
        "Invoice No": "INV-2026-0984",
        "Date": "2026-08-28",
        "Taxable Amount": "$24,500.00",
        "IGST": "$4,410.00"
      }
    },
    "rightEntity": {
      "title": "Purchase Register (ERP SAP)",
      "fields": {
        "Supplier GSTIN": "27AAACG0564K1Z2",
        "Invoice No": "INV/2026/984",
        "Date": "2026-08-30",
        "Taxable Amount": "$24,500.00",
        "IGST": "$4,410.00"
      }
    },
    "discrepancies": [
      { "field": "Invoice No", "reason": "Punctuation difference (/ vs -)" },
      { "field": "Date", "reason": "2-day timing difference" }
    ]
  }
}
```

### 3.3 `EvidencePanel`
Displays legal clauses, policy citations, and source snippets.
```json
{
  "type": "EvidencePanel",
  "props": {
    "title": "Policy Admissibility Evidence",
    "policyName": "KPMG Tax Guidelines v12 - Section 16(2)",
    "recommendation": "PERMISSIBLE_WITH_AUDIT_NOTE",
    "confidenceScore": 0.94,
    "clauses": [
      {
        "clauseId": "SEC_16_2_TIMING",
        "text": "Invoice date discrepancy under 30 days is acceptable provided supplier has filed return in GSTR-1."
      }
    ]
  }
}
```

### 3.4 `ApprovalPanel`
Structured human decision controls.
```json
{
  "type": "ApprovalPanel",
  "props": {
    "actions": [
      { "id": "APPROVE", "label": "Approve Reconciliation", "variant": "PRIMARY" },
      { "id": "REJECT", "label": "Reject Claim", "variant": "DANGER" },
      { "id": "REQUEST_DOCS", "label": "Request Supporting Docs", "variant": "SECONDARY" }
    ],
    "requireComment": true,
    "resumeToken": "res_tok_01j7abc..."
  }
}
```

### 3.5 Additional Vocabulary Components
* `Table` / `DataGrid`: Sortable, filterable tabular data.
* `Chart`: Bar, line, donut, and distribution graphs.
* `Timeline`: Sequential audit steps.
* `Form`: Form fields with validation constraints.

---

## 4. End-to-End A2UI Rendering Lifecycle

```
1. Agent detects ambiguity in Tax Reconciliation
   │
   ▼
2. Agent emits A2UI JSON surface payload
   │
   ▼
3. ARC Control Plane validates payload against Zod A2UI Schema
   │ (Rejects if invalid component or unauthorized attributes)
   ▼
4. Control Plane attaches A2UI surface to Run state
   │
   ▼
5. Web Portal dynamically mounts <A2UIRenderer surface={surface} />
   │
   ▼
6. Human reviews ComparisonPanel + EvidencePanel, selects "Approve"
   │
   ▼
7. Frontend emits POST /api/v1/runs/:id/resume with decision & token
   │
   ▼
8. Run Engine resumes workflow execution down the approved branch
```
