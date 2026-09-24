# ARC — Enterprise Agentic Application & Runtime Control Platform
# Document 02: Canonical Domain Model & Entity Specifications

---

## 1. Overview

ARC enforces a strict, rich domain model with over 25 first-class entities. Under no circumstances should these concepts be collapsed into a generic "Agent" construct.

All entities possess:
* `id`: Globally unique identifier (`uuidv7` or prefix-based, e.g. `app_01j7...`, `wf_01j7...`).
* `version`: Semantic version string (e.g. `1.2.0`) or monotonic revision integer.
* `createdAt` / `updatedAt`: ISO 8601 UTC timestamps.
* `createdBy` / `updatedBy`: User or service identity.

---

## 2. Core Domain Entities

### 2.1 Application
The business-facing product experience presented to end users.
```typescript
interface Application {
  id: string;
  name: string;
  slug: string; // e.g. "tars", "matching-intel"
  description: string;
  owner: string; // User or group email
  businessUnit: string; // e.g. "Global Tax Advisory"
  domain: string; // e.g. "Financial Audit"
  branding: {
    logoUrl?: string;
    primaryColor: string;
    accentColor: string;
    navigationItems: Array<{
      id: string;
      label: string;
      icon: string;
      route: string;
    }>;
  };
  uiMode: 'GENERATED' | 'GENERATED_A2UI' | 'CUSTOM' | 'HYBRID';
  permissions: {
    viewers: string[];
    operators: string[];
    admins: string[];
  };
  userGroups: string[];
  useCaseIds: string[]; // References UseCases
  entryPoints: Array<{
    type: 'WEB_PORTAL' | 'REST_API' | 'WEBHOOK' | 'SCHEDULE';
    config: Record<string, unknown>;
  }>;
  lifecycleStatus: 'DRAFT' | 'REVIEW' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';
  version: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 UseCase
An executable business capability. A UseCase is NOT a UI or an Agent; it represents a discrete functional domain.
```typescript
interface UseCase {
  id: string;
  applicationId: string;
  name: string;
  description: string;
  businessPurpose: string;
  owner: string;
  businessUnit: string;
  domain: string;
  inputsSchema: Record<string, unknown>; // JSON Schema
  outputsSchema: Record<string, unknown>; // JSON Schema
  triggerTypes: Array<'HUMAN_UI' | 'REST_API' | 'CRON_SCHEDULE' | 'EVENT' | 'A2A'>;
  workflowId: string; // Primary execution workflow
  agentIds: string[]; // Participating agents
  orchestratorIds: string[];
  deterministicComponentIds: string[];
  knowledgeSourceIds: string[];
  policyIds: string[];
  evaluationSuiteId?: string;
  deploymentTargetIds: string[];
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  lifecycleStatus: 'ACTIVE' | 'DISABLED' | 'MAINTENANCE';
  version: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 Workflow
Directed graph coordinating deterministic tasks, agent reasoning, human gates, and transformations.
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  trigger: {
    type: 'MANUAL' | 'API' | 'EVENT' | 'SCHEDULE';
    config: Record<string, unknown>;
  };
  inputsSchema: Record<string, unknown>;
  outputsSchema: Record<string, unknown>;
  errorHandlingPolicy: {
    onFailure: 'HALT' | 'CONTINUE_WITH_ERROR' | 'FALLBACK_NODE';
    fallbackNodeId?: string;
  };
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
    backoffFactor: number;
  };
  timeoutSeconds: number;
  concurrencyLimit: number;
  lifecycleStatus: 'DRAFT' | 'ACTIVE' | 'DISABLED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string; // e.g. "true", "false", "approved", "rejected"
  conditionExpression?: string; // Optional JMESPath or JS expression
}
```

### 2.4 WorkflowNode
Discrete unit of execution in a workflow graph.
```typescript
type WorkflowNodeType =
  | 'START'
  | 'END'
  | 'AGENT'
  | 'ORCHESTRATOR'
  | 'TOOL'
  | 'MCP'
  | 'SKILL'
  | 'DETERMINISTIC_TASK'
  | 'API'
  | 'DATA_TRANSFORM'
  | 'CONDITION'
  | 'LOOP'
  | 'PARALLEL'
  | 'HUMAN_APPROVAL'
  | 'WAIT'
  | 'EVENT'
  | 'SUB_WORKFLOW';

interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  description?: string;
  configuration: Record<string, unknown>;
  inputMapping: Record<string, string>; // Maps workflow state keys to node inputs
  outputMapping: Record<string, string>; // Maps node output keys to workflow state
  dependencies: string[]; // Node IDs required before execution
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
  timeoutSeconds?: number;
  enabled: boolean;
  version: string;
}
```

### 2.5 Agent
Composable reasoning identity referencing shared resources.
```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  systemPromptTemplate: string;
  modelId: string; // References Model
  frameworkId: string; // References Framework (e.g. "adk", "langgraph", "native")
  runtimeId: string; // References Runtime (e.g. "nodejs-v20", "python-3.11")
  toolIds: string[]; // References Tools
  mcpServerIds: string[]; // References MCP Servers
  skillIds: string[]; // References Skills
  knowledgeSourceIds: string[]; // References KnowledgeSources
  policyIds: string[]; // References Policies
  memoryConfig: {
    type: 'NONE' | 'RUN_LOCAL' | 'EPISODIC' | 'USE_CASE_SHARED';
    maxTokens: number;
    retentionDays: number;
  };
  a2aCapabilities: Array<{
    operation: string;
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
  }>;
  a2uiEnabled: boolean;
  permittedDataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  lifecycleStatus: 'ACTIVE' | 'DISABLED' | 'DEPRECATED' | 'BLOCKED' | 'RETIRED';
  version: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2.6 Orchestrator
First-class coordinator capable of dynamic agent delegation, task routing, and synthesis.
```typescript
interface Orchestrator {
  id: string;
  name: string;
  description: string;
  modelId: string;
  routingRules: Array<{
    condition: string;
    targetAgentId: string;
  }>;
  delegationStrategy: 'SEQUENTIAL' | 'PARALLEL' | 'HIERARCHICAL' | 'ADAPTIVE';
  stateAggregationMode: 'APPEND' | 'OVERWRITE' | 'SYNTHESIZE';
  errorHandling: {
    retryAgentAttempts: number;
    fallbackAgentId?: string;
  };
  version: string;
  createdAt: string;
}
```

### 2.7 Model
Registered foundation model with provider abstraction.
```typescript
interface Model {
  id: string;
  name: string;
  provider: 'OPENAI' | 'AZURE_OPENAI' | 'VERTEX_AI' | 'ANTHROPIC' | 'LOCAL_MOCK' | 'CUSTOM';
  modelIdentifier: string; // e.g. "gpt-4o", "gemini-1.5-pro", "claude-3-5-sonnet"
  modelType: 'REASONING' | 'CHAT' | 'EMBEDDING' | 'EXTRACTION' | 'CLASSIFICATION' | 'MULTIMODAL';
  endpoint: string;
  contextWindowTokens: number;
  maxOutputTokens: number;
  supportedRegions: string[];
  dataResidencyCertifications: string[]; // e.g. ["EU_GDPR", "US_HIPAA", "IN_DPDP"]
  securityClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  pricing: {
    currency: string;
    inputPricePer1kTokens: number;
    outputPricePer1kTokens: number;
  };
  lifecycleStatus: 'ACTIVE' | 'DISABLED' | 'DEPRECATED';
  version: string;
}
```

### 2.8 Tool
Mechanistic capability for execution.
```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  executionType: 'PYTHON_SANDBOX' | 'SQL_QUERY' | 'REST_API' | 'DETERMINISTIC_BINARY' | 'INTERNAL_FUNCTION';
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  endpointUrl?: string;
  authConfig?: {
    type: 'NONE' | 'BEARER' | 'API_KEY' | 'MTLS';
    secretKeyRef?: string;
  };
  isDeterministic: boolean;
  timeoutMs: number;
  costPerInvocation: number;
  permittedClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  lifecycleStatus: 'ACTIVE' | 'DISABLED' | 'DEPRECATED';
  version: string;
}
```

### 2.9 MCP (Model Context Protocol)
Registered MCP Server connection.
```typescript
interface MCPServer {
  id: string;
  name: string;
  endpoint: string; // stdio command or SSE/HTTP URL
  transport: 'STDIO' | 'SSE' | 'STREAMABLE_HTTP';
  capabilities: {
    resources: boolean;
    prompts: boolean;
    tools: boolean;
    logging: boolean;
  };
  exposedTools: Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }>;
  exposedResources: Array<{
    uri: string;
    name: string;
    mimeType: string;
  }>;
  healthStatus: 'HEALTHY' | 'UNREACHABLE' | 'DEGRADED';
  version: string;
  lifecycleStatus: 'ACTIVE' | 'DISABLED';
}
```

### 2.10 Skill
Structured procedure definition detailing "HOW" a task should be approached.
```typescript
interface Skill {
  id: string;
  name: string;
  objective: string;
  instructions: string; // Procedural guidelines and reasoning methodology
  recommendedTools: string[];
  requiredTools: string[];
  constraints: string[];
  examples: Array<{
    input: string;
    reasoningTrace: string;
    output: string;
  }>;
  version: string;
}
```

### 2.11 Policy
Authoritative enterprise compliance and governance document.
```typescript
interface Policy {
  id: string;
  name: string;
  sourceAuthority: string; // e.g. "KPMG Global Tax Risk Committee"
  canonicalDocumentUri: string; // Link to verified PDF/Doc
  documentHash: string; // SHA-256 hash of authoritative document
  effectiveDate: string;
  expiryDate?: string;
  jurisdiction: string; // e.g. "India", "EU", "Global"
  businessScope: string; // e.g. "Indirect Tax - Input Tax Credit"
  requirements: string[]; // Must-do constraints
  prohibitions: string[]; // Must-not-do rules
  exceptions: string[]; // Legal exception clauses
  provenance: {
    approvedBy: string;
    approvalDate: string;
    regulatoryReference: string; // e.g. "GST Act Section 16(2)"
  };
  lifecycleStatus: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
  version: string;
}
```

### 2.12 DeterministicComponent
High-throughput, non-probabilistic computation engine.
```typescript
interface DeterministicComponent {
  id: string;
  name: string;
  type: 'MATCHING_ENGINE' | 'SQL_CALCULATOR' | 'ETL_PIPELINE' | 'SCHEMA_VALIDATOR' | 'REPORT_GENERATOR';
  runtime: 'NODE_INTERNAL' | 'PYTHON_WORKER' | 'DUCKDB_WASM';
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  throughputRowsPerSec: number;
  version: string;
}
```

### 2.13 Run, Trace & Artifact
Runtime execution records.
```typescript
interface Run {
  id: string;
  applicationId: string;
  useCaseId: string;
  workflowId: string;
  workflowVersion: string;
  triggerType: 'MANUAL' | 'API' | 'SCHEDULE' | 'EVENT';
  environment: 'DEVELOPMENT' | 'TEST' | 'UAT' | 'PRODUCTION';
  deploymentId: string;
  status: 'QUEUED' | 'RUNNING' | 'WAITING_FOR_HUMAN' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAUSED';
  startTime: string;
  endTime?: string;
  durationMs?: number;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  checkpointState: Record<string, unknown>;
  resumeToken?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costSummaryUsd: {
    modelCost: number;
    computeCost: number;
    totalCost: number;
  };
  error?: {
    nodeId: string;
    category: string;
    message: string;
    stack?: string;
  };
}

interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  traceId: string; // Matches or groups runId
  runId: string;
  componentType: 'WORKFLOW_NODE' | 'AGENT' | 'ORCHESTRATOR' | 'MODEL' | 'TOOL' | 'MCP' | 'A2A' | 'POLICY_CHECK';
  componentId: string;
  componentVersion: string;
  operationName: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'OK' | 'ERROR';
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  costUsd?: number;
  metadata: Record<string, unknown>;
  error?: string;
}

interface Artifact {
  id: string;
  runId: string;
  name: string;
  type: 'DATASET_CSV' | 'DATASET_JSON' | 'DOCUMENT_PDF' | 'IMAGE_PNG' | 'REPORT_HTML' | 'EVALUATION_SUMMARY';
  locationUri: string; // Local storage path or S3/Blob URL
  contentHash: string; // SHA-256
  byteSize: number;
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  derivedFromArtifactIds: string[]; // Lineage links
  schemaDefinition?: Record<string, unknown>;
  createdAt: string;
}
```

### 2.14 Dependency & Approval
Governance and enterprise control.
```typescript
interface DependencyEdge {
  id: string;
  sourceType: 'MODEL' | 'TOOL' | 'MCP' | 'POLICY' | 'AGENT' | 'WORKFLOW' | 'USE_CASE';
  sourceId: string;
  targetType: 'AGENT' | 'WORKFLOW' | 'USE_CASE' | 'APPLICATION' | 'DEPLOYMENT';
  targetId: string;
  isCritical: boolean; // If true, disabling source blocks target
}

interface ApprovalRequest {
  id: string;
  actionType: 'DEPLOY_PRODUCTION' | 'DISABLE_SHARED_TOOL' | 'CHANGE_POLICY' | 'UPDATE_MODEL' | 'WORKFLOW_RESUME';
  targetResourceId: string;
  requestedBy: string;
  reason: string;
  riskAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    affectedEntitiesCount: number;
    details: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedBy?: string;
  reviewComment?: string;
  reviewedAt?: string;
  createdAt: string;
}
```
