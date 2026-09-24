import React, { useEffect, useState } from 'react';
import { Boxes, Wrench, Radio, Scale, Bot, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RegistryViewerProps {
  registryType: 'models' | 'tools' | 'mcp' | 'policies' | 'agents';
}

export const RegistryViewer: React.FC<RegistryViewerProps> = ({ registryType }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-arc-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-arc-surface border border-arc-border flex items-center justify-center text-blue-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{meta.title}</h1>
            <p className="text-xs text-gray-400">{meta.subtitle}</p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded bg-arc-surface border border-arc-border text-gray-300">
          {items.length} Registered Items
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading registry items...</div>
      ) : (
        <div className="border border-arc-border rounded-xl bg-arc-surface overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-arc-card/70 border-b border-arc-border text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Name / ID</th>
                <th className="py-3 px-4">Type / Provider</th>
                <th className="py-3 px-4">Data Classification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arc-border/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-arc-card/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[10px] font-mono text-gray-400">{item.id}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-300">
                    {item.provider || item.executionType || item.transport || item.sourceAuthority || item.role}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.securityClassification || item.permittedClassification || item.permittedDataClassification || 'INTERNAL'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.lifecycleStatus || item.healthStatus || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-400">
                    {item.version || '1.0.0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
