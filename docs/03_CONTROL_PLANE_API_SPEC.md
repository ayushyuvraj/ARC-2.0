# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 03: Control Plane API Specification

---

## 1. Overview & Conventions

The ARC Control Plane exposes an API-first REST and Server-Sent Events (SSE) interface.
* **Base URL:** `/api/v1`
* **Content-Type:** `application/json`
* **Authentication:** Bearer token (JWT with tenant, user ID, and assigned RBAC roles)
* **Response Envelope:**
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": {
      "timestamp": "2026-09-24T22:00:00Z",
      "requestId": "req_01j7abc..."
    }
  }
  ```
* **Error Envelope:**
  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "DEPENDENCY_BLOCKED",
      "message": "Cannot execute workflow: Tool 'tool_tax_engine' is currently DISABLED.",
      "details": { "toolId": "tool_tax_engine", "affectedWorkflowId": "wf_tars_recon" }
    },
    "meta": { ... }
  }
  ```

---

## 2. Applications & Use Cases API

### `GET /api/v1/applications`
Returns all applications accessible to the authenticated user.
* **Query Params:** `status` (`ACTIVE`, `DRAFT`), `domain`, `search`
* **Response (200):** `data: Application[]`

### `POST /api/v1/applications`
Creates a new application container.
* **Body:**
  ```json
  {
    "name": "TARS 2.0",
    "slug": "tars",
    "description": "Enterprise Tax Reconciliation and Advisory",
    "businessUnit": "Global Tax Advisory",
    "domain": "Financial Audit",
    "uiMode": "GENERATED_A2UI",
    "branding": {
      "primaryColor": "#1E3A8A",
      "accentColor": "#3B82F6"
    }
  }
  ```

### `GET /api/v1/applications/:id/dashboard`
Returns the application overview dashboard (Runs summary, active use cases, recent traces, cost, health).

### `GET /api/v1/usecases` & `POST /api/v1/usecases`
Manages discrete business capabilities bound to an application.

---

## 3. Workflows & Visual Graph API

### `GET /api/v1/workflows/:id`
Retrieves the workflow definition including nodes, edges, validation status, and active version.

### `PUT /api/v1/workflows/:id`
Updates workflow nodes, edges, or configuration. Validates the graph topology automatically.
* **Validation Output in Response:**
  ```json
  {
    "validation": {
      "status": "PASS", // "PASS" | "WARNING" | "BLOCKED"
      "issues": []
    }
  }
  ```

### `POST /api/v1/workflows/generate-from-nl`
Natural language workflow generation.
* **Body:**
  ```json
  {
    "description": "Upload GST and Purchase Register datasets, perform high-speed deterministic matching, pass ambiguous cases to Matching Agent, verify ITC admissibility with Tax Policy Agent via A2A, require human sign-off on low confidence items, and output reconciliation PDF."
  }
  ```
* **Response (200):** Returns proposed `Workflow` object with generated nodes and edges for human review and approval.

---

## 4. Run Execution & Runtime Control API

### `POST /api/v1/runs`
Initiates a new execution run.
* **Body:**
  ```json
  {
    "applicationId": "app_tars",
    "useCaseId": "usecase_tax_reconciliation",
    "workflowId": "wf_tars_v2",
    "environment": "DEVELOPMENT",
    "inputs": {
      "gstDatasetArtifactId": "art_gst_invoices_2026",
      "prDatasetArtifactId": "art_pr_records_2026"
    }
  }
  ```
* **Response (201):** Returns created `Run` object with status `QUEUED`.

### `GET /api/v1/runs/:id`
Fetches run status, duration, active node, token usage, cost summary, and resume tokens.

### `GET /api/v1/runs/:id/events` (SSE Stream)
Real-time Server-Sent Events stream emitting node state changes, A2A calls, and execution progress.
* **Events:** `node_started`, `node_completed`, `a2a_call`, `a2ui_surface_ready`, `human_action_required`, `run_completed`, `run_failed`.

### `POST /api/v1/runs/:id/resume`
Resumes a run currently in `WAITING_FOR_HUMAN`.
* **Body:**
  ```json
  {
    "resumeToken": "res_tok_01j7abc...",
    "decision": "APPROVED", // "APPROVED" | "REJECTED" | "MODIFIED"
    "humanComment": "Approved tolerance discrepancy as per Tax Policy v12 exemption clause 4.2",
    "modifications": {}
  }
  ```

### `POST /api/v1/runs/:id/cancel`
Cancels an in-progress or paused run.

---

## 5. Distributed Tracing & Lineage API

### `GET /api/v1/traces/:traceId`
Returns complete hierarchical OpenTelemetry span tree for a given Run.
* **Response (200):** Array of `TraceSpan` objects with parent-child links, durations, token counts, and input/output metadata.

### `GET /api/v1/artifacts/:id/lineage`
Returns the directional lineage DAG for an artifact:
```json
{
  "artifact": { "id": "art_final_recon_report", "name": "Reconciliation_Sept2026.pdf" },
  "upstreamLineage": [
    { "id": "art_approved_exceptions", "name": "exceptions_resolved.json" },
    { "id": "art_deterministic_matches", "name": "exact_matches.json" },
    { "id": "art_raw_gst", "name": "GST_Invoices.csv" },
    { "id": "art_raw_pr", "name": "Purchase_Register.csv" }
  ]
}
```

---

## 6. Shared Component Registries API

### Models Registry
* `GET /api/v1/registries/models` — List registered models.
* `POST /api/v1/registries/models` — Register new model endpoint.
* `PATCH /api/v1/registries/models/:id/status` — Toggle status (`ACTIVE`, `DISABLED`).

### Tools Registry
* `GET /api/v1/registries/tools` — List registered tools.
* `POST /api/v1/registries/tools` — Register new tool (Python, SQL, REST).
* `PATCH /api/v1/registries/tools/:id/status` — Toggle tool status.

### MCP Registry
* `GET /api/v1/registries/mcp` — List MCP servers and exposed tools/resources.
* `POST /api/v1/registries/mcp/ping` — Test connection and discover tools.

### Policy Registry
* `GET /api/v1/registries/policies` — List policies with authority and effective dates.
* `POST /api/v1/registries/policies` — Register new policy document.

---

## 7. Governance, Approvals & Dependencies API

### `POST /api/v1/dependencies/impact-analysis`
Computes the blast radius before altering or disabling a shared resource.
* **Body:**
  ```json
  { "resourceType": "MODEL", "resourceId": "model_gpt4o" }
  ```
* **Response (200):**
  ```json
  {
    "resourceId": "model_gpt4o",
    "impactSummary": "Disabling this model will affect 3 agents, 5 workflows, 2 applications, and 1 production deployment.",
    "affectedAgents": [{ "id": "agent_matching", "name": "Matching Agent" }],
    "affectedWorkflows": [{ "id": "wf_tars_recon", "name": "Tax Reconciliation" }],
    "affectedApplications": [{ "id": "app_tars", "name": "TARS 2.0" }],
    "activeProductionDeployments": [{ "id": "dep_tars_prod", "target": "Azure" }],
    "riskLevel": "CRITICAL",
    "approvalRequired": true
  }
  ```

### `GET /api/v1/governance/approvals` & `POST /api/v1/governance/approvals/:id/review`
List pending approvals and submit sign-off decisions (`APPROVED` or `REJECTED`).
