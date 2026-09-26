import React from 'react';
import { 
  Activity, 
  DollarSign, 
  Clock, 
  Cpu, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight 
} from 'lucide-react';
import ScreenScaffold from '../common/ScreenScaffold';
import { DESIGN_CLASSES } from '../../constants/designTokens';

/**
 * ObservabilityView
 * OpenTelemetry Telemetry, Token Accounting & Cost-Benefit ROI Dashboard
 * Adheres strictly to src/design.md.
 */
export default function ObservabilityView({ activeUseCase }) {
  const spans = [
    { name: 'Gateway Rate Limiter', type: 'gateway', latencyMs: 38, status: 'pass', cost: '$0.0000' },
    { name: 'PII Redaction Policy Engine', type: 'policies', latencyMs: 82, status: 'pass', cost: '$0.0000' },
    { name: 'Episodic Memory Query', type: 'memory', latencyMs: 110, status: 'pass', cost: '$0.0001' },
    { name: 'Foundation Model Execution', type: 'model', latencyMs: 780, status: 'pass', cost: '$0.0018' },
    { name: 'Structured JSON Skill Extractor', type: 'skills', latencyMs: 45, status: 'pass', cost: '$0.0000' },
    { name: 'W3C SHA-256 Cryptographic Audit', type: 'audit', latencyMs: 24, status: 'pass', cost: '$0.0000' }
  ];

  const totalLatency = spans.reduce((sum, s) => sum + s.latencyMs, 0);

  return (
    <ScreenScaffold
      title="OpenTelemetry Telemetry & ROI Accounting"
      eyebrow="PILLARS: OBSERVABILITY & COST/BENEFIT"
      statusText="TELEMETRY LIVE"
      statusType="active"
    >
      <div className="space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-[#666666] mb-1">
              <span>Total Inference Latency</span>
              <Activity className="w-3.5 h-3.5 text-[#00338D]" />
            </div>
            <div className="text-2xl font-bold text-[#0B0F19]">{totalLatency} ms</div>
            <span className="text-[11px] text-[#009A44] font-medium flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" /> Within 2.0s SLA target
            </span>
          </div>

          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-[#666666] mb-1">
              <span>Token Consumption</span>
              <Cpu className="w-3.5 h-3.5 text-[#0091DA]" />
            </div>
            <div className="text-2xl font-bold text-[#0B0F19]">1,280 Tokens</div>
            <span className="text-[11px] text-[#666666] font-medium mt-1 block">
              345 Prompt / 935 Output
            </span>
          </div>

          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-[#666666] mb-1">
              <span>Compute Cost / Call</span>
              <DollarSign className="w-3.5 h-3.5 text-[#EAAA00]" />
            </div>
            <div className="text-2xl font-bold text-[#0B0F19]">$0.0019</div>
            <span className="text-[11px] text-[#666666] font-medium mt-1 block">
              Official live API rate card
            </span>
          </div>

          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-[#666666] mb-1">
              <span>Net ROI per Meeting</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#009A44]" />
            </div>
            <div className="text-2xl font-bold text-[#009A44]">+$43.31</div>
            <span className="text-[11px] text-[#666666] font-medium mt-1 block">
              40 mins saved @ $65/hr
            </span>
          </div>
        </div>

        {/* Trace Waterfall Breakdown */}
        <div className={DESIGN_CLASSES.card + ' p-5'}>
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] mb-4">
            <div>
              <h3 className={DESIGN_CLASSES.sectionTitle}>Per-Pillar Execution Spans (OpenTelemetry)</h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Exact millisecond breakdown across each architectural pillar socket.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#00338D]">
              Total Span: {totalLatency}ms
            </span>
          </div>

          <div className="space-y-3">
            {spans.map((span) => {
              const widthPct = Math.max(5, (span.latencyMs / totalLatency) * 100);
              return (
                <div key={span.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B0F19]">{span.name}</span>
                    <span className="font-mono text-[#666666] text-[11px]">
                      {span.latencyMs}ms ({span.cost})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F5F6F8] border border-[#E0E0E0]">
                    <div 
                      className="h-full bg-[#00338D] transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost vs Benefit Breakdown Matrix */}
        <div className="grid grid-cols-2 gap-4">
          <div className={DESIGN_CLASSES.card + ' p-5'}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B0F19] mb-3">
              Compute Cost Modeling (Per 1,000 Meetings)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E0E0E0]">
                <span className="text-[#666666]">Prompt Tokens (345k tokens)</span>
                <span className="font-mono font-bold">$0.026</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E0E0E0]">
                <span className="text-[#666666]">Completion Tokens (935k tokens)</span>
                <span className="font-mono font-bold">$1.870</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E0E0E0]">
                <span className="text-[#666666]">Vector Storage & Audit Hashes</span>
                <span className="font-mono font-bold">$0.004</span>
              </div>
              <div className="flex justify-between pt-2 text-[#0B0F19] font-bold">
                <span>Total Infrastructure Cost</span>
                <span className="font-mono text-[#00338D]">$1.90 / 1,000 meetings</span>
              </div>
            </div>
          </div>

          <div className={DESIGN_CLASSES.card + ' p-5'}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B0F19] mb-3">
              Institutional Value Realization
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E0E0E0]">
                <span className="text-[#666666]">Staff Time Saved (40 min / meeting)</span>
                <span className="font-mono font-bold">666.7 Hours</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E0E0E0]">
                <span className="text-[#666666]">Average Blended Billing Rate</span>
                <span className="font-mono font-bold">$65.00 / Hour</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E0E0E0]">
                <span className="text-[#666666]">Gross Labor Value Recaptured</span>
                <span className="font-mono font-bold text-[#009A44]">+$43,335.50</span>
              </div>
              <div className="flex justify-between pt-2 text-[#0B0F19] font-bold">
                <span>Net Enterprise Benefit</span>
                <span className="font-mono text-[#009A44]">+$43,333.60 (22,807x ROI)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenScaffold>
  );
}
