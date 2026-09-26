import React from 'react';
import { GitCompare, AlertCircle, Check } from 'lucide-react';

interface Entity {
  title: string;
  fields: Record<string, string | number>;
}

interface Discrepancy {
  field: string;
  reason: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface A2UIComparisonPanelProps {
  title: string;
  leftEntity: Entity;
  rightEntity: Entity;
  discrepancies?: Discrepancy[];
}

export const A2UIComparisonPanel: React.FC<A2UIComparisonPanelProps> = ({
  title,
  leftEntity,
  rightEntity,
  discrepancies = []
}) => {
  const discrepancyFields = new Set(discrepancies.map((d) => d.field));

  const allFieldKeys = Array.from(
    new Set([...Object.keys(leftEntity.fields || {}), ...Object.keys(rightEntity.fields || {})])
  );

  const getSeverityBadge = (sev?: string) => {
    switch (sev) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60">HIGH VARIANCE</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60">STATUTORY TOLERANCE</span>;
    }
  };

  return (
    <div className="p-5 rounded-xl border border-arc-border bg-arc-card space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-arc-border">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-blue-400" />
          <span>{title}</span>
        </h4>
        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
          {discrepancies.length} DISCREPANCIES DETECTED
        </span>
      </div>

      {/* Side-by-Side Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Entity */}
        <div className="p-4 rounded-lg bg-arc-surface border border-arc-border space-y-3">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider pb-2 border-b border-gray-800">
            {leftEntity.title}
          </div>
          <div className="space-y-2 text-xs">
            {allFieldKeys.map((key) => {
              const val = leftEntity.fields[key];
              const isDiff = discrepancyFields.has(key);
              return (
                <div
                  key={key}
                  className={`flex justify-between items-center p-2 rounded ${
                    isDiff ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-black/20'
                  }`}
                >
                  <span className="text-gray-400">{key}:</span>
                  <span className={`font-mono font-medium ${isDiff ? 'text-amber-300 font-bold' : 'text-white'}`}>
                    {val !== undefined ? String(val) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Entity */}
        <div className="p-4 rounded-lg bg-arc-surface border border-arc-border space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-2 border-b border-gray-800">
            {rightEntity.title}
          </div>
          <div className="space-y-2 text-xs">
            {allFieldKeys.map((key) => {
              const val = rightEntity.fields[key];
              const isDiff = discrepancyFields.has(key);
              return (
                <div
                  key={key}
                  className={`flex justify-between items-center p-2 rounded ${
                    isDiff ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-black/20'
                  }`}
                >
                  <span className="text-gray-400">{key}:</span>
                  <span className={`font-mono font-medium ${isDiff ? 'text-amber-300 font-bold' : 'text-white'}`}>
                    {val !== undefined ? String(val) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Discrepancy Diagnostics */}
      {discrepancies.length > 0 && (
        <div className="p-4 rounded-lg bg-black/40 border border-arc-border space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Agent Discrepancy Analysis & Root Causes
          </span>
          <div className="space-y-1.5">
            {discrepancies.map((d, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-arc-surface text-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold text-white">{d.field}:</span>
                  <span className="text-gray-300">{d.reason}</span>
                </div>
                {getSeverityBadge(d.severity)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
