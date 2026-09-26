import React, { useEffect, useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, Zap, DollarSign, Activity, FileText } from 'lucide-react';

export const EvaluationRunBenchmark: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trigger form state
  const [variantName, setVariantName] = useState('Agent v1.2 (Gemini 1.5 Pro Candidate)');
  const [targetModel, setTargetModel] = useState('gemini-1.5-pro');
  const [targetAgent, setTargetAgent] = useState('agent_tax_policy');
  const [running, setRunning] = useState(false);
  const [latestRunResult, setLatestRunResult] = useState<any>(null);

  const fetchRuns = () => {
    fetch('/api/v1/evaluations/runs')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setRuns(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleRunBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setLatestRunResult(null);
    try {
      const res = await fetch('/api/v1/evaluations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId: 'ds_golden_tars_recon',
          variantName,
          targetModelOrVersion: targetModel,
          targetAgentId: targetAgent
        })
      });
      const data = await res.json();
      if (data.success) {
        setLatestRunResult(data.data);
        fetchRuns();
      } else {
        alert(`Error: ${data.error?.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Trigger Live Benchmark Run */}
      <div className="p-6 rounded-xl border border-arc-border bg-arc-card space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Launch Continuous Evaluation Benchmark Run</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Execute the full golden test case suite against a model, prompt variant, or agent harness to verify regressions before deployment.
          </p>
        </div>

        <form onSubmit={handleRunBenchmark} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-300">Variant Identifier / Description:</label>
            <input
              required
              type="text"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Target Foundation Model:</label>
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
              <option value="mock-deterministic">Mock Deterministic Engine</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={running}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 h-[38px] shadow-md transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Benchmarking Suite...' : 'Execute Benchmark'}</span>
          </button>
        </form>

        {/* Live Result View */}
        {latestRunResult && (
          <div className="mt-4 p-5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Evaluation Benchmark Complete:</span>
                <span className="font-mono text-emerald-300 text-xs font-bold">{latestRunResult.variantName}</span>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Accuracy: {latestRunResult.accuracyScore}% ({latestRunResult.passedCases}/{latestRunResult.totalCases} passed)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-arc-surface border border-arc-border">
                <span className="text-gray-400 text-[10px] uppercase font-semibold">Hallucination Rate</span>
                <div className="text-base font-bold text-white mt-0.5">{latestRunResult.hallucinationRate}%</div>
              </div>
              <div className="p-2.5 rounded bg-arc-surface border border-arc-border">
                <span className="text-gray-400 text-[10px] uppercase font-semibold">Policy Adherence</span>
                <div className="text-base font-bold text-white mt-0.5">{latestRunResult.policyAdherenceScore}%</div>
              </div>
              <div className="p-2.5 rounded bg-arc-surface border border-arc-border">
                <span className="text-gray-400 text-[10px] uppercase font-semibold">P50 Latency</span>
                <div className="text-base font-bold text-white mt-0.5">{latestRunResult.latencyP50Ms}ms</div>
              </div>
              <div className="p-2.5 rounded bg-arc-surface border border-arc-border">
                <span className="text-gray-400 text-[10px] uppercase font-semibold">Cost / 1k Runs</span>
                <div className="text-base font-bold text-white mt-0.5">${latestRunResult.costPer1kRunsUsd.toFixed(2)}</div>
              </div>
            </div>

            {/* Individual Case Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Case-by-Case Assertions</span>
              <div className="space-y-1">
                {latestRunResult.results?.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-arc-surface/60 text-xs">
                    <div className="flex items-center gap-2">
                      {r.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                      <span className="font-semibold text-white">{r.testCaseName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-[11px]">
                      <span>Latency: <strong className="text-gray-300 font-mono">{r.latencyMs}ms</strong></span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">PASSED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historical Evaluation Runs */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Historical Evaluation Benchmark Runs</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-arc-border bg-arc-surface/60 text-gray-300">
                <th className="py-3 px-4 font-semibold text-white">Variant Name</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Model / Version</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Accuracy</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Hallucination</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Policy Adherence</th>
                <th className="py-3 px-4 font-semibold text-gray-300">P50 Latency</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Cost / 1k</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arc-border/60">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-arc-surface/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div>{r.variantName}</div>
                    <div className="text-[10px] font-mono text-gray-500">{r.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-300">{r.modelOrVersion}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-400">{r.accuracyScore}%</span>
                    <span className="text-[10px] text-gray-500 block">{r.passedCases}/{r.totalCases} cases</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-300">{r.hallucinationRate}%</td>
                  <td className="py-3 px-4 font-mono text-white">{r.policyAdherenceScore}%</td>
                  <td className="py-3 px-4 font-mono text-gray-300">{r.latencyP50Ms}ms</td>
                  <td className="py-3 px-4 font-mono text-white">${r.costPer1kRunsUsd?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
