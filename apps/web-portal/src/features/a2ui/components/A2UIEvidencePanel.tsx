import React from 'react';
import { ShieldCheck, Scale, BookOpen, CheckCircle2 } from 'lucide-react';

interface Clause {
  clauseId: string;
  text: string;
}

export interface A2UIEvidencePanelProps {
  title: string;
  policyName: string;
  recommendation: string;
  confidenceScore?: number;
  clauses?: Clause[];
}

export const A2UIEvidencePanel: React.FC<A2UIEvidencePanelProps> = ({
  title,
  policyName,
  recommendation,
  confidenceScore = 0.95,
  clauses = []
}) => {
  const percentage = Math.round(confidenceScore * 100);

  return (
    <div className="p-5 rounded-xl border border-blue-500/40 bg-arc-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-400" />
          <span>{title}</span>
        </h4>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
            {recommendation}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="md:col-span-2 p-3 rounded-lg bg-arc-surface border border-arc-border space-y-1">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Governing Statutory Policy</span>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>{policyName}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-arc-surface border border-arc-border space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-semibold">
            <span>Model Reasoning Confidence</span>
            <span className="text-white font-mono font-bold">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Statutory Clauses List */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
          Applicable Statutory Legal Clauses ({clauses.length})
        </span>

        <div className="space-y-2">
          {clauses.map((c, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-arc-surface/60 border border-arc-border space-y-1.5 text-xs"
            >
              <div className="flex items-center gap-2 text-blue-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>[{c.clauseId}]</span>
              </div>
              <p className="text-gray-300 leading-relaxed pl-5">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
