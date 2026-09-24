# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 09: Sample Applications & TARS 2.0 Acceptance Specification

---

## 1. Architectural Role of Sample Applications

ARC is designed as a **universal enterprise agentic platform**. Under no circumstances should ARC core platform logic be hardcoded to a single domain.

To prove the platform's generality, ARC includes three diverse pre-configured sample applications:
1. **TARS 2.0:** Tax Reconciliation and Advisory (Financial audit, deterministic matching, A2A policy evaluation, A2UI human review).
2. **Matching Intelligence:** Enterprise Cross-System Record Matching (Customer deduplication, multi-source master data reconciliation).
3. **PPT Preparation:** Automated Executive Presentation Preparation (Document ingestion, narrative structuring, slide deck synthesis).

---

## 2. Reference Application 1: TARS 2.0 (Tax Reconciliation)

TARS 2.0 serves as the primary benchmark application. It automates reconciliation between government tax portal records (e.g. GST GSTR-2B) and corporate internal accounting ledgers (ERP Purchase Register).

### 2.1 Workflow Topology
```
           [Upload GST & Purchase Register Datasets]
                              │
                              ▼
           [Step 1: Schema Validation & Normalization] (Deterministic Task)
                              │
                              ▼
           [Step 2: High-Speed Exact Matcher (85%+)]  (Deterministic Tool)
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
    [Exact Matches]                 [Ambiguous Discrepancies]
  (Auto-Reconciled)                             │
                                                ▼
                                    [Step 3: Matching Agent] (Azure)
                                                │
                                                ▼ (A2A Call)
                                    [Step 4: Tax Policy Agent] (Vertex)
                                                │
                                                ▼
                                    [Step 5: A2UI ComparisonPanel]
                                                │
                                                ▼
                                    [Step 6: Human Tax Review Gate]
                                                │
                                                ▼
                                    [Step 7: Final Audit Report PDF] (Deterministic Tool)
```

### 2.2 Realistic Synthetic Data Profiles
The dataset includes 6 distinct test categories:
1. **Exact Matches (70%):** Identical GSTIN, Invoice Number, Date, and Taxable Amount.
2. **Tolerance Differences (10%):** Exact match except for minor decimal rounding under $1.00 (permissible under policy).
3. **Punctuation & Formatting Differences (5%):** E.g. `INV/2026/098` vs `INV-2026-098` (resolved via Matching Agent).
4. **Timing Differences (5%):** Invoice issued on Aug 30, recorded in PR on Sept 2 (resolved via A2A Tax Policy check).
5. **Ambiguous 1-to-Many Matches (5%):** Multiple candidate purchase orders for a single supplier invoice (requires human review).
6. **One-Sided Records (5%):** Records appearing in GST portal but missing in ERP, or vice versa.

### 2.3 Participating Agents & Execution Planes
* **TARS Orchestrator:** Simulated KPMG GCC execution plane.
* **Matching Agent:** Simulated Azure execution plane (using OpenAI GPT-4o adapter).
* **Tax Policy Agent:** Simulated Google Cloud Vertex AI execution plane (using Gemini Pro adapter).
* **Deterministic Matcher & Report Compiler:** Local high-speed execution worker.

---

## 3. Reference Application 2: Matching Intelligence

A generic multi-source master data reconciliation platform:
* **Inputs:** Two arbitrary tabular datasets (e.g. CRM contacts vs Billing accounts).
* **Workflow:** Ingestion $\to$ Column Semantic Mapping Agent $\to$ Deterministic Join $\to$ Fuzzy Matching Agent $\to$ Confidence Scoring $\to$ Master Golden Record Export.

---

## 4. Reference Application 3: PPT Preparation

An executive presentation synthesis platform:
* **Inputs:** Raw corporate earnings reports, PDF filings, or quarterly performance memos.
* **Workflow:** Document Parsing Tool $\to$ Financial Extraction Agent $\to$ Narrative Outline Agent $\to$ Slide Content Synthesizer $\to$ Slide Template Compiler (Deterministic) $\to$ Human Deck Review $\to$ Final PPTX Artifact.

---

## 5. The Complete 29-Step Acceptance Test Procedure (Section 75)

This 29-step test serves as the formal acceptance test for the ARC platform.

```
Step 01: Log into the ARC Control Plane Portal.
Step 02: Open the global "Applications" catalog.
Step 03: Select "TARS 2.0" from the list of authorized enterprise applications.
Step 04: View the dedicated TARS application interface (/apps/tars).
Step 05: Click "New Tax Reconciliation Run".
Step 06: Upload the synthetic GST Invoices and Purchase Register CSV/JSON datasets.
Step 07: Click "Start Reconciliation Workflow".
Step 08: Observe the live visual workflow graph rendering real-time execution state.
Step 09: Verify Deterministic Matcher completes in milliseconds, resolving 85%+ of records without LLM cost.
Step 10: Watch the Matching Agent activate to evaluate remaining ambiguous records.
Step 11: Observe the A2A call dispatched from Matching Agent to Tax Policy Agent.
Step 12: Verify the Tax Policy Agent returns structured admissibility findings with statutory clause citations.
Step 13: Observe the A2UI ComparisonPanel dynamically rendered in the UI with side-by-side discrepancy highlights.
Step 14: As a human reviewer, inspect the discrepancy evidence, enter an approval remark, and click "Approve".
Step 15: Verify the workflow successfully resumes from its checkpoint state.
Step 16: Verify the final reconciliation summary report artifact (PDF/JSON) is generated.
Step 17: Open the completed Run view.
Step 18: Inspect the complete hierarchical OpenTelemetry Trace waterfall spanning all nodes, agents, models, and A2A calls.
Step 19: Inspect the visual Artifact Lineage DAG tracing the final report back to the raw uploaded invoice files.
Step 20: Inspect the version snapshot, verifying exact immutable versions of models, tools, MCPs, and policies used.
Step 21: Verify granular cost accounting (total cost, cost per matched transaction, model token consumption).
Step 22: View the automated continuous evaluation score calculated for the run.
Step 23: Open the Dependency Graph tab to view all platform resources supporting TARS.
Step 24: Open the Application Deployment view.
Step 25: Verify the multi-cloud topology map showing Orchestrator (GCC), Matching Agent (Azure), and Tax Policy Agent (Vertex).
Step 26: Navigate to Tool Registry, select a shared tool, and toggle its status to "DISABLED" in a test environment.
Step 27: Verify ARC immediately calculates and displays the downstream impact alert ("Disabling this tool impacts 3 agents, 5 workflows, 2 applications").
Step 28: Re-enable the shared tool.
Step 29: Re-execute the reconciliation workflow to prove total platform stability and resilience.
```
