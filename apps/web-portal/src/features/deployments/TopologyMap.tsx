import React, { useEffect, useState } from 'react';
import { Cloud, ShieldCheck, Cpu, ArrowUpRight, Activity, Lock, Layers } from 'lucide-react';

export const TopologyMap: React.FC = () => {
  const [topology, setTopology] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/deployments/topology')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTopology(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading multi-cloud topology...</div>;
  }

  if (!topology) {
    return <div className="p-8 text-center text-xs text-rose-400">Failed to load topology map.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Mesh Status Banner */}
      <div className="p-4 rounded-xl border border-arc-border bg-arc-surface/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Global Cloud Fabric</span>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Decoupled Execution Planes & Enclave Mesh
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Zero direct vendor coupling. Runtimes, agents, and deterministic engines deploy agnostically across sovereign and commercial targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400">Inter-Cloud Connectivity</span>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{topology.crossCloudConnectivity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topology.clouds?.map((cloud: any) => (
          <div
            key={cloud.provider}
            className="p-5 rounded-xl border border-arc-border bg-arc-card space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">{cloud.providerName}</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {cloud.healthStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Region:</span>
                  <span className="font-mono text-white font-medium">{cloud.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network Perimeter:</span>
                  <span className="font-mono text-blue-300 text-[11px] truncate max-w-[180px]">
                    {cloud.networkPerimeter}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Egress Boundary:</span>
                  <span className="font-mono text-amber-300 text-[11px]">{cloud.egressPolicy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Uptime:</span>
                  <span className="font-mono text-emerald-400 font-bold">{cloud.uptimePercentage}%</span>
                </div>
              </div>
            </div>

            {/* Target & Workload Status */}
            <div className="pt-3 border-t border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-400 text-[11px]">
                <span>Registered Target Plane:</span>
                <span className="font-mono text-white font-semibold">
                  {cloud.targets[0]?.id || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Active Workloads:</span>
                <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/60 text-blue-300 font-bold">
                  {cloud.targets[0]?.deployments?.length || 0} Deployed
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
