// Data Classification Levels
export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

// Shared Lifecycle Status
export type LifecycleStatus = 'DRAFT' | 'REVIEW' | 'ACTIVE' | 'DISABLED' | 'DEPRECATED' | 'BLOCKED' | 'RETIRED';

// UI Modes
export type UIMode = 'GENERATED' | 'GENERATED_A2UI' | 'CUSTOM' | 'HYBRID';

// Run Status
export type RunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING'
  | 'WAITING_FOR_HUMAN'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PAUSED';

// Workflow Node Types (17 Minimum Required)
export type WorkflowNodeType =
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

// Model Providers & Types
export type ModelProviderType = 'OPENAI' | 'AZURE_OPENAI' | 'VERTEX_AI' | 'ANTHROPIC' | 'LOCAL_MOCK' | 'CUSTOM';
export type ModelCategory = 'REASONING' | 'CHAT' | 'EMBEDDING' | 'EXTRACTION' | 'CLASSIFICATION' | 'MULTIMODAL' | 'RERANKING';

// Tool Execution Types
export type ToolExecutionType =
  | 'PYTHON_SANDBOX'
  | 'SQL_QUERY'
  | 'REST_API'
  | 'DETERMINISTIC_BINARY'
  | 'INTERNAL_FUNCTION';

// Environments
export type EnvironmentTier = 'DEVELOPMENT' | 'TEST' | 'UAT' | 'PRODUCTION';

// Deployment Target Types
export type DeploymentTargetType = 'AZURE' | 'AWS' | 'VERTEX' | 'KPMG_GCC' | 'PRIVATE_CLOUD' | 'ON_PREM' | 'LOCAL';

// ==========================================
// CANONICAL DOMAIN ENTITIES (25+ Entities)
// ==========================================

export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string;
  owner: string;
  businessUnit: string;
  domain: string;
  branding: {
    logoUrl?: string;
    primaryColor: string;
    accentColor: string;
  };
  uiMode: UIMode;
  permissions: {
    viewers: string[];
    operators: string[];
    admins: string[];
  };
  userGroups: string[];
  useCaseIds: string[];
  lifecycleStatus: LifecycleStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseCase {
  id: string;
  applicationId: string;
  name: string;
  description: string;
  businessPurpose: string;
  owner: string;
  businessUnit: string;
  domain: string;
  inputsSchema: Record<string, unknown>;
  outputsSchema: Record<string, unknown>;
  triggerTypes: string[];
  workflowId: string;
  agentIds: string[];
  orchestratorIds: string[];
  deterministicComponentIds: string[];
  knowledgeSourceIds: string[];
  policyIds: string[];
  evaluationSuiteId?: string;
  deploymentTargetIds: string[];
  dataClassification: DataClassification;
  lifecycleStatus: LifecycleStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  conditionExpression?: string;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  description?: string;
  configuration: Record<string, unknown>;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  dependencies: string[];
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
  timeoutSeconds?: number;
  enabled: boolean;
  version: string;
}

export interface Workflow {
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
  lifecycleStatus: LifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  systemPromptTemplate: string;
  modelId: string;
  frameworkId: string;
  runtimeId: string;
  toolIds: string[];
  mcpServerIds: string[];
  skillIds: string[];
  knowledgeSourceIds: string[];
  policyIds: string[];
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
  permittedDataClassification: DataClassification;
  lifecycleStatus: LifecycleStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface Orchestrator {
  id: string;
  name: string;
  description: string;
  modelId: string;
  frameworkId: string;
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

export interface Model {
  id: string;
  name: string;
  provider: ModelProviderType;
  modelIdentifier: string;
  modelType: ModelCategory;
  endpoint: string;
  contextWindowTokens: number;
  maxOutputTokens: number;
  supportedRegions: string[];
  dataResidencyCertifications: string[];
  securityClassification: DataClassification;
  pricing: {
    currency: string;
    inputPricePer1kTokens: number;
    outputPricePer1kTokens: number;
  };
  lifecycleStatus: LifecycleStatus;
  version: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  executionType: ToolExecutionType;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  endpointUrl?: string;
  isDeterministic: boolean;
  timeoutMs: number;
  costPerInvocation: number;
  permittedClassification: DataClassification;
  lifecycleStatus: LifecycleStatus;
  version: string;
}

export interface MCPServer {
  id: string;
  name: string;
  endpoint: string;
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
  lifecycleStatus: LifecycleStatus;
}

export interface Skill {
  id: string;
  name: string;
  objective: string;
  instructions: string;
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

export interface Policy {
  id: string;
  name: string;
  sourceAuthority: string;
  canonicalDocumentUri: string;
  documentHash: string;
  effectiveDate: string;
  expiryDate?: string;
  jurisdiction: string;
  businessScope: string;
  requirements: string[];
  prohibitions: string[];
  exceptions: string[];
  provenance: {
    approvedBy: string;
    approvalDate: string;
    regulatoryReference: string;
  };
  lifecycleStatus: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
  version: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'DOCUMENT' | 'DATABASE' | 'API' | 'VECTOR_STORE' | 'GRAPH' | 'DATA_LAKE';
  connectorConfig: Record<string, unknown>;
  freshness: string;
  provenance: string;
  accessPolicy: string;
  version: string;
}

export interface MemoryConfig {
  id: string;
  scope: 'RUN' | 'AGENT' | 'USE_CASE' | 'USER' | 'ORGANIZATION';
  storageType: 'IN_MEMORY' | 'SQLITE' | 'REDIS' | 'VECTOR';
  retentionHours: number;
  readPolicy: string;
  writePolicy: string;
  version: string;
}

export interface DeterministicComponent {
  id: string;
  name: string;
  type: 'MATCHING_ENGINE' | 'SQL_CALCULATOR' | 'ETL_PIPELINE' | 'SCHEMA_VALIDATOR' | 'REPORT_GENERATOR';
  runtime: 'NODE_INTERNAL' | 'PYTHON_WORKER' | 'DUCKDB_WASM';
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  throughputRowsPerSec: number;
  version: string;
}

export interface DeploymentTarget {
  id: string;
  name: string;
  type: DeploymentTargetType;
  region: string;
  isSimulated: boolean;
  networkSecurityBoundary: string;
  egressRestrictions: string[];
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export interface Deployment {
  id: string;
  applicationId: string;
  useCaseId?: string;
  environment: EnvironmentTier;
  targetId: string;
  version: string;
  runtimeConfig: Record<string, unknown>;
  scalingConfig: {
    minReplicas: number;
    maxReplicas: number;
  };
  status: 'PENDING' | 'DEPLOYED' | 'FAILED' | 'TERMINATED';
  createdAt: string;
  updatedAt: string;
}

export interface Artifact {
  id: string;
  runId: string;
  name: string;
  type: 'DATASET_CSV' | 'DATASET_JSON' | 'DOCUMENT_PDF' | 'IMAGE_PNG' | 'REPORT_HTML' | 'EVALUATION_SUMMARY';
  locationUri: string;
  contentHash: string;
  byteSize: number;
  dataClassification: DataClassification;
  derivedFromArtifactIds: string[];
  schemaDefinition?: Record<string, unknown>;
  createdAt: string;
}

export interface Run {
  id: string;
  applicationId: string;
  useCaseId: string;
  workflowId: string;
  workflowVersion: string;
  triggerType: 'MANUAL' | 'API' | 'SCHEDULE' | 'EVENT';
  environment: EnvironmentTier;
  deploymentId: string;
  status: RunStatus;
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

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  traceId: string;
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

export interface DependencyEdge {
  id: string;
  sourceType: 'MODEL' | 'TOOL' | 'MCP' | 'POLICY' | 'AGENT' | 'WORKFLOW' | 'USE_CASE';
  sourceId: string;
  targetType: 'AGENT' | 'WORKFLOW' | 'USE_CASE' | 'APPLICATION' | 'DEPLOYMENT';
  targetId: string;
  isCritical: boolean;
}

export interface ApprovalRequest {
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

export interface AuditLog {
  id: string;
  who: string;
  what: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  justification: string;
  environment: EnvironmentTier;
  timestamp: string;
}

// Inter-Entity Protocols
export interface A2AMessageEnvelope {
  protocolVersion: '1.0';
  messageId: string;
  correlationId: string;
  runId: string;
  parentSpanId: string;
  sender: {
    agentId: string;
    agentVersion: string;
    executionPlane: DeploymentTargetType;
  };
  recipient: {
    agentId: string;
    operation: string;
  };
  securityContext: {
    tenantId: string;
    classification: DataClassification;
    callerPrincipal: string;
  };
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface A2AResponseEnvelope {
  messageId: string;
  correlationId: string;
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

export interface A2UIComponent {
  type: 'Card' | 'Table' | 'ComparisonPanel' | 'EvidencePanel' | 'ApprovalPanel' | 'Form' | 'Chart' | 'Timeline' | 'DataGrid';
  id?: string;
  props: Record<string, unknown>;
}

// Continuous Evaluation Entities
export interface GoldenDataset {
  id: string;
  name: string;
  applicationId: string;
  description: string;
  version: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  datasetId: string;
  name: string;
  category: string;
  inputPayload: Record<string, unknown>;
  expectedOutput: Record<string, unknown>;
  assertionRules: Array<{
    field: string;
    operator: 'EXACT_MATCH' | 'NUMERIC_TOLERANCE' | 'CONTAINS' | 'POLICY_CITATION_MATCH';
    expectedValue: unknown;
    tolerance?: number;
  }>;
  dataClassification: DataClassification;
  createdAt: string;
}

export interface EvaluationRun {
  id: string;
  datasetId: string;
  variantName: string;
  targetType: 'AGENT' | 'WORKFLOW' | 'PROMPT';
  targetId: string;
  modelOrVersion: string;
  accuracyScore: number;
  hallucinationRate: number;
  policyAdherenceScore: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  costPer1kRunsUsd: number;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  results: Array<{
    testCaseId: string;
    testCaseName: string;
    passed: boolean;
    actualOutput: Record<string, unknown>;
    errorDetails?: string;
    latencyMs: number;
  }>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface RegressionComparison {
  experimentId: string;
  datasetName: string;
  variantA: {
    name: string;
    model: string;
    accuracy: number;
    hallucinationRate: number;
    policyAdherence: number;
    avgLatencyMs: number;
    costPer1kRuns: number;
  };
  variantB: {
    name: string;
    model: string;
    accuracy: number;
    hallucinationRate: number;
    policyAdherence: number;
    avgLatencyMs: number;
    costPer1kRuns: number;
  };
  recommendation: 'PROCEED_WITH_VARIANT_B' | 'RETAIN_VARIANT_A' | 'INCONCLUSIVE';
  rationale: string;
}

