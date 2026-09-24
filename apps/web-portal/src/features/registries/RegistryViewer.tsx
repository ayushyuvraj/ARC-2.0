import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Wrench,
  Radio,
  Scale,
  Bot,
  Plus,
  Play,
  Activity,
  AlertTriangle,
  CheckCircle,
  X,
  Power
} from 'lucide-react';

interface RegistryViewerProps {
  registryType: 'models' | 'tools' | 'mcp' | 'policies' | 'agents';
}

export const RegistryViewer: React.FC<RegistryViewerProps> = ({ registryType }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [impactWarning, setImpactWarning] = useState<any>(null);

  // Form states for creation
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProvider, setNewProvider] = useState('AZURE_OPENAI');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newExecType, setNewExecType] = useState('INTERNAL_FUNCTION');
  const [newEndpoint, setNewEndpoint] = useState('');

  const fetchItems = () => {
    setLoading(true);
    fetch(`/api/v1/registries/${registryType}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItems(data.data);
        }
      })
      .catch((err) => console.error('Failed to load registry:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
    setTestResult(null);
    setImpactWarning(null);
  }, [registryType]);

  const titles: Record<string, { title: string; subtitle: string; icon: any }> = {
    models: { title: 'Foundation Model Registry', subtitle: 'Governed LLM providers, parameter limits, security certifications and token costs.', icon: Boxes },
    tools: { title: 'Deterministic Tool Registry', subtitle: 'Deterministic calculation engines, SQL query runners, and sandboxed code execution.', icon: Wrench },
    mcp: { title: 'Model Context Protocol (MCP) Servers', subtitle: 'Enterprise connections providing tools, resources, and contextual knowledge to agents.', icon: Radio },
    policies: { title: 'Institutional Policy Registry', subtitle: 'Authoritative legal, tax, and governance rules with verified provenance and effective dates.', icon: Scale },
    agents: { title: 'Composable Agent Registry', subtitle: 'Autonomous reasoning identities referencing shared models, tools, skills, and memory.', icon: Bot }
  };

  const meta = titles[registryType] || titles.models;
  const Icon = meta.icon;

  // Toggle Lifecycle Status (with impact analysis if disabling)
  const handleToggleStatus = async (item: any) => {
    const isCurrentlyActive = (item.lifecycleStatus || 'ACTIVE') === 'ACTIVE';
    const nextStatus = isCurrentlyActive ? 'DISABLED' : 'ACTIVE';

    if (nextStatus === 'DISABLED') {
      // Calculate blast radius first
      try {
        const impRes = await fetch('/api/v1/dependencies/impact-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceId: item.id,
            resourceType: registryType === 'models' ? 'MODEL' : 'TOOL'
          })
        });
        const impData = await impRes.json();
        if (impData.success) {
          setImpactWarning({ item, nextStatus, impact: impData.data });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    applyStatusChange(item.id, nextStatus);
  };

  const applyStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/registries/${registryType}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, justification: 'Toggled via ARC Registry Console' })
      });
      const data = await res.json();
      if (data.success) {
        setImpactWarning(null);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run Test Ping / Execution
  const handleTestItem = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      let endpoint = '';
      if (registryType === 'models') endpoint = `/api/v1/registries/models/${id}/test-ping`;
      else if (registryType === 'tools') endpoint = `/api/v1/registries/tools/${id}/test-exec`;
      else if (registryType === 'mcp') endpoint = `/api/v1/registries/mcp/${id}/discover`;

      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setTestResult(data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingId(null);
    }
  };

  // Create New Component
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    let body: any = {};
    if (registryType === 'models') {
      body = {
        name: newName,
        provider: newProvider,
        modelIdentifier: newIdentifier,
        endpoint: newEndpoint || 'https://api.arc.local/v1/models',
        contextWindowTokens: 128000,
        maxOutputTokens: 4096,
        securityClassification: 'RESTRICTED'
      };
    } else if (registryType === 'tools') {
      body = {
        name: newName,
        description: newDesc,
        executionType: newExecType,
        isDeterministic: true,
        timeoutMs: 30000,
        permittedClassification: 'RESTRICTED'
      };
    } else if (registryType === 'mcp') {
      body = {
        name: newName,
        endpoint: newEndpoint,
        transport: 'SSE'
      };
    }

    try {
      const res = await fetch(`/api/v1/registries/${registryType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewName('');
        setNewDesc('');
        setNewIdentifier('');
        setNewEndpoint('');
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-arc-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-arc-surface border border-arc-border flex items-center justify-center text-blue-400 shadow">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{meta.title}</h1>
            <p className="text-xs text-gray-400">{meta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono px-3 py-1 rounded bg-arc-surface border border-arc-border text-gray-300">
            {items.length} Items Registered
          </span>
          {['models', 'tools', 'mcp'].includes(registryType) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Test Execution Result Banner */}
      {testResult && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>Diagnostic Test Succeeded: {testResult.status || 'OK'}</span>
            </div>
            <pre className="text-[11px] font-mono text-gray-300 mt-1 max-h-32 overflow-y-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
          <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading registry items...</div>
      ) : (
        <div className="border border-arc-border rounded-xl bg-arc-surface overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-arc-card/70 border-b border-arc-border text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Name / ID</th>
                <th className="py-3 px-4">Type / Provider</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arc-border/60">
              {items.map((item) => {
                const isActive = (item.lifecycleStatus || item.healthStatus || 'ACTIVE') === 'ACTIVE';

                return (
                  <tr key={item.id} className="hover:bg-arc-card/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{item.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{item.id}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-300">
                      {item.provider || item.executionType || item.transport || item.sourceAuthority || item.role}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        {item.securityClassification || item.permittedClassification || item.permittedDataClassification || 'INTERNAL'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {item.lifecycleStatus || item.healthStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {['models', 'tools', 'mcp'].includes(registryType) && (
                        <button
                          onClick={() => handleTestItem(item.id)}
                          disabled={testingId === item.id || !isActive}
                          className="px-2.5 py-1 rounded bg-arc-card hover:bg-arc-border border border-arc-border text-[11px] text-gray-300 font-medium disabled:opacity-40 transition-colors"
                        >
                          {testingId === item.id ? 'Testing...' : registryType === 'models' ? 'Ping' : 'Test Run'}
                        </button>
                      )}

                      {['models', 'tools', 'mcp', 'policies', 'agents'].includes(registryType) && (
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                            isActive
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Downstream Blast Radius Warning Modal */}
      {impactWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-arc-surface border border-red-500/40 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start space-x-3 text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-white">Downstream Blast Radius Warning</h3>
                <p className="text-xs text-gray-300 mt-1">
                  You are about to disable <strong>{impactWarning.item.name}</strong>. ARC has calculated the downstream impact:
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-arc-card border border-arc-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Assessment:</span>
                <span className="font-bold text-red-400 uppercase">{impactWarning.impact.riskLevel}</span>
              </div>
              <p className="text-gray-300">{impactWarning.impact.impactSummary}</p>
              <div className="pt-2 border-t border-arc-border text-[11px] space-y-1">
                <div>
                  <span className="text-gray-400">Impacted Applications: </span>
                  <span className="text-blue-400 font-semibold">
                    {impactWarning.impact.affectedApplications.map((a: any) => a.name).join(', ') || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Production Deployments: </span>
                  <span className="text-red-400 font-semibold">
                    {impactWarning.impact.affectedDeployments.map((d: any) => `${d.target} (${d.environment})`).join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setImpactWarning(null)}
                className="px-4 py-2 rounded-lg bg-arc-card border border-arc-border text-xs text-gray-300 hover:text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => applyStatusChange(impactWarning.item.id, impactWarning.nextStatus)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs text-white font-semibold shadow-lg shadow-red-500/20"
              >
                Acknowledge & Disable Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register New Component */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-arc-surface border border-arc-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-arc-border">
              <h3 className="font-bold text-sm text-white">Register New {registryType.slice(0, -1).toUpperCase()}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Gemini 1.5 Flash or Tolerance Checker"
                  className="w-full bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {registryType === 'models' && (
                <>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Provider</label>
                    <select
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      className="w-full bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="AZURE_OPENAI">Azure OpenAI</option>
                      <option value="VERTEX_AI">Google Cloud Vertex AI</option>
                      <option value="ANTHROPIC">Anthropic</option>
                      <option value="LOCAL_MOCK">ARC Local Simulated Provider</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Model Identifier</label>
                    <input
                      type="text"
                      required
                      value={newIdentifier}
                      onChange={(e) => setNewIdentifier(e.target.value)}
                      placeholder="e.g. gpt-4o-mini or gemini-1.5-flash"
                      className="w-full bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {registryType === 'tools' && (
                <>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Execution Type</label>
                    <select
                      value={newExecType}
                      onChange={(e) => setNewExecType(e.target.value)}
                      className="w-full bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="INTERNAL_FUNCTION">Internal Deterministic Function</option>
                      <option value="DETERMINISTIC_BINARY">High-Speed Binary Engine (DuckDB/SQL)</option>
                      <option value="PYTHON_SANDBOX">Python Sandbox Worker</option>
                      <option value="REST_API">External REST API</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Description</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="What mathematical or deterministic logic does this tool execute?"
                      className="w-full bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-16"
                    />
                  </div>
                </>
              )}

              {registryType === 'mcp' && (
                <div>
                  <label className="text-gray-300 font-medium block mb-1">Server Endpoint URL</label>
                  <input
                    type="text"
                    required
                    value={newEndpoint}
                    onChange={(e) => setNewEndpoint(e.target.value)}
                    placeholder="https://mcp-server.enterprise.local/sse"
                    className="w-full bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-arc-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-arc-card border border-arc-border text-gray-300 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow"
                >
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
