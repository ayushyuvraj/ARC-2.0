import { prisma } from './client.js';

export async function seed() {
  console.log('🌱 Starting ARC Platform Seed Engine...');

  // Clean existing data for clean baseline
  await prisma.auditLog.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.dependencyEdge.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.traceSpan.deleteMany();
  await prisma.run.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.deploymentTarget.deleteMany();
  await prisma.useCase.deleteMany();
  await prisma.application.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.orchestrator.deleteMany();
  await prisma.model.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.mCPServer.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.policy.deleteMany();

  // 1. Models
  const modelGpt4o = await prisma.model.create({
    data: {
      id: 'model_gpt4o',
      name: 'OpenAI GPT-4o',
      provider: 'AZURE_OPENAI',
      modelIdentifier: 'gpt-4o',
      modelType: 'CHAT',
      endpoint: 'https://azure-openai.arc.local/v1/chat/completions',
      contextWindowTokens: 128000,
      maxOutputTokens: 4096,
      securityClassification: 'RESTRICTED',
      pricingJson: JSON.stringify({ currency: 'USD', inputPricePer1kTokens: 0.005, outputPricePer1kTokens: 0.015 })
    }
  });

  const modelGemini = await prisma.model.create({
    data: {
      id: 'model_gemini15pro',
      name: 'Google Gemini 1.5 Pro',
      provider: 'VERTEX_AI',
      modelIdentifier: 'gemini-1.5-pro',
      modelType: 'REASONING',
      endpoint: 'https://vertex-ai.arc.local/v1/models/gemini-pro',
      contextWindowTokens: 1000000,
      maxOutputTokens: 8192,
      securityClassification: 'RESTRICTED',
      pricingJson: JSON.stringify({ currency: 'USD', inputPricePer1kTokens: 0.0035, outputPricePer1kTokens: 0.0105 })
    }
  });

  const modelClaude = await prisma.model.create({
    data: {
      id: 'model_claude35',
      name: 'Anthropic Claude 3.5 Sonnet',
      provider: 'ANTHROPIC',
      modelIdentifier: 'claude-3-5-sonnet',
      modelType: 'REASONING',
      endpoint: 'https://api.anthropic.com/v1/messages',
      contextWindowTokens: 200000,
      maxOutputTokens: 8192,
      securityClassification: 'CONFIDENTIAL',
      pricingJson: JSON.stringify({ currency: 'USD', inputPricePer1kTokens: 0.003, outputPricePer1kTokens: 0.015 })
    }
  });

  const modelMock = await prisma.model.create({
    data: {
      id: 'model_mock_local',
      name: 'ARC Local Simulated Provider',
      provider: 'LOCAL_MOCK',
      modelIdentifier: 'arc-simulated-v1',
      modelType: 'CHAT',
      endpoint: 'http://localhost:4000/api/v1/mock-model',
      contextWindowTokens: 64000,
      maxOutputTokens: 4096,
      securityClassification: 'RESTRICTED',
      pricingJson: JSON.stringify({ currency: 'USD', inputPricePer1kTokens: 0.0, outputPricePer1kTokens: 0.0 })
    }
  });

  // 2. Tools
  const toolExactMatcher = await prisma.tool.create({
    data: {
      id: 'tool_exact_matcher',
      name: 'Deterministic Hash Matcher',
      description: 'High-speed in-memory DuckDB exact matcher for GSTIN, invoice number, and tax amount equality.',
      executionType: 'DETERMINISTIC_BINARY',
      isDeterministic: true,
      costPerInvocation: 0.0,
      permittedClassification: 'RESTRICTED',
      inputSchemaJson: JSON.stringify({ gstRows: 'Array<Record>', prRows: 'Array<Record>' }),
      outputSchemaJson: JSON.stringify({ matchedCount: 'number', exactMatches: 'Array', unmatchedGst: 'Array', unmatchedPr: 'Array' })
    }
  });

  const toolTolerance = await prisma.tool.create({
    data: {
      id: 'tool_tolerance_calculator',
      name: 'Tax Tolerance & Rounding Calculator',
      description: 'Evaluates decimal penny rounding differences against statutory tolerance boundaries (INR 1.00).',
      executionType: 'INTERNAL_FUNCTION',
      isDeterministic: true,
      costPerInvocation: 0.0,
      permittedClassification: 'RESTRICTED'
    }
  });

  const toolReportCompiler = await prisma.tool.create({
    data: {
      id: 'tool_report_compiler',
      name: 'Reconciliation PDF & Audit Report Compiler',
      description: 'Generates formal tax audit deliverable artifact with cryptographic lineage verification.',
      executionType: 'INTERNAL_FUNCTION',
      isDeterministic: true,
      costPerInvocation: 0.0,
      permittedClassification: 'CONFIDENTIAL'
    }
  });

  // 3. MCP Servers
  await prisma.mCPServer.create({
    data: {
      id: 'mcp_tax_policy',
      name: 'KPMG Indirect Tax Knowledge MCP Server',
      endpoint: 'https://mcp-tax.arc.local/sse',
      transport: 'SSE',
      exposedToolsJson: JSON.stringify([
        { name: 'query_itc_rule', description: 'Checks Section 16(2) Input Tax Credit admissibility' },
        { name: 'get_vendor_compliance_rating', description: 'Returns vendor filing reliability score' }
      ]),
      healthStatus: 'HEALTHY'
    }
  });

  // 4. Policies
  const policyTax = await prisma.policy.create({
    data: {
      id: 'policy_kpmg_tax_v12',
      name: 'KPMG Institutional Tax Guidelines v12 — Input Tax Credit',
      sourceAuthority: 'Global Indirect Tax Advisory Committee',
      canonicalDocumentUri: 'https://governance.kpmg.local/tax/policies/itc_v12.pdf',
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      effectiveDate: new Date('2026-01-01'),
      jurisdiction: 'India / Multi-State GST',
      businessScope: 'Indirect Tax - Corporate Inward Supply Audit',
      requirementsJson: JSON.stringify([
        'Supplier GSTIN must be active on invoice date',
        'Tax invoice must be possessed by recipient',
        'Tax must be credited to government account'
      ]),
      prohibitionsJson: JSON.stringify([
        'Claiming ITC on goods blocked under Section 17(5)',
        'Auto-reconciling invoices where GSTIN prefix is mismatched'
      ]),
      exceptionsJson: JSON.stringify([
        'Rounding discrepancies under INR 1.00 are permissible without vendor confirmation',
        'Invoice date discrepancy under 30 days is acceptable if return is filed'
      ]),
      provenanceJson: JSON.stringify({ approvedBy: 'Lead Tax Partner', regulatoryReference: 'GST Act Section 16(2)' }),
      lifecycleStatus: 'ACTIVE'
    }
  });

  // 5. Skills
  await prisma.skill.create({
    data: {
      id: 'skill_tax_itc_reasoning',
      name: 'ITC Admissibility Audit Methodology',
      objective: 'Verify legal entitlement to claim input tax credit for disputed corporate purchase invoices.',
      instructions: '1. Compare invoice dates. 2. Verify supplier return status. 3. Assess Section 17(5) negative list. 4. Calculate admissible claim percentage.',
      recommendedToolsJson: JSON.stringify(['tool_tolerance_calculator']),
      constraintsJson: JSON.stringify(['Never approve claims if supplier GSTIN is cancelled'])
    }
  });

  // 6. Deployment Targets (Multi-Cloud Simulation)
  const targetGcc = await prisma.deploymentTarget.create({
    data: {
      id: 'target_gcc',
      name: 'KPMG Global Cloud Core (GCC)',
      type: 'KPMG_GCC',
      region: 'eu-central',
      isSimulated: true,
      networkSecurityBoundary: 'ENTERPRISE_INTERNAL_VPC'
    }
  });

  const targetAzure = await prisma.deploymentTarget.create({
    data: {
      id: 'target_azure',
      name: 'Azure Enterprise Execution Plane',
      type: 'AZURE',
      region: 'eastus2',
      isSimulated: true,
      networkSecurityBoundary: 'AZURE_ISOLATED_SUBNET'
    }
  });

  const targetVertex = await prisma.deploymentTarget.create({
    data: {
      id: 'target_vertex',
      name: 'Google Cloud Vertex AI Execution Plane',
      type: 'VERTEX',
      region: 'us-central1',
      isSimulated: true,
      networkSecurityBoundary: 'GCP_SERVICE_PERIMETER'
    }
  });

  // 7. Agents
  const agentMatching = await prisma.agent.create({
    data: {
      id: 'agent_matching',
      name: 'TARS Matching Agent',
      role: 'Reasoning agent for analyzing near-match and ambiguous invoice discrepancies.',
      systemPromptTemplate: 'You are the TARS Matching Agent. Compare purchase register and GST invoice candidates. Evaluate formatting, dates, and amounts.',
      modelId: modelGpt4o.id,
      toolIdsJson: JSON.stringify([toolTolerance.id]),
      mcpServerIdsJson: JSON.stringify([]),
      skillIdsJson: JSON.stringify(['skill_fuzzy_invoice_matching']),
      permittedDataClassification: 'RESTRICTED',
      a2aCapabilitiesJson: JSON.stringify([
        { operation: 'resolve_discrepancy', inputSchema: {}, outputSchema: {} }
      ]),
      a2uiEnabled: true
    }
  });

  const agentTaxPolicy = await prisma.agent.create({
    data: {
      id: 'agent_tax_policy',
      name: 'TARS Tax Policy Agent',
      role: 'Authoritative tax advisor evaluating Input Tax Credit legal eligibility under KPMG guidelines.',
      systemPromptTemplate: 'You are the TARS Tax Policy Agent. Evaluate whether candidate reconciliations meet Section 16(2) statutory constraints.',
      modelId: modelGemini.id,
      policyIdsJson: JSON.stringify([policyTax.id]),
      toolIdsJson: JSON.stringify([]),
      mcpServerIdsJson: JSON.stringify(['mcp_tax_policy']),
      skillIdsJson: JSON.stringify(['skill_tax_itc_reasoning']),
      permittedDataClassification: 'RESTRICTED',
      a2aCapabilitiesJson: JSON.stringify([
        { operation: 'evaluate_itc_admissibility', inputSchema: {}, outputSchema: {} }
      ]),
      a2uiEnabled: true
    }
  });

  // 8. Workflows
  const wfTars = await prisma.workflow.create({
    data: {
      id: 'wf_tars_recon_v2',
      name: 'TARS 2.0 Tax Reconciliation Graph',
      description: 'End-to-end multi-agent and deterministic tax reconciliation workflow.',
      nodesJson: JSON.stringify([
        { id: 'node_start', type: 'START', name: 'Dataset Ingestion & Validation', configuration: {} },
        { id: 'node_exact_match', type: 'DETERMINISTIC_TASK', name: 'Deterministic Matcher (85%+)', configuration: { componentId: toolExactMatcher.id } },
        { id: 'node_matching_agent', type: 'AGENT', name: 'Matching Agent (Azure)', configuration: { agentId: agentMatching.id } },
        { id: 'node_tax_policy_agent', type: 'AGENT', name: 'Tax Policy Agent (Vertex A2A)', configuration: { agentId: agentTaxPolicy.id } },
        { id: 'node_human_review', type: 'HUMAN_APPROVAL', name: 'Ambiguity Review Panel (A2UI)', configuration: { a2uiSurfaceKey: 'ambiguity_review' } },
        { id: 'node_report_gen', type: 'DETERMINISTIC_TASK', name: 'Compile Final Audit Report', configuration: { componentId: toolReportCompiler.id } },
        { id: 'node_end', type: 'END', name: 'Reconciliation Finalized', configuration: {} }
      ]),
      edgesJson: JSON.stringify([
        { id: 'e1', sourceNodeId: 'node_start', targetNodeId: 'node_exact_match' },
        { id: 'e2', sourceNodeId: 'node_exact_match', targetNodeId: 'node_matching_agent' },
        { id: 'e3', sourceNodeId: 'node_matching_agent', targetNodeId: 'node_tax_policy_agent' },
        { id: 'e4', sourceNodeId: 'node_tax_policy_agent', targetNodeId: 'node_human_review' },
        { id: 'e5', sourceNodeId: 'node_human_review', targetNodeId: 'node_report_gen' },
        { id: 'e6', sourceNodeId: 'node_report_gen', targetNodeId: 'node_end' }
      ]),
      lifecycleStatus: 'ACTIVE'
    }
  });

  // 9. Applications & Use Cases
  // App 1: TARS 2.0
  const appTars = await prisma.application.create({
    data: {
      id: 'app_tars',
      name: 'TARS 2.0',
      slug: 'tars',
      description: 'Enterprise Indirect Tax Reconciliation, Advisory & Statutory Filing Review',
      owner: 'tax-lead@kpmg.com',
      businessUnit: 'Global Tax Advisory',
      domain: 'Indirect Tax',
      brandingJson: JSON.stringify({ primaryColor: '#00338D', accentColor: '#0091DA' }),
      uiMode: 'GENERATED_A2UI'
    }
  });

  await prisma.useCase.create({
    data: {
      id: 'usecase_tax_reconciliation',
      applicationId: appTars.id,
      name: 'GST & Purchase Register Reconciliation',
      description: 'Reconcile government GSTR-2B invoices against internal ERP purchase records.',
      businessPurpose: 'Identify missing invoices, claim maximum legal ITC, and prevent tax audit penalties.',
      workflowId: wfTars.id,
      agentIdsJson: JSON.stringify([agentMatching.id, agentTaxPolicy.id]),
      policyIdsJson: JSON.stringify([policyTax.id]),
      toolIdsJson: JSON.stringify([toolExactMatcher.id, toolTolerance.id, toolReportCompiler.id]),
      dataClassification: 'RESTRICTED'
    }
  });

  // App 2: Matching Intelligence
  const appMatching = await prisma.application.create({
    data: {
      id: 'app_matching',
      name: 'Matching Intelligence',
      slug: 'matching',
      description: 'Cross-System Customer & Vendor Master Data Deduplication Engine',
      owner: 'data-gov@arc.local',
      businessUnit: 'Data Management & Governance',
      domain: 'Master Data',
      brandingJson: JSON.stringify({ primaryColor: '#047857', accentColor: '#10B981' }),
      uiMode: 'GENERATED'
    }
  });

  await prisma.useCase.create({
    data: {
      id: 'usecase_master_matching',
      applicationId: appMatching.id,
      name: 'Enterprise Entity Deduplication',
      description: 'Probabilistic and deterministic entity resolution across legacy CRM and billing records.',
      businessPurpose: 'Single customer golden record view.',
      workflowId: wfTars.id,
      dataClassification: 'CONFIDENTIAL'
    }
  });

  // App 3: PPT Preparation
  const appPpt = await prisma.application.create({
    data: {
      id: 'app_ppt',
      name: 'PPT Preparation',
      slug: 'ppt',
      description: 'Automated Executive Slide Deck & Financial Performance Synthesis',
      owner: 'strategy@arc.local',
      businessUnit: 'Strategy & Operations',
      domain: 'Executive Reporting',
      brandingJson: JSON.stringify({ primaryColor: '#6D28D9', accentColor: '#8B5CF6' }),
      uiMode: 'CUSTOM'
    }
  });

  await prisma.useCase.create({
    data: {
      id: 'usecase_presentation_gen',
      applicationId: appPpt.id,
      name: 'Quarterly Earnings Presentation Generation',
      description: 'Synthesizes narrative outlines and compiled slides from raw quarterly earnings tables.',
      businessPurpose: 'Reduce manual pitchbook assembly time by 75%.',
      dataClassification: 'INTERNAL'
    }
  });

  // 10. Deployments
  await prisma.deployment.create({
    data: {
      id: 'dep_tars_prod',
      applicationId: appTars.id,
      useCaseId: 'usecase_tax_reconciliation',
      environment: 'PRODUCTION',
      targetId: targetGcc.id,
      status: 'DEPLOYED'
    }
  });

  // 11. Dependency Edges (for Blast Radius Impact Engine)
  await prisma.dependencyEdge.createMany({
    data: [
      { id: 'dep_1', sourceType: 'MODEL', sourceId: modelGpt4o.id, targetType: 'AGENT', targetId: agentMatching.id },
      { id: 'dep_2', sourceType: 'MODEL', sourceId: modelGemini.id, targetType: 'AGENT', targetId: agentTaxPolicy.id },
      { id: 'dep_3', sourceType: 'TOOL', sourceId: toolExactMatcher.id, targetType: 'WORKFLOW', targetId: wfTars.id },
      { id: 'dep_4', sourceType: 'POLICY', sourceId: policyTax.id, targetType: 'AGENT', targetId: agentTaxPolicy.id },
      { id: 'dep_5', sourceType: 'AGENT', sourceId: agentMatching.id, targetType: 'WORKFLOW', targetId: wfTars.id },
      { id: 'dep_6', sourceType: 'AGENT', sourceId: agentTaxPolicy.id, targetType: 'WORKFLOW', targetId: wfTars.id },
      { id: 'dep_7', sourceType: 'WORKFLOW', sourceId: wfTars.id, targetType: 'USE_CASE', targetId: 'usecase_tax_reconciliation' },
      { id: 'dep_8', sourceType: 'USE_CASE', sourceId: 'usecase_tax_reconciliation', targetType: 'APPLICATION', targetId: appTars.id },
      { id: 'dep_9', sourceType: 'APPLICATION', sourceId: appTars.id, targetType: 'DEPLOYMENT', targetId: 'dep_tars_prod' }
    ]
  });

  console.log('✅ ARC Platform Seed Complete:');
  console.log('   - 3 Applications (TARS 2.0, Matching Intelligence, PPT Preparation)');
  console.log('   - 4 Foundation Models (GPT-4o, Gemini 1.5 Pro, Claude 3.5, Mock Provider)');
  console.log('   - 3 Deterministic Tools (Exact Matcher, Tolerance Calculator, Report Compiler)');
  console.log('   - 1 Institutional Policy (KPMG Tax v12)');
  console.log('   - 3 Multi-Cloud Deployment Targets (GCC, Azure, Vertex)');
  console.log('   - 9 Dependency Edges for blast-radius calculation');
}

// Allow direct execution: npx tsx src/seed.ts
if (process.argv[1]?.endsWith('seed.ts')) {
  seed()
    .catch((err) => {
      console.error('❌ Error seeding database:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
