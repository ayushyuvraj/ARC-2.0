import React, { useState } from 'react';
import { Network, AlertOctagon, CheckCircle2, ChevronRight, ShieldAlert, Cpu } from 'lucide-react';

export const ImpactViewer: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState('model_gpt4o');
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const candidates = [
    { id: 'model_gpt4o', type: 'MODEL', name: 'OpenAI GPT-4o (Used by Matching Agent)' },
    { id: 'model_gemini15pro', type: 'MODEL', name: 'Google Gemini 1.5 Pro (Used by Tax Policy Agent)' },
    { id: 'tool_exact_matcher', type: 'TOOL', name: 'Deterministic Hash Matcher (Used by TARS Workflow)' },
    { id: 'policy_kpmg_tax_v12', type: 'POLICY', name: 'KPMG Institutional Tax Guidelines v12' }
  ];

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const candidate = candidates.find((c) => c.id === selectedResource);
      const res = await fetch('/api/v1/dependencies/impact-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: selectedResource,
          resourceType: candidate?.type || 'MODEL'
        })
      });
      const data = await res.json();
      if (data.success) {
        setImpactData(data.data);
      }
    } catch (err) {
      console.error('Impact analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="pb-6 border-b border-arc-border space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
          <Network className="w-6 h-6 text-indigo-400" />
          <span>Dependency Graph & Blast Radius Engine</span>
        </h1>
        <p className="text-xs text-gray-400">
          Compute downstream enterprise blast-radius across all Agents, Workflows, Use Cases, and Production Deployments before modifying or disabling shared components.
        </p>
      </div>

      {/* Simulator Selector Card */}
      <div className="p-6 rounded-xl border border-arc-border bg-arc-surface space-y-4">
        <label className="text-xs font-semibold text-gray-300 block">
          Select Shared Enterprise Resource to Simulate Disabling:
        </label>
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={selectedResource}
            onChange={(e) => {
              setSelectedResource(e.target.value);
              setImpactData(null);
            }}
            className="flex-1 bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.type}] {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? <span>Calculating...</span> : <span>Compute Blast Radius</span>}
          </button>
        </div>
      </div>

      {/* Results View */}
      {impactData && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-xl border flex items-start space-x-4 ${
              impactData.riskLevel === 'CRITICAL'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <AlertOctagon className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm uppercase tracking-wider">
                  Risk Level: {impactData.riskLevel}
                </span>
                {impactData.requiresGovernanceApproval && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 font-semibold text-red-300">
                    Mandatory Governance Approval Gate Triggered
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-200">{impactData.impactSummary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-arc-border bg-arc-surface space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Impacted Agents</span>
              <div className="space-y-1">
                {impactData.affectedAgents.map((a: any) => (
                  <div key={a.id} className="text-xs text-white font-medium">
                    • {a.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-arc-border bg-arc-surface space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Impacted Workflows</span>
              <div className="space-y-1">
                {impactData.affectedWorkflows.map((w: any) => (
                  <div key={w.id} className="text-xs text-white font-medium">
                    • {w.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-arc-border bg-arc-surface space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Impacted Applications</span>
              <div className="space-y-1">
                {impactData.affectedApplications.map((app: any) => (
                  <div key={app.id} className="text-xs text-blue-400 font-semibold">
                    • {app.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-arc-border bg-arc-surface space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Production Deployments</span>
              <div className="space-y-1">
                {impactData.affectedDeployments.map((d: any) => (
                  <div key={d.id} className="text-xs text-red-400 font-semibold">
                    • {d.target} ({d.environment})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
