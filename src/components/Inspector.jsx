import React, { useState } from 'react';
import { 
  Bot, 
  Settings2, 
  X, 
  Trash2,
  Cpu,
  Key,
  Server,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { PILLARS } from '../constants/pillars';
import { PROVIDERS, getProviderCredential } from '../services/llmService';

export default function Inspector({
  selectedNode,
  agentConfig,
  onUpdateAgentConfig,
  onUpdateNodeData,
  onDeleteNode,
  onClose,
  onOpenApiSettings
}) {
  const [customModelMode, setCustomModelMode] = useState(false);

  if (!selectedNode) {
    return (
      <aside className="w-80 h-full bg-[#FFFFFF] border-l border-[#E0E0E0] p-5 flex flex-col items-center justify-center text-center text-[#666666] shrink-0">
        <Settings2 className="w-10 h-10 mb-3 text-[#00338D]/40" />
        <h4 className="text-sm font-bold text-[#0B0F19]">No Block Selected</h4>
        <p className="text-xs text-[#666666] mt-1 max-w-[200px]">
          Click on the Core Agent or any attached block to inspect and customize its settings.
        </p>
      </aside>
    );
  }

  const isAgent = selectedNode.type === 'agentCore';
  const nodeData = selectedNode.data;
  const pillarDef = PILLARS[nodeData.pillarType];
  const isModel = nodeData.pillarType === 'model';

  // Multi-LLM provider detection for model nodes
  const currentProvider = nodeData.config?.provider || 
    (nodeData.name?.toLowerCase().includes('claude') ? 'anthropic' :
     nodeData.name?.toLowerCase().includes('gpt') ? 'openai' :
     nodeData.name?.toLowerCase().includes('ollama') ? 'ollama' :
     nodeData.name?.toLowerCase().includes('openrouter') ? 'openrouter' : 'google');

  const currentModelId = nodeData.config?.modelId || PROVIDERS[currentProvider]?.defaultModel || 'gemini-2.0-flash';
  const providerDef = PROVIDERS[currentProvider] || PROVIDERS.google;
  const hasCredential = Boolean(getProviderCredential(currentProvider));

  const handleProviderSelect = (newProvider) => {
    const pDef = PROVIDERS[newProvider];
    const defaultModel = pDef.defaultModel;
    onUpdateNodeData(selectedNode.id, {
      name: `${pDef.name} (${defaultModel})`,
      description: `${pDef.name} foundation model configured for live enterprise inference.`,
      config: {
        ...nodeData.config,
        provider: newProvider,
        modelId: defaultModel,
        baseUrl: newProvider === 'ollama' ? (nodeData.config?.baseUrl || 'http://localhost:11434') : undefined
      }
    });
  };

  const handleModelIdSelect = (newModelId) => {
    onUpdateNodeData(selectedNode.id, {
      name: `${providerDef.name} (${newModelId})`,
      config: {
        ...nodeData.config,
        modelId: newModelId
      }
    });
  };

  return (
    <aside className="w-88 h-full bg-[#FFFFFF] border-l border-[#E0E0E0] flex flex-col shrink-0 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F6F8] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#00338D] text-white flex items-center justify-center">
            {isAgent ? (
              <Bot className="w-4 h-4 text-white" />
            ) : isModel ? (
              <Cpu className="w-4 h-4 text-white" />
            ) : (
              <Settings2 className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00338D] block font-['Univers',sans-serif]">
              {isAgent ? 'Core Agent Inspector' : isModel ? 'Foundation Model Spec' : `${nodeData.pillarType?.toUpperCase()} Specifications`}
            </span>
            <h4 className="text-xs font-bold text-[#0B0F19] truncate max-w-[190px]">
              {nodeData.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isAgent && (
            <button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="w-7 h-7 hover:bg-[#F2E9F4] text-[#666666] hover:text-[#6D2077] flex items-center justify-center transition-colors"
              title="Delete block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 hover:bg-[#E0E0E0] text-[#666666] hover:text-[#0B0F19] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#FFFFFF]">
        {isAgent ? (
          <>
            {/* System Prompt Customizer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0B0F19]">
                  System Instruction Prompt
                </label>
                <span className="text-[10px] font-mono text-[#00338D] font-bold">Persona</span>
              </div>
              <textarea
                rows={6}
                value={agentConfig.prompt}
                onChange={(e) => onUpdateAgentConfig({ prompt: e.target.value })}
                placeholder="Provide prompt as to what we want the agent to do..."
                className="w-full p-3 bg-[#F5F6F8] border border-[#E0E0E0] text-xs text-[#0B0F19] leading-relaxed focus:outline-none focus:border-[#00338D] resize-none font-mono"
              />
              <p className="text-[11px] text-[#666666] mt-1">
                Authoritative instructions governing output schema, analytical rigor, and task assignments.
              </p>
            </div>

            {/* Quick Template Tokens */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B0F19] block mb-1.5">
                Dynamic Injection Tokens
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['{{transcript}}', '{{attendees}}', '{{meeting_date}}', '{{past_commitments}}'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => onUpdateAgentConfig({ prompt: agentConfig.prompt + ` ${tag}` })}
                    className="text-[10px] font-mono px-2 py-1 bg-[#E6EDF7] hover:bg-[#00338D] text-[#00338D] hover:text-white border border-[#00338D]/30 transition-colors font-semibold"
                    title="Click to insert token into prompt"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Hyperparameters */}
            <div className="space-y-4 pt-2 border-t border-[#E0E0E0]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0B0F19]">Temperature</span>
                  <span className="text-xs font-mono text-[#00338D] font-bold">{agentConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={agentConfig.temperature}
                  onChange={(e) => onUpdateAgentConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-[#00338D]"
                />
                <div className="flex justify-between text-[10px] text-[#666666] mt-0.5 font-medium">
                  <span>Deterministic (0.0)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0B0F19]">Top-P</span>
                  <span className="text-xs font-mono text-[#00338D] font-bold">{agentConfig.topP || 0.95}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={agentConfig.topP || 0.95}
                  onChange={(e) => onUpdateAgentConfig({ topP: parseFloat(e.target.value) })}
                  className="w-full accent-[#00338D]"
                />
              </div>
            </div>
          </>
        ) : isModel ? (
          /* Specialized Multi-LLM Foundation Model Inspector */
          <div className="space-y-4">
            {/* Provider Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0B0F19]">
                  LLM Provider
                </label>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  hasCredential || currentProvider === 'ollama'
                    ? 'bg-[#E6F5EC] text-[#009A44] border border-[#009A44]/30'
                    : 'bg-[#FEF6E6] text-[#EAAA00] border border-[#EAAA00]/30'
                }`}>
                  {hasCredential || currentProvider === 'ollama' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{currentProvider === 'ollama' ? 'Local Service' : 'Key Ready'}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Key Missing</span>
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {Object.entries(PROVIDERS).map(([pId, def]) => {
                  const isSelected = currentProvider === pId;
                  const isConfigured = Boolean(getProviderCredential(pId));
                  return (
                    <button
                      key={pId}
                      onClick={() => handleProviderSelect(pId)}
                      className={`px-3 py-2 text-left text-xs font-bold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#00338D] bg-[#E6EDF7] text-[#00338D]'
                          : 'border-[#E0E0E0] bg-[#F5F6F8] text-[#0B0F19] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#00338D]' : 'bg-[#CCCCCC]'}`} />
                        <span>{def.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#666666]">
                        {isConfigured ? '● Active' : def.isLocal ? '● Local' : '○ Not set'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model ID Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0B0F19]">
                  Model Identifier
                </label>
                <button
                  onClick={() => setCustomModelMode(!customModelMode)}
                  className="text-[10px] font-mono text-[#00338D] hover:underline font-bold"
                >
                  {customModelMode ? 'Preset Models' : 'Custom Model ID'}
                </button>
              </div>

              {customModelMode ? (
                <input
                  type="text"
                  value={currentModelId}
                  onChange={(e) => handleModelIdSelect(e.target.value)}
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                  className="w-full px-3 py-2 bg-[#F5F6F8] border border-[#E0E0E0] text-xs font-mono text-[#0B0F19] focus:outline-none focus:border-[#00338D]"
                />
              ) : (
                <select
                  value={currentModelId}
                  onChange={(e) => handleModelIdSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F6F8] border border-[#E0E0E0] text-xs font-bold text-[#0B0F19] focus:outline-none focus:border-[#00338D]"
                >
                  {providerDef.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Ollama Local Endpoint Settings */}
            {currentProvider === 'ollama' && (
              <div className="p-3 bg-[#E6EDF7] border border-[#00338D]/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#00338D]">
                  <Server className="w-3.5 h-3.5" />
                  <span>Local Private Host</span>
                </div>
                <p className="text-[11px] text-[#001E50] leading-relaxed">
                  Runs directly on your computer hardware. 100% private, zero token costs, air-gapped compliance.
                </p>
                <div>
                  <label className="text-[10px] font-mono text-[#666666] block mb-1">
                    Ollama Base URL
                  </label>
                  <input
                    type="text"
                    value={nodeData.config?.baseUrl || 'http://localhost:11434'}
                    onChange={(e) => {
                      onUpdateNodeData(selectedNode.id, {
                        config: { ...nodeData.config, baseUrl: e.target.value }
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E0E0E0] text-xs font-mono text-[#0B0F19] focus:outline-none focus:border-[#00338D]"
                  />
                </div>
              </div>
            )}

            {/* Credential Action & Live Status */}
            <div>
              <button
                onClick={() => onOpenApiSettings && onOpenApiSettings(currentProvider)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold bg-[#00338D] text-white hover:bg-[#005EB8] transition-colors shadow-sm"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configure {providerDef.name} Credentials</span>
              </button>
            </div>

            {/* Hyperparameters */}
            <div className="space-y-3 pt-2 border-t border-[#E0E0E0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B0F19] block">
                Model Hyperparameters
              </span>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0B0F19]">Temperature</span>
                  <span className="text-xs font-mono text-[#00338D] font-bold">
                    {nodeData.config?.temperature ?? 0.2}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={nodeData.config?.temperature ?? 0.2}
                  onChange={(e) => {
                    onUpdateNodeData(selectedNode.id, {
                      config: { ...nodeData.config, temperature: parseFloat(e.target.value) }
                    });
                  }}
                  className="w-full accent-[#00338D]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0B0F19]">Top-P</span>
                  <span className="text-xs font-mono text-[#00338D] font-bold">
                    {nodeData.config?.topP ?? 0.95}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={nodeData.config?.topP ?? 0.95}
                  onChange={(e) => {
                    onUpdateNodeData(selectedNode.id, {
                      config: { ...nodeData.config, topP: parseFloat(e.target.value) }
                    });
                  }}
                  className="w-full accent-[#00338D]"
                />
              </div>
            </div>

            {/* Provider Capability Overview */}
            <div className="p-3 bg-[#F5F6F8] border border-[#E0E0E0] text-[11px] text-[#666666] leading-relaxed">
              <span className="font-bold text-[#0B0F19] block mb-1">Provider Capabilities:</span>
              {currentProvider === 'google' && 'Native multimodal audio ingestion (MP3), 1M-2M context window, fast JSON schema generation.'}
              {currentProvider === 'anthropic' && 'State-of-the-art analytical reasoning, nuanced long-form output, structured artifacts.'}
              {currentProvider === 'openai' && 'Flagship GPT-4o reasoning, strict JSON schema mode, widespread enterprise SDK compatibility.'}
              {currentProvider === 'ollama' && 'Private offline execution on local GPU/CPU. Complete compliance for confidential meetings.'}
              {currentProvider === 'openrouter' && 'Unified API gateway routing across 200+ models with automatic load balancing.'}
            </div>
          </div>
        ) : (
          /* Generic Inspector for other Pillars */
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] block mb-1">
                Pillar Category
              </span>
              <div className="p-2.5 bg-[#F5F6F8] border border-[#E0E0E0] flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B0F19] capitalize">{nodeData.pillarType}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFFFFF] text-[#00338D] border border-[#00338D]/20 font-bold">
                  Socket: {pillarDef?.socketId}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B0F19] block mb-1.5">
                Block Display Name
              </label>
              <input
                type="text"
                value={nodeData.name}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { name: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#F5F6F8] border border-[#E0E0E0] text-xs text-[#0B0F19] focus:outline-none focus:border-[#00338D]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B0F19] block mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={nodeData.description}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { description: e.target.value })}
                className="w-full p-2.5 bg-[#F5F6F8] border border-[#E0E0E0] text-xs text-[#0B0F19] leading-relaxed focus:outline-none focus:border-[#00338D] resize-none"
              />
            </div>

            {nodeData.config && Object.keys(nodeData.config).length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[#E0E0E0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B0F19] block">
                  Configuration Properties
                </span>
                {Object.entries(nodeData.config).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-[11px] font-mono text-[#666666] block mb-1">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={String(val)}
                      onChange={(e) => {
                        const newConfig = { ...nodeData.config, [key]: e.target.value };
                        onUpdateNodeData(selectedNode.id, { config: newConfig });
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#F5F6F8] border border-[#E0E0E0] text-xs text-[#0B0F19] font-mono focus:outline-none focus:border-[#00338D]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
