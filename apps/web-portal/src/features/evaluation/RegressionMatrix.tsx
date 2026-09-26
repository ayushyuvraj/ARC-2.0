import React, { useEffect, useState } from 'react';
import { Gauge, CheckCircle2, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Zap, DollarSign, Clock, Sparkles } from 'lucide-react';

export const RegressionMatrix: React.FC = () => {
  const [matrix, setMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/evaluations/regression-matrix')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMatrix(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading regression matrix...</div>;
  }

  if (!matrix) {
    return <div className="p-8 text-center text-xs text-rose-400">Failed to load regression matrix.</div>;
  }

  const { variantA, variantB, deltas, recommendation, rationale, experimentId, datasetName } = matrix;

  return (
    <div className="space-y-8">
      {/* Experiment Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-arc-border bg-arc-surface/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400">{experimentId}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
              A/B REGRESSION BENCHMARK
            </span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Evaluating against: <strong className="text-white">{datasetName}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-gray-400">Authoritative Verdict</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{recommendation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variant A (Baseline) */}
        <div className="p-6 rounded-xl border border-gray-700 bg-arc-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Baseline (Variant A)</span>
              <h3 className="text-base font-bold text-white mt-0.5">{variantA.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-gray-800 text-gray-300 border border-gray-700">
              {variantA.model}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-arc-surface border border-arc-border space-y-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Accuracy Score</span>
              <div className="text-xl font-bold text-white">{variantA.accuracyScore}%</div>
              <span className="text-[10px] text-gray-500">{variantA.passedCases} of {variantA.totalCases} cases passed</span>
            </div>

            <div className="p-3 rounded-lg bg-arc-surface border border-arc-border space-y-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Hallucination Rate</span>
              <div className="text-xl font-bold text-amber-400">{variantA.hallucinationRate}%</div>
              <span className="text-[10px] text-gray-500">Unverified assertions</span>
            </div>

            <div className="p-3 rounded-lg bg-arc-surface border border-arc-border space-y-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Policy Adherence</span>
              <div className="text-xl font-bold text-blue-400">{variantA.policyAdherenceScore}%</div>
              <span className="text-[10px] text-gray-500">KPMG Tax Policy v12</span>
            </div>

            <div className="p-3 rounded-lg bg-arc-surface border border-arc-border space-y-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">P50 / P95 Latency</span>
              <div className="text-xl font-bold text-white">{variantA.latencyP50Ms}ms</div>
              <span className="text-[10px] text-gray-500">P95: {variantA.latencyP95Ms}ms</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-xs">
            <span className="text-gray-400">Cost per 1,000 Transactions:</span>
            <span className="font-mono font-bold text-white">${variantA.costPer1kRunsUsd.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Variant B (Candidate) */}
        <div className="p-6 rounded-xl border border-blue-500/40 bg-arc-card space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            CHALLENGER CANDIDATE
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Candidate (Variant B)</span>
              <h3 className="text-base font-bold text-white mt-0.5">{variantB.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-blue-950/60 text-blue-300 border border-blue-800/60">
              {variantB.model}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-arc-surface border border-blue-500/30 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Accuracy Score</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {deltas.accuracy}
                </span>
              </div>
              <div className="text-xl font-bold text-emerald-400">{variantB.accuracyScore}%</div>
              <span className="text-[10px] text-gray-400">{variantB.passedCases} of {variantB.totalCases} cases passed</span>
            </div>

            <div className="p-3 rounded-lg bg-arc-surface border border-blue-500/30 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Hallucination Rate</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  {deltas.hallucination}
                </span>
              </div>
              <div className="text-xl font-bold text-emerald-400">{variantB.hallucinationRate}%</div>
              <span className="text-[10px] text-gray-400">Significant drop in false claims</span>
            </div>

            <div className="p-3 rounded-lg bg-arc-surface border border-blue-500/30 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Policy Adherence</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {deltas.policyAdherence}
                </span>
              </div>
              <div className="text-xl font-bold text-white">{variantB.policyAdherenceScore}%</div>
              <span className="text-[10px] text-gray-400">Zero policy violations</span>
            </div>

            <div className="p-3 rounded-lg bg-arc-surface border border-blue-500/30 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">P50 / P95 Latency</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  {deltas.latencyP50}
                </span>
              </div>
              <div className="text-xl font-bold text-white">{variantB.latencyP50Ms}ms</div>
              <span className="text-[10px] text-gray-400">P95: {variantB.latencyP95Ms}ms</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-xs">
            <span className="text-gray-400">Cost per 1,000 Transactions:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{deltas.cost}</span>
              <span className="font-mono font-bold text-white">${variantB.costPer1kRunsUsd.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale & Promotion Action Box */}
      <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white text-sm">Automated Promotion Recommendation</h4>
            <p className="text-gray-300 leading-relaxed">{rationale}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => alert('Promotion Request created in Approvals Queue! CISO sign-off requested.')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-colors"
          >
            <span>Promote Variant B to Production</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
