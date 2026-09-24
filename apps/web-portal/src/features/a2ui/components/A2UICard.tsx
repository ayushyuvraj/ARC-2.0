import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
}

export interface A2UICardProps {
  title: string;
  status?: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  metrics?: Metric[];
}

export const A2UICard: React.FC<A2UICardProps> = ({ title, status = 'INFO', metrics = [] }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            ATTENTION REQUIRED
          </span>
        );
      case 'DANGER':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            CRITICAL
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
            <Info className="w-3.5 h-3.5" />
            INFORMATIONAL
          </span>
        );
    }
  };

  return (
    <div className="p-5 rounded-xl border border-arc-border bg-arc-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-arc-border">
        <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-arc-surface border border-arc-border space-y-1">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block truncate">{m.label}</span>
            <div className="text-base font-bold text-white font-mono truncate">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
