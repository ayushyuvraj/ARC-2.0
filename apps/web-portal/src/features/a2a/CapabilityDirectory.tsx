import React, { useEffect, useState } from 'react';
import { Bot, Radio, ArrowRight, Shield, Cpu, Layers } from 'lucide-react';

export const CapabilityDirectory: React.FC = () => {
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/a2a/capabilities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCapabilities(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Discovering agent capabilities...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-400" />
          <span>Registered Agent Capability Directory</span>
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Dynamic discovery of composable reasoning identities, published A2A operations, schema interfaces, and execution targets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capabilities.map((agent) => (
          <div
            key={agent.agentId}
            className="p-5 rounded-xl border border-arc-border bg-arc-card space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <h4 className="text-base font-bold text-white">{agent.agentName}</h4>
                </div>
                <span className="font-mono text-[10px] text-gray-400">{agent.agentId}</span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">{agent.role}</p>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-arc-surface border border-arc-border text-gray-300 font-mono">
                  Model: <strong className="text-white">{agent.modelName}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/60 text-blue-300 font-mono">
                  Cloud: <strong>{agent.modelProvider}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-900/60 text-amber-300 font-mono">
                  Clearance: <strong>{agent.permittedClassification}</strong>
                </span>
                {agent.a2uiEnabled && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 font-mono">
                    A2UI Surface: ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Advertised Operations */}
            <div className="pt-3 border-t border-gray-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Published A2A Operations ({agent.operations.length})
              </span>
              <div className="space-y-1.5">
                {agent.operations.map((op: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-arc-surface border border-arc-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-mono text-emerald-300 font-semibold">{op.operation}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">JSON Schema Validated</span>
                  </div>
                ))}

                {agent.operations.length === 0 && (
                  <div className="text-xs text-gray-500 italic">No public operations published yet.</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
