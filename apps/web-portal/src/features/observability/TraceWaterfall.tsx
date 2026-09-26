import React, { useState } from 'react';
import { Clock, DollarSign, Cpu, CheckCircle2, ChevronRight, ChevronDown, Layers, Bot, Wrench, Shield } from 'lucide-react';

interface TraceWaterfallProps {
  spans: any[];
}

export const TraceWaterfall: React.FC<TraceWaterfallProps> = ({ spans }) => {
  const [selectedSpan, setSelectedSpan] = useState<any>(null);

  if (!spans || spans.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-500 bg-arc-surface rounded-xl border border-arc-border">
        No trace spans recorded for this execution.
      </div>
    );
  }

  const totalDurationMs = spans.reduce((max, s) => Math.max(max, s.durationMs || 0), 100);

  const getComponentIcon = (type: string) => {
    if (type === 'AGENT') return <Bot className="w-3.5 h-3.5 text-blue-400" />;
    if (type === 'TOOL') return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
    if (type === 'POLICY') return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
    return <Layers className="w-3.5 h-3.5 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-arc-border bg-arc-surface flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Total Spans: <strong className="text-white font-mono">{spans.length}</strong></span>
          <span className="text-gray-400">Total Tokens: <strong className="text-blue-400 font-mono">{spans.reduce((acc, s) => acc + (s.tokensTotal || 0), 0)}</strong></span>
          <span className="text-gray-400">Total Cost: <strong className="text-emerald-400 font-mono">${spans.reduce((acc, s) => acc + (s.costUsd || 0), 0).toFixed(4)}</strong></span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
          OpenTelemetry v1.28 Compatible
        </span>
      </div>

      <div className="border border-arc-border rounded-xl bg-arc-surface overflow-hidden shadow-xl">
        <div className="bg-arc-card/70 border-b border-arc-border p-3 grid grid-cols-12 text-[10px] uppercase font-bold tracking-wider text-gray-400">
          <div className="col-span-5">Component & Operation</div>
          <div className="col-span-2">Tokens</div>
          <div className="col-span-2">Cost</div>
          <div className="col-span-3 text-right">Waterfall Timeline</div>
        </div>

        <div className="divide-y divide-arc-border/60">
          {spans.map((span, idx) => {
            const barWidthPercent = Math.max(8, Math.min(100, ((span.durationMs || 10) / totalDurationMs) * 100));

            return (
              <div
                key={span.spanId || idx}
                onClick={() => setSelectedSpan(span)}
                className={`p-3 grid grid-cols-12 items-center text-xs cursor-pointer transition-colors ${
                  selectedSpan?.spanId === span.spanId ? 'bg-blue-600/15' : 'hover:bg-arc-card/40'
                }`}
              >
                <div className="col-span-5 flex items-center space-x-2 truncate pr-2">
                  {getComponentIcon(span.componentType)}
                  <span className="font-semibold text-white truncate">{span.operationName}</span>
                  <span className="text-[10px] font-mono text-gray-500">v{span.componentVersion}</span>
                </div>

                <div className="col-span-2 font-mono text-gray-300 text-[11px]">
                  {span.tokensTotal > 0 ? `${span.tokensTotal} tok` : '—'}
                </div>

                <div className="col-span-2 font-mono text-emerald-400 text-[11px]">
                  {span.costUsd > 0 ? `$${span.costUsd.toFixed(4)}` : '$0.00'}
                </div>

                <div className="col-span-3 flex items-center justify-end space-x-2">
                  <div className="w-28 bg-arc-card rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 w-12 text-right">
                    {span.durationMs}ms
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Span Detail Drawer */}
      {selectedSpan && (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-arc-surface space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-arc-border">
            <div className="flex items-center space-x-2">
              {getComponentIcon(selectedSpan.componentType)}
              <h4 className="font-bold text-white">{selectedSpan.operationName}</h4>
              <span className="text-[10px] font-mono text-gray-400">({selectedSpan.spanId})</span>
            </div>
            <button onClick={() => setSelectedSpan(null)} className="text-gray-400 hover:text-white text-xs">
              Close
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 font-mono text-[11px]">
            <div>
              <span className="text-gray-500 text-[10px] block">Duration:</span>
              <span className="text-white font-semibold">{selectedSpan.durationMs}ms</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block">Tokens (P / C):</span>
              <span className="text-blue-400 font-semibold">{selectedSpan.tokensPrompt} / {selectedSpan.tokensCompletion}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block">Cost:</span>
              <span className="text-emerald-400 font-semibold">${selectedSpan.costUsd?.toFixed(4) || '0.0000'}</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block">Status:</span>
              <span className="text-emerald-400 font-semibold">{selectedSpan.status}</span>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] font-mono block mb-1">Span Metadata & Outputs:</span>
            <pre className="p-3 rounded-lg bg-arc-card font-mono text-[10px] text-gray-300 overflow-x-auto max-h-40">
              {JSON.stringify(selectedSpan.metadata || {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
