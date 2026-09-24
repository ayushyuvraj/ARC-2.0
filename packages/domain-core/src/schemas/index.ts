import { z } from 'zod';

export const DataClassificationSchema = z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']);
export const LifecycleStatusSchema = z.enum(['DRAFT', 'REVIEW', 'ACTIVE', 'DISABLED', 'DEPRECATED', 'BLOCKED', 'RETIRED']);
export const UIModeSchema = z.enum(['GENERATED', 'GENERATED_A2UI', 'CUSTOM', 'HYBRID']);
export const RunStatusSchema = z.enum([
  'QUEUED',
  'RUNNING',
  'WAITING',
  'WAITING_FOR_HUMAN',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'PAUSED'
]);

export const WorkflowNodeTypeSchema = z.enum([
  'START',
  'END',
  'AGENT',
  'ORCHESTRATOR',
  'TOOL',
  'MCP',
  'SKILL',
  'DETERMINISTIC_TASK',
  'API',
  'DATA_TRANSFORM',
  'CONDITION',
  'LOOP',
  'PARALLEL',
  'HUMAN_APPROVAL',
  'WAIT',
  'EVENT',
  'SUB_WORKFLOW'
]);

export const ModelProviderTypeSchema = z.enum(['OPENAI', 'AZURE_OPENAI', 'VERTEX_AI', 'ANTHROPIC', 'LOCAL_MOCK', 'CUSTOM']);
export const ModelCategorySchema = z.enum(['REASONING', 'CHAT', 'EMBEDDING', 'EXTRACTION', 'CLASSIFICATION', 'MULTIMODAL', 'RERANKING']);
export const ToolExecutionTypeSchema = z.enum(['PYTHON_SANDBOX', 'SQL_QUERY', 'REST_API', 'DETERMINISTIC_BINARY', 'INTERNAL_FUNCTION']);

export const CreateApplicationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().default(''),
  owner: z.string().default('admin@arc.local'),
  businessUnit: z.string().default('Enterprise AI'),
  domain: z.string().default('General'),
  branding: z.object({
    logoUrl: z.string().optional(),
    primaryColor: z.string().default('#1E3A8A'),
    accentColor: z.string().default('#3B82F6')
  }).default({ primaryColor: '#1E3A8A', accentColor: '#3B82F6' }),
  uiMode: UIModeSchema.default('GENERATED_A2UI')
});

export const CreateModelSchema = z.object({
  name: z.string().min(2),
  provider: ModelProviderTypeSchema,
  modelIdentifier: z.string().min(2),
  modelType: ModelCategorySchema.default('CHAT'),
  endpoint: z.string().default('https://api.arc.local/v1/models'),
  contextWindowTokens: z.number().int().positive().default(128000),
  maxOutputTokens: z.number().int().positive().default(4096),
  securityClassification: DataClassificationSchema.default('CONFIDENTIAL'),
  pricing: z.object({
    currency: z.string().default('USD'),
    inputPricePer1kTokens: z.number().default(0.005),
    outputPricePer1kTokens: z.number().default(0.015)
  }).default({ currency: 'USD', inputPricePer1kTokens: 0.005, outputPricePer1kTokens: 0.015 })
});

export const CreateToolSchema = z.object({
  name: z.string().min(2),
  description: z.string().default(''),
  executionType: ToolExecutionTypeSchema.default('INTERNAL_FUNCTION'),
  isDeterministic: z.boolean().default(true),
  timeoutMs: z.number().int().positive().default(30000),
  costPerInvocation: z.number().default(0.0),
  permittedClassification: DataClassificationSchema.default('CONFIDENTIAL'),
  inputSchema: z.record(z.unknown()).default({}),
  outputSchema: z.record(z.unknown()).default({})
});

export const CreateMCPServerSchema = z.object({
  name: z.string().min(2),
  endpoint: z.string().min(2),
  transport: z.enum(['STDIO', 'SSE', 'STREAMABLE_HTTP']).default('SSE'),
  exposedTools: z.array(z.object({
    name: z.string(),
    description: z.string().default(''),
    inputSchema: z.record(z.unknown()).default({})
  })).default([]),
  exposedResources: z.array(z.object({
    uri: z.string(),
    name: z.string(),
    mimeType: z.string().default('application/json')
  })).default([])
});

export const CreateSkillSchema = z.object({
  name: z.string().min(2),
  objective: z.string().min(5),
  instructions: z.string().min(10),
  recommendedTools: z.array(z.string()).default([]),
  requiredTools: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  examples: z.array(z.object({
    input: z.string(),
    reasoningTrace: z.string(),
    output: z.string()
  })).default([])
});

export const CreatePolicySchema = z.object({
  name: z.string().min(2),
  sourceAuthority: z.string().min(2),
  canonicalDocumentUri: z.string().min(2),
  documentHash: z.string().default('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
  effectiveDate: z.string().default(() => new Date().toISOString()),
  jurisdiction: z.string().default('Global'),
  businessScope: z.string().default('General Compliance'),
  requirements: z.array(z.string()).default([]),
  prohibitions: z.array(z.string()).default([]),
  exceptions: z.array(z.string()).default([]),
  provenance: z.record(z.unknown()).default({})
});

export const CreateAgentSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  systemPromptTemplate: z.string().min(5),
  modelId: z.string(),
  frameworkId: z.string().default('native'),
  runtimeId: z.string().default('nodejs-v20'),
  toolIds: z.array(z.string()).default([]),
  mcpServerIds: z.array(z.string()).default([]),
  skillIds: z.array(z.string()).default([]),
  policyIds: z.array(z.string()).default([]),
  permittedDataClassification: DataClassificationSchema.default('CONFIDENTIAL'),
  a2uiEnabled: z.boolean().default(true),
  a2aCapabilities: z.array(z.object({
    operation: z.string(),
    inputSchema: z.record(z.unknown()).default({}),
    outputSchema: z.record(z.unknown()).default({})
  })).default([])
});

export const CreateOrchestratorSchema = z.object({
  name: z.string().min(2),
  description: z.string().default(''),
  modelId: z.string(),
  frameworkId: z.string().default('native'),
  routingRules: z.array(z.object({
    condition: z.string(),
    targetAgentId: z.string()
  })).default([]),
  delegationStrategy: z.enum(['SEQUENTIAL', 'PARALLEL', 'HIERARCHICAL', 'ADAPTIVE']).default('SEQUENTIAL')
});

export const UpdateLifecycleStatusSchema = z.object({
  status: LifecycleStatusSchema,
  justification: z.string().default('Operational status change via Control Plane')
});

export const CreateRunSchema = z.object({
  applicationId: z.string(),
  useCaseId: z.string(),
  workflowId: z.string(),
  environment: z.enum(['DEVELOPMENT', 'TEST', 'UAT', 'PRODUCTION']).default('DEVELOPMENT'),
  inputs: z.record(z.unknown()).default({})
});

export const ResumeRunSchema = z.object({
  resumeToken: z.string(),
  decision: z.enum(['APPROVED', 'REJECTED', 'MODIFIED']),
  humanComment: z.string().default(''),
  modifications: z.record(z.unknown()).optional()
});

export const A2UICardPropsSchema = z.object({
  title: z.string(),
  status: z.enum(['INFO', 'SUCCESS', 'WARNING', 'DANGER']).default('INFO'),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()])
  })).default([])
});

export const A2UIComparisonPanelPropsSchema = z.object({
  title: z.string(),
  leftEntity: z.object({
    title: z.string(),
    fields: z.record(z.union([z.string(), z.number()]))
  }),
  rightEntity: z.object({
    title: z.string(),
    fields: z.record(z.union([z.string(), z.number()]))
  }),
  discrepancies: z.array(z.object({
    field: z.string(),
    reason: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
  })).default([])
});

export const A2UIEvidencePanelPropsSchema = z.object({
  title: z.string(),
  policyName: z.string(),
  recommendation: z.string(),
  confidenceScore: z.number().min(0).max(1).default(0.95),
  clauses: z.array(z.object({
    clauseId: z.string(),
    text: z.string()
  })).default([])
});

export const A2UIApprovalPanelPropsSchema = z.object({
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    variant: z.enum(['PRIMARY', 'DANGER', 'SECONDARY'])
  })),
  requireComment: z.boolean().default(true),
  resumeToken: z.string().optional()
});

export const A2UIComponentSchema = z.object({
  type: z.enum(['Card', 'Table', 'ComparisonPanel', 'EvidencePanel', 'ApprovalPanel', 'Form', 'Chart', 'Timeline', 'DataGrid']),
  id: z.string().optional(),
  props: z.record(z.unknown())
});

export const A2UISurfaceSchema = z.object({
  surfaceId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  components: z.array(A2UIComponentSchema)
});

export const ImpactAnalysisRequestSchema = z.object({
  resourceType: z.enum(['MODEL', 'TOOL', 'MCP', 'POLICY', 'AGENT', 'WORKFLOW', 'USE_CASE']),
  resourceId: z.string()
});
