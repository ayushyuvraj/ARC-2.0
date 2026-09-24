import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Play,
  GitFork,
  Cloud,
  Shield,
  Layers,
  CheckCircle,
  Clock,
  ExternalLink,
  Cpu,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

interface AppDetailProps {
  appSlug: string;
  onBack: () => void;
  onStartRun: (appId: string, useCaseId: string) => void;
}

export const AppDetail: React.FC<AppDetailProps> = ({ appSlug, onBack, onStartRun }) => {
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/applications/${appSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApp(data.data);
        }
      })
      .catch((err) => console.error('Failed to load application:', err))
      .finally(() => setLoading(false));
  }, [appSlug]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400">
        Loading application details...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-12 text-center text-xs text-red-400">
        Application '{appSlug}' not found.
      </div>
    );
  }

  const primaryUseCase = app.useCases?.[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-arc-surface border border-arc-border shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow"
                style={{ backgroundColor: app.branding?.primaryColor || '#2563EB' }}
              >
                {app.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-white">{app.name}</h1>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {app.lifecycleStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  {app.businessUnit} • {app.domain} • Owner: {app.owner}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl">{app.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            {primaryUseCase && (
              <button
                onClick={() => onStartRun(app.id, primaryUseCase.id)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Tax Reconciliation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Use Cases & Multi-Cloud Execution Planes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Use Cases */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Executable Business Capabilities (Use Cases)
          </h2>

          <div className="space-y-4">
            {app.useCases?.map((uc: any) => (
              <div
                key={uc.id}
                className="p-6 rounded-xl border border-arc-border bg-arc-surface hover:border-gray-600 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{uc.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{uc.businessPurpose}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    {uc.dataClassification}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-arc-card/50 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Workflow Engine:</span>
                    <span className="font-medium text-gray-200">wf_tars_recon_v2 (DAG)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Deterministic Engine:</span>
                    <span className="font-medium text-emerald-400">DuckDB Matcher (85%+)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Agents Attached:</span>
                    <span className="font-medium text-blue-400">Matching + Tax Policy (A2A)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-arc-border text-xs">
                  <div className="flex items-center space-x-1.5 text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Statutory Tax Policy v12 Validated</span>
                  </div>
                  <button
                    onClick={() => onStartRun(app.id, uc.id)}
                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                  >
                    <span>Launch Run</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Multi-Cloud Execution Topology */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Multi-Cloud Execution Topology
          </h2>

          <div className="p-6 rounded-xl border border-arc-border bg-arc-surface space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-arc-border">
              <span className="font-semibold text-gray-200">Deployment Target</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                SIMULATED
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-arc-card border border-arc-border/60 space-y-1">
                <div className="flex items-center justify-between font-medium text-gray-200">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span>TARS Orchestrator</span>
                  </span>
                  <span className="text-[11px] text-indigo-400">KPMG GCC Core</span>
                </div>
                <p className="text-[10px] text-gray-400">Private enterprise cloud VPC (Frankfurt)</p>
              </div>

              <div className="p-3 rounded-lg bg-arc-card border border-arc-border/60 space-y-1">
                <div className="flex items-center justify-between font-medium text-gray-200">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-blue-400" />
                    <span>Matching Agent</span>
                  </span>
                  <span className="text-[11px] text-blue-400">Azure OpenAI</span>
                </div>
                <p className="text-[10px] text-gray-400">Model: GPT-4o (East US 2)</p>
              </div>

              <div className="p-3 rounded-lg bg-arc-card border border-arc-border/60 space-y-1">
                <div className="flex items-center justify-between font-medium text-gray-200">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tax Policy Agent</span>
                  </span>
                  <span className="text-[11px] text-emerald-400">GCP Vertex AI</span>
                </div>
                <p className="text-[10px] text-gray-400">Model: Gemini 1.5 Pro (US Central)</p>
              </div>
            </div>

            <div className="pt-2 border-t border-arc-border text-[11px] text-gray-400">
              <span className="text-amber-400 font-semibold block mb-0.5">Heterogeneous A2A Fabric</span>
              Cross-cloud latency simulated at ~45ms with full OpenTelemetry child span propagation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
