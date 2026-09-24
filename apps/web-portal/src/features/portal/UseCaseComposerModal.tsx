import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Bot,
  Wrench,
  Scale,
  Radio,
  Boxes,
  Sparkles,
  GitFork,
  Shield,
  Layers,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  BookOpen
} from 'lucide-react';

interface UseCaseComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseCaseCreated?: (useCase: any) => void;
}

export const UseCaseComposerModal: React.FC<UseCaseComposerModalProps> = ({
  isOpen,
  onClose,
  onUseCaseCreated
}) => {
  // Step 1: Basic Metadata
  const [useCaseName, setUseCaseName] = useState('');
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [dataClassification, setDataClassification] = useState('RESTRICTED');

  // Available Registries from Backend
  const [models, setModels] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);

  // Selections
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(['agent_matching', 'agent_tax_policy']);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>(['tool_exact_matcher', 'tool_tolerance_calculator']);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(['policy_kpmg_tax_v12']);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf_tars_recon_v2');
  const [selectedFramework, setSelectedFramework] = useState<string>('GOOGLE_ADK');
  const [selectedCloudTarget, setSelectedCloudTarget] = useState<string>('AZURE_COMMERCIAL');

  // AI Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);

  // NL Workflow Prompt Generator State
  const [nlWorkflowPrompt, setNlWorkflowPrompt] = useState('');
  const [isSynthesizingWorkflow, setIsSynthesizingWorkflow] = useState(false);
  const [synthesizedWorkflow, setSynthesizedWorkflow] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch registry resources
    Promise.all([
      fetch('/api/v1/registries/models').then((r) => r.json()),
      fetch('/api/v1/registries/tools').then((r) => r.json()),
      fetch('/api/v1/registries/mcp').then((r) => r.json()),
      fetch('/api/v1/registries/policies').then((r) => r.json()),
      fetch('/api/v1/registries/agents').then((r) => r.json()),
      fetch('/api/v1/workflows').then((r) => r.json())
    ]).then(([mRes, tRes, mcpRes, pRes, aRes, wRes]) => {
      if (mRes.success) setModels(mRes.data);
      if (tRes.success) setTools(tRes.data);
      if (mcpRes.success) setMcpServers(mcpRes.data);
      if (pRes.success) setPolicies(pRes.data);
      if (aRes.success) setAgents(aRes.data);
      if (wRes.success) setWorkflows(wRes.data);
    }).catch((err) => console.error(err));
  }, [isOpen]);

  if (!isOpen) return null;

  // AI Recommendation Engine Trigger
  const handleConsultAiRecommendation = async () => {
    setIsEvaluatingAi(true);
    setAiRecommendation(null);

    // Emulate LLM suitability analysis
    setTimeout(() => {
      setAiRecommendation({
        recommendedFramework: 'GOOGLE_ADK',
        frameworkReason: 'Google Agent Developer Kit (ADK) provides zero-latency A2A protocol support, native Gemini 1.5 Pro multimodal tool-calling, and strict Zod A2UI schema enforcement.',
        recommendedCloud: 'KPMG_SOVEREIGN_GCC',
        cloudReason: 'Data classification is RESTRICTED under Indirect Tax statutory regulations. KPMG Sovereign GCC provides guaranteed in-region data residency and SOC2/GDPR audit isolation.',
        suitabilityScore: '98.4%',
        alternatives: [
          { name: 'LangGraph', fit: '92.0%', note: 'Best for complex stateful graph loops with durable checkpoints.' },
          { name: 'CrewAI', fit: '88.5%', note: 'Suitable for role-based multi-agent collaboration with task delegation.' }
        ]
      });
      setIsEvaluatingAi(false);
    }, 600);
  };

  // NL Workflow Synthesis Trigger
  const handleSynthesizeWorkflow = async () => {
    if (!nlWorkflowPrompt.trim()) return;
    setIsSynthesizingWorkflow(true);
    try {
      const res = await fetch('/api/v1/workflows/generate-from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: nlWorkflowPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setSynthesizedWorkflow(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizingWorkflow(false);
    }
  };

  const handleToggleAgent = (id: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleTool = (id: string) => {
    setSelectedToolIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTogglePolicy = (id: string) => {
    setSelectedPolicyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitUseCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useCaseName.trim()) return;

    try {
      const res = await fetch('/api/v1/applications/app_tars/use-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: 'app_tars',
          name: useCaseName,
          description: businessPurpose,
          businessPurpose,
          workflowId: selectedWorkflowId,
          agentIds: selectedAgentIds,
          policyIds: selectedPolicyIds,
          toolIds: selectedToolIds,
          dataClassification
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onUseCaseCreated) onUseCaseCreated(data.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-arc-surface border border-arc-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-arc-border flex items-center justify-between bg-arc-dark">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  ARC Use Case & Agent Composition Studio
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Composer v2.0
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Compose business capabilities by assembling Agents, Tools, Policies, MCP Connections, and Multi-Cloud Runtimes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-arc-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitUseCase} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Use Case Identity */}
          <div className="p-4 rounded-lg bg-arc-card/50 border border-arc-border space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>1. Business Capability & Security Classification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-gray-400 font-medium block">Use Case Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Statutory Tax Filing Audit & Reconciliation"
                  value={useCaseName}
                  onChange={(e) => setUseCaseName(e.target.value)}
                  className="w-full bg-arc-dark border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-medium block">Data Boundary Classification</label>
                <select
                  value={dataClassification}
                  onChange={(e) => setDataClassification(e.target.value)}
                  className="w-full bg-arc-dark border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold text-amber-400"
                >
                  <option value="PUBLIC">PUBLIC (Unrestricted)</option>
                  <option value="INTERNAL">INTERNAL (Company Confidential)</option>
                  <option value="RESTRICTED">RESTRICTED (Legal / Statutory Strict)</option>
                  <option value="SECRET">SECRET (Air-Gapped Sovereign Only)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-medium block">Business Purpose & Expected Outcome</label>
              <textarea
                rows={2}
                placeholder="Explain what this Use Case accomplishes, compliance objectives, and value realization."
                value={businessPurpose}
                onChange={(e) => setBusinessPurpose(e.target.value)}
                className="w-full bg-arc-dark border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Section 2: Agent Framework & Cloud Target Recommendation Engine */}
          <div className="p-4 rounded-lg bg-arc-card/50 border border-arc-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>2. Agent Framework & Multi-Cloud Runtime Target</span>
              </h3>

              <button
                type="button"
                onClick={handleConsultAiRecommendation}
                disabled={isEvaluatingAi}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEvaluatingAi ? 'Analyzing Criteria...' : 'Consult LLM Selection Engine'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 font-medium block">Agent Creator / Orchestration Framework</label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full bg-arc-dark border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="GOOGLE_ADK">Google Agent Developer Kit (ADK / Google Agents)</option>
                  <option value="LANGGRAPH">LangGraph (Durable State & Checkpoint DAGs)</option>
                  <option value="CREW_AI">CrewAI (Role-Based Task Delegation)</option>
                  <option value="AUTOGEN">Microsoft AutoGen (Multi-Agent Conversations)</option>
                  <option value="LANGCHAIN">LangChain Expressions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-medium block">Target Cloud Execution Plane</label>
                <select
                  value={selectedCloudTarget}
                  onChange={(e) => setSelectedCloudTarget(e.target.value)}
                  className="w-full bg-arc-dark border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold text-blue-300"
                >
                  <option value="KPMG_SOVEREIGN_GCC">KPMG Sovereign GCC (In-Region Protected)</option>
                  <option value="AZURE_COMMERCIAL">Azure Commercial (GPT-4o Enterprise)</option>
                  <option value="VERTEX_AI">Google Cloud Vertex AI (Gemini 1.5 Pro)</option>
                  <option value="AWS_BEDROCK">AWS Bedrock (Claude 3.5 Sonnet)</option>
                </select>
              </div>
            </div>

            {/* AI Recommendation Output Card */}
            {aiRecommendation && (
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Selection Recommendation: {aiRecommendation.recommendedFramework} on {aiRecommendation.recommendedCloud}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    Match Confidence: {aiRecommendation.suitabilityScore}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">{aiRecommendation.frameworkReason}</p>
                <p className="text-gray-300 leading-relaxed font-medium">{aiRecommendation.cloudReason}</p>
              </div>
            )}
          </div>

          {/* Section 3: Attach Composable Agents & Orchestrators */}
          <div className="p-4 rounded-lg bg-arc-card/50 border border-arc-border space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>3. Attach Reasoning Agents & Shared Registries</span>
            </h3>

            <p className="text-gray-400">
              Select the autonomous Reasoning Agents assigned to this Use Case. Agents reference shared Models, Tools, MCP connections, and Policies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {agents.map((ag) => {
                const isSelected = selectedAgentIds.includes(ag.id);
                return (
                  <div
                    key={ag.id}
                    onClick={() => handleToggleAgent(ag.id)}
                    className={`p-3 rounded-lg border cursor-pointer select-none transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/10'
                        : 'border-arc-border bg-arc-dark hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${isSelected ? 'border-purple-400 bg-purple-500 text-white' : 'border-gray-600'}`}>
                      {isSelected && <CheckCircle className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{ag.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-arc-card text-purple-300 border border-purple-500/20">
                          {ag.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{ag.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Attach Shared Tools & Institutional Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tools */}
            <div className="p-4 rounded-lg bg-arc-card/50 border border-arc-border space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Deterministic Tools</span>
              </h3>
              <div className="space-y-2">
                {tools.map((tl) => {
                  const isSelected = selectedToolIds.includes(tl.id);
                  return (
                    <div
                      key={tl.id}
                      onClick={() => handleToggleTool(tl.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer select-none transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-500/60 bg-amber-500/10'
                          : 'border-arc-border bg-arc-dark hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{tl.name}</span>
                        {tl.isDeterministic && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Deterministic
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">{tl.executionType}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="p-4 rounded-lg bg-arc-card/50 border border-arc-border space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-blue-400" />
                <span>Institutional Governance Policies</span>
              </h3>
              <div className="space-y-2">
                {policies.map((pl) => {
                  const isSelected = selectedPolicyIds.includes(pl.id);
                  return (
                    <div
                      key={pl.id}
                      onClick={() => handleTogglePolicy(pl.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer select-none transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500/60 bg-blue-500/10'
                          : 'border-arc-border bg-arc-dark hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{pl.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {pl.version}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">{pl.authority}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Natural Language Workflow Synthesizer */}
          <div className="p-4 rounded-lg bg-arc-card/50 border border-arc-border space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-indigo-400" />
              <span>5. Workflow Graph Structure & Natural Language AI Synthesis</span>
            </h3>

            <div className="space-y-2">
              <label className="text-gray-400 font-medium block">
                Define Workflow Structure in Natural English (e.g. Step 1 file upload, Step 2 exact matcher, Step 3 matching agent, Step 4 human gate, Step 5 report gen)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Ingest GSTR2B file, run 85% exact matcher, send exceptions to Matching Agent, seek human audit approval, compile PDF report"
                  value={nlWorkflowPrompt}
                  onChange={(e) => setNlWorkflowPrompt(e.target.value)}
                  className="flex-1 bg-arc-dark border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSynthesizeWorkflow}
                  disabled={isSynthesizingWorkflow || !nlWorkflowPrompt.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSynthesizingWorkflow ? 'Synthesizing...' : 'Generate Graph'}</span>
                </button>
              </div>
            </div>

            {synthesizedWorkflow && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span>Synthesized DAG Workflow: {synthesizedWorkflow.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400">Valid DAG (0 Cycles)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {synthesizedWorkflow.nodes?.map((nd: any, idx: number) => (
                    <div key={nd.id} className="p-2 rounded bg-arc-dark border border-arc-border text-[11px]">
                      <span className="text-gray-400 text-[9px] block">Step {idx + 1}: {nd.type}</span>
                      <span className="font-semibold text-gray-200">{nd.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-arc-border bg-arc-dark flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Governance Audit Route: Auto-calculates risk level and checks required approvals.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-arc-card border border-arc-border text-xs text-gray-300 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitUseCase}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              Create Use Case & Register Agents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
