import React, { useEffect, useState } from 'react';
import { Cloud, ShieldCheck, Activity, Send, Plus, CheckCircle2, AlertTriangle, X, Terminal, Radio } from 'lucide-react';

export const TargetManager: React.FC = () => {
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pingResult, setPingResult] = useState<any>(null);
  const [pingingId, setPingingId] = useState<string | null>(null);

  // New Deployment Form
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState('app_tars');
  const [selectedTarget, setSelectedTarget] = useState('target_gcc');
  const [selectedEnv, setSelectedEnv] = useState<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'>('DEVELOPMENT');
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  const fetchTargets = () => {
    setLoading(true);
    fetch('/api/v1/deployments/targets')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTargets(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handlePing = async (targetId: string) => {
    setPingingId(targetId);
    setPingResult(null);
    try {
      const res = await fetch(`/api/v1/deployments/targets/${targetId}/ping`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setPingResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPingingId(null);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setDeployError(null);
    try {
      const res = await fetch('/api/v1/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp,
          targetId: selectedTarget,
          environment: selectedEnv,
          version: '1.0.0'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowDeployModal(false);
        fetchTargets();
        alert(`Application successfully deployed to ${selectedTarget} [${selectedEnv}]!`);
      } else {
        setDeployError(data.error?.message || 'Deployment failed');
      }
    } catch (err: any) {
      setDeployError(err.message);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Target Plane Registry & Provider Adapters</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Pluggable adapter interfaces for sovereign enclaves, public clouds, and local air-gapped sandboxes.
          </p>
        </div>

        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Application Workload</span>
        </button>
      </div>

      {/* Targets Table */}
      <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-arc-border bg-arc-surface/60 text-gray-300">
              <th className="py-3 px-4 font-semibold text-white">Target Plane</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Type & Region</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Security Boundary</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Active Workloads</th>
              <th className="py-3 px-4 font-semibold text-gray-300 text-center">Diagnostic Ping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arc-border/60">
            {targets.map((t) => (
              <tr key={t.id} className="hover:bg-arc-surface/30 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="font-mono text-[10px] text-gray-500">{t.id}</div>
                  {t.isSimulated && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      SIMULATED EXECUTION PLANE
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-mono text-blue-300 font-semibold">{t.type}</div>
                  <div className="text-[10px] text-gray-400">{t.region}</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-gray-300">
                  {t.networkSecurityBoundary}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {t.healthStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">
                  {t.activeWorkloadsCount} Applications
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    disabled={pingingId === t.id}
                    onClick={() => handlePing(t.id)}
                    className="px-3 py-1.5 rounded-md bg-arc-surface hover:bg-arc-card text-blue-400 hover:text-white border border-arc-border text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Activity className={`w-3.5 h-3.5 ${pingingId === t.id ? 'animate-spin' : ''}`} />
                    <span>{pingingId === t.id ? 'Testing...' : 'Diagnostic Ping'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diagnostic Ping Output Drawer / Modal */}
      {pingResult && (
        <div className="p-5 rounded-xl border border-blue-500/40 bg-arc-surface space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Cloud Provider Diagnostic Handshake</h4>
              <span className="font-mono text-xs text-blue-400 font-bold">{pingResult.targetName}</span>
            </div>
            <button
              onClick={() => setPingResult(null)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>

          {/* Rule 1 Simulated Banner */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs font-mono">
            {pingResult.simulationNotice}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-black/40 border border-arc-border">
              <span className="text-gray-400 text-[10px] uppercase font-semibold">Adapter Status</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{pingResult.status}</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-arc-border">
              <span className="text-gray-400 text-[10px] uppercase font-semibold">Round-Trip Latency</span>
              <div className="text-base font-bold text-white mt-0.5 font-mono">{pingResult.latencyMs}ms</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-arc-border">
              <span className="text-gray-400 text-[10px] uppercase font-semibold">TLS Protocol</span>
              <div className="text-base font-bold text-white mt-0.5 font-mono">{pingResult.securityHandshake.tlsVersion}</div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-arc-border">
              <span className="text-gray-400 text-[10px] uppercase font-semibold">Mutual TLS (mTLS)</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {pingResult.securityHandshake.mutualTlsEnforced ? 'ENFORCED' : 'OPTIONAL'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-arc-border space-y-1 text-xs">
            <div className="text-gray-400">Certificate Authority Issuer:</div>
            <div className="text-white font-mono text-[11px]">{pingResult.securityHandshake.certificateIssuer}</div>
            {pingResult.securityHandshake.hsmKeyId && (
              <div className="pt-1 text-emerald-400 font-mono text-[11px]">
                Hardware Security Module (HSM) Vault ID: {pingResult.securityHandshake.hsmKeyId}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleDeploy} className="bg-[#111827] border border-arc-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-arc-border">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                <span>Deploy Application Workload</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDeployModal(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {deployError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                {deployError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Application Workload:</label>
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="app_tars">TARS 2.0 (Indirect Tax Reconciliation)</option>
                <option value="app_matching">Matching Intelligence Platform</option>
                <option value="app_ppt">Pitchbook & Presentation Preparation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Target Cloud Execution Plane:</label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="target_gcc">KPMG Sovereign GCC Enclave (Frankfurt Private VPC)</option>
                <option value="target_azure">Azure Commercial Execution Plane (East US 2)</option>
                <option value="target_vertex">Google Cloud Vertex AI (US Central 1)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Environment Tier:</label>
              <select
                value={selectedEnv}
                onChange={(e) => setSelectedEnv(e.target.value as any)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="DEVELOPMENT">DEVELOPMENT (Fast iteration)</option>
                <option value="STAGING">STAGING (Pre-production soak)</option>
                <option value="PRODUCTION">PRODUCTION (Requires signed governance approval)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-arc-border">
              <button
                type="button"
                onClick={() => setShowDeployModal(false)}
                className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deploying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-md"
              >
                {deploying ? 'Deploying...' : 'Confirm Deployment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
