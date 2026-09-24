---
name: arc-tars-reference
description: Guide for the TARS 2.0 Tax Reconciliation reference application and execution of the complete 29-step platform acceptance demonstration test.
---

# ARC TARS 2.0 Reference Application Skill

## Purpose
This skill specifies the reference enterprise application—TARS 2.0 (Tax Reconciliation)—which validates all ARC platform capabilities without violating the rule of generic separation.

## Application Architecture
- **Application ID:** `app_tars_v2`
- **Name:** TARS 2.0 — Enterprise Tax Reconciliation
- **Business Unit:** Global Indirect Tax & Advisory
- **Domain:** Taxation & Financial Audit
- **UI Mode:** `GENERATED_A2UI` (Portal shell with dynamic agent generative surfaces)

## Participating Agents & Components
1. **TARS Orchestrator** (Deployed on KPMG GCC simulation): Coordinates end-to-end reconciliation lifecycle.
2. **Ingestion & Normalizer Task** (Deterministic Component): High-speed CSV/JSON parsing, schema validation, and date/amount normalization.
3. **Deterministic Matcher Engine** (Deterministic Tool): Processes 85%+ of records using rule-based exact GSTIN, invoice number, and tax amount equality.
4. **Matching Agent** (Deployed on Azure simulation): Examines ambiguous unmatched records, fuzzy invoice numbering, and timing differences.
5. **Tax Policy Agent** (Deployed on Vertex simulation): Authoritative reasoning agent evaluating admissibility of input tax credits under institutional tax guidelines.
6. **Exception & Review Agent** (A2UI Producer): Formulates interactive `ComparisonPanel` and `EvidencePanel` for human tax review.
7. **Report Generator** (Deterministic Tool): Compiles approved reconciliations into structured audit artifact.

## The 29-Step Platform Acceptance Test (Section 75)
1. User logs into ARC Portal.
2. Navigates to **Applications** catalog.
3. Selects **TARS 2.0**.
4. Enters TARS Application Experience (`/apps/tars`).
5. Selects **Tax Reconciliation** use case.
6. Uploads synthetic GST Invoices and Purchase Register datasets.
7. Initiates workflow execution.
8. Observes live visual workflow execution graph.
9. Watches deterministic matching complete instantly (resolving exact matches).
10. Watches Matching Agent pick up ambiguous candidates.
11. Observes A2A call from Matching Agent to Tax Policy Agent.
12. Observes Tax Policy Agent return structured reasoning and citation.
13. Sees A2UI dynamically render the Ambiguity Review `ComparisonPanel`.
14. Human tax auditor reviews discrepancies, inputs commentary, and clicks `Approve`.
15. Workflow seamlessly resumes from checkpoint.
16. Observes final reconciliation report artifact generated.
17. Opens the Run detail page.
18. Inspects complete distributed Trace waterfall (nodes, agents, model calls, A2A spans).
19. Inspects visual Artifact Lineage DAG (from raw upload to final audit report).
20. Verifies exact version immutability across all participating agents, models, and policies.
21. Evaluates cost, latency, and token consumption metrics.
22. Views continuous evaluation score for the run.
23. Inspects real-time dependency graph for TARS.
24. Navigates to Deployment Topology view.
25. Observes multi-cloud distribution (Orchestrator in GCC, Matching in Azure, Tax Policy in Vertex).
26. Disables a shared Tool in the Tool Registry within a test environment.
27. Observes ARC calculate and display downstream impact alert across all dependent workflows.
28. Re-enables the shared Tool.
29. Re-runs the workflow to confirm full operational integrity.
