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

export const A2UIComponentSchema = z.object({
  type: z.enum(['Card', 'Table', 'ComparisonPanel', 'EvidencePanel', 'ApprovalPanel', 'Form', 'Chart', 'Timeline', 'DataGrid']),
  id: z.string().optional(),
  props: z.record(z.unknown())
});

export const ImpactAnalysisRequestSchema = z.object({
  resourceType: z.enum(['MODEL', 'TOOL', 'MCP', 'POLICY', 'AGENT', 'WORKFLOW', 'USE_CASE']),
  resourceId: z.string()
});
