import React, { useState } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_GOLDEN_DATASET } from '../constants/goldenDataset';
import { runEvaluationSuite } from '../utils/evaluationEngine';

export default function EvaluationView({
  activeUseCase,
  nodes,
  thresholds,
  setThresholds,
  evaluationResult,
  setEvaluationResult
}) {
  const [dataset, setDataset] = useState(INITIAL_GOLDEN_DATASET);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalProgress, setEvalProgress] = useState(null);

  const attachedPillars = nodes
    .filter(n => n.type === 'pillar')
    .map(n => ({
      id: n.data.toolId || n.id,
      name: n.data.name,
      type: n.data.pillarType,
      config: n.data.config
    }));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          setDataset(parsed);
        } else {
          alert('Uploaded JSON must be an array of test cases.');
        }
      } catch (err) {
        alert('Invalid JSON format. Please upload a valid JSON array.');
      }
    };
    reader.readAsText(file);
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setEvalProgress({ current: 0, total: dataset.length, currentCase: 'Initializing...' });

    const result = await runEvaluationSuite({
      dataset,
      thresholds,
      frameworkId: activeUseCase.framework.id,
      agentPrompt: activeUseCase.agent.prompt,
      attachedPillars,
      onProgress: (prog) => {
        setEvalProgress(prog);
      }
    });

    setEvaluationResult(result);
    setIsEvaluating(false);
    setEvalProgress(null);

    if (result.allPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="flex-1 h-full bg-[#F8F9FB] flex overflow-hidden select-none">
      {/* Left Column: Golden Dataset & Threshold Settings */}
      <div className="w-[450px] h-full border-r border-[#CBD5E1] flex flex-col shrink-0 bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,30,80,0.04)]">
        {/* Header */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F8F9FB]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00338D] font-mono">
              Quality Assurance & Alignment Gate
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20 font-bold">
              GOVERNANCE
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#0B0F19] tracking-tight">Golden Dataset & Criteria</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Upload verified ground truth transcripts and set alignment thresholds.
          </p>
        </div>

        {/* Dataset Upload Area */}
        <div className="p-4 border-b border-[#E0E0E0] space-y-3 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B0F19] tracking-tight">Benchmark Golden Dataset</span>
            <span className="text-[11px] font-mono font-bold text-[#00338D]">{dataset.length} cases active</span>
          </div>

          <div className="p-3.5 border border-[#CBD5E1] bg-[#F8F9FB] flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-[#00338D]" />
              <div>
                <span className="text-xs font-bold text-[#0B0F19] block tracking-tight">Upload Dataset File</span>
                <span className="text-[10px] text-slate-500 font-mono">Supports .json, .jsonl</span>
              </div>
            </div>
            <input
              type="file"
              accept=".json,.jsonl"
              onChange={handleFileUpload}
              className="hidden"
              id="dataset-upload-input"
            />
            <label
              htmlFor="dataset-upload-input"
              className="btn-tactile px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#E6EDF7] text-xs font-bold text-[#00338D] border border-[#00338D] cursor-pointer transition-colors rounded-none shadow-sm"
            >
              Browse
            </label>
          </div>
        </div>

        {/* Threshold Configuration Form */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-[#FFFFFF]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#0B0F19] font-mono">
            <Sliders className="w-3.5 h-3.5 text-[#00338D]" />
            <span>Pass/Fail Alignment Thresholds</span>
          </div>

          {/* Faithfulness Threshold */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0B0F19] font-bold">Min Summary Faithfulness</span>
              <span className="font-mono text-[#009A44] font-bold">{thresholds.faithfulnessScore}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={thresholds.faithfulnessScore}
              onChange={(e) => setThresholds({ ...thresholds, faithfulnessScore: parseInt(e.target.value) })}
              className="w-full accent-[#009A44]"
            />
            <p className="text-[10px] text-slate-500">Hallucination check against source meeting transcript.</p>
          </div>

          {/* Action Item F1 Threshold */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0B0F19] font-bold">Min Action Item F1 Score</span>
              <span className="font-mono text-[#00A3A6] font-bold">{thresholds.actionItemF1}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={thresholds.actionItemF1}
              onChange={(e) => setThresholds({ ...thresholds, actionItemF1: parseInt(e.target.value) })}
              className="w-full accent-[#00A3A6]"
            />
            <p className="text-[10px] text-slate-500">Precision & recall on Assignee, Task, and Deadline extraction.</p>
          </div>

          {/* PII Redaction Rate */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0B0F19] font-bold">PII Redaction Compliance</span>
              <span className="font-mono text-[#6D2077] font-bold">{thresholds.piiRedactionRate}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="100"
              value={thresholds.piiRedactionRate}
              onChange={(e) => setThresholds({ ...thresholds, piiRedactionRate: parseInt(e.target.value) })}
              className="w-full accent-[#6D2077]"
            />
            <p className="text-[10px] text-slate-500">Redaction rate on compensation, phone numbers, and secrets.</p>
          </div>

          {/* Max Latency */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0B0F19] font-bold">Max Latency Budget</span>
              <span className="font-mono text-[#EAAA00] font-bold">{thresholds.maxLatencySeconds}s</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={thresholds.maxLatencySeconds}
              onChange={(e) => setThresholds({ ...thresholds, maxLatencySeconds: parseFloat(e.target.value) })}
              className="w-full accent-[#EAAA00]"
            />
            <p className="text-[10px] text-slate-500">Maximum execution time permitted per meeting synthesis.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-[#E0E0E0] bg-[#F8F9FB]">
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className={`btn-tactile w-full py-3 text-xs font-bold uppercase tracking-[0.08em] flex items-center justify-center gap-2 transition-all rounded-none font-mono ${
              isEvaluating
                ? 'bg-[#00338D]/60 text-white cursor-wait'
                : 'bg-[#00338D] hover:bg-[#005EB8] text-white shadow-sm border-b-2 border-[#001E50]'
            }`}
          >
            <Play className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>
              {isEvaluating
                ? `Evaluating Case ${evalProgress?.current || 1}/${dataset.length}...`
                : 'Run Benchmark & Alignment Suite'}
            </span>
          </button>
        </div>
      </div>

      {/* Right Column: Benchmark Scorecards & Detailed Comparison */}
      <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">
        {evaluationResult ? (
          <div className="space-y-6">
            {/* Alignment Gate Banner (Spotlight Dark Card: #001E50 or #009A44) */}
            <div
              className={`p-5 text-white flex items-center justify-between shadow-[0_8px_24px_rgba(0,30,80,0.25)] border-l-4 ${
                evaluationResult.allPassed
                  ? 'bg-[#001E50] border-[#009A44]'
                  : 'bg-[#001E50] border-[#6D2077]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 flex items-center justify-center border shadow-inner ${
                    evaluationResult.allPassed
                      ? 'bg-[#009A44] border-[#009A44]/40 text-white'
                      : 'bg-[#6D2077] border-[#6D2077]/40 text-white'
                  }`}
                >
                  {evaluationResult.allPassed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {evaluationResult.allPassed
                      ? 'Alignment Gate PASSED — Institutional Quality Validated'
                      : 'Alignment Gate FAILED — Requirements Not Met'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {evaluationResult.allPassed
                      ? 'All metric scores meet or exceed target thresholds. "Deploy Agent" button unlocked in header.'
                      : 'Agent fell below required threshold. Please adjust system prompt or attach necessary skills.'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full shadow-sm ${
                    evaluationResult.allPassed
                      ? 'bg-[#009A44] text-white'
                      : 'bg-[#6D2077] text-white'
                  }`}
                >
                  {evaluationResult.allPassed ? 'DEPLOYABLE' : 'LOCKED'}
                </span>
              </div>
            </div>

            {/* Scorecard Metric Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-1 border-t-3 border-t-[#009A44]">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 font-mono">
                  Faithfulness Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19] tracking-tight font-mono">{evaluationResult.aggregates.faithfulness}%</span>
                  <span className="text-xs font-mono text-slate-500">Target: {thresholds.faithfulnessScore}%</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#009A44] h-full transition-all duration-300"
                    style={{ width: `${evaluationResult.aggregates.faithfulness}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-1 border-t-3 border-t-[#00A3A6]">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 font-mono">
                  Action Items F1
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19] tracking-tight font-mono">{evaluationResult.aggregates.actionItemF1}%</span>
                  <span className="text-xs font-mono text-slate-500">Target: {thresholds.actionItemF1}%</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#00A3A6] h-full transition-all duration-300"
                    style={{ width: `${evaluationResult.aggregates.actionItemF1}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-1 border-t-3 border-t-[#6D2077]">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 font-mono">
                  PII Compliance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19] tracking-tight font-mono">{evaluationResult.aggregates.piiRate}%</span>
                  <span className="text-xs font-mono text-slate-500">Target: {thresholds.piiRedactionRate}%</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#6D2077] h-full transition-all duration-300"
                    style={{ width: `${evaluationResult.aggregates.piiRate}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-1 border-t-3 border-t-[#EAAA00]">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 font-mono">
                  Avg Latency
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19] tracking-tight font-mono">{evaluationResult.aggregates.latencySec}s</span>
                  <span className="text-xs font-mono text-slate-500">Max: {thresholds.maxLatencySeconds}s</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#EAAA00] h-full transition-all duration-300"
                    style={{ width: `${Math.min((evaluationResult.aggregates.latencySec / thresholds.maxLatencySeconds) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Test Case Breakdown Table */}
            <div className="p-5 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-[#0B0F19] tracking-tight border-b border-[#E0E0E0] pb-2">
                Test Case Verification Breakdown
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#F8F9FB] text-slate-600 text-[10px] uppercase tracking-[0.08em] font-bold font-mono">
                      <th className="py-2.5 px-3">Test Case</th>
                      <th className="py-2.5 px-3">Domain</th>
                      <th className="py-2.5 px-3">Faithfulness</th>
                      <th className="py-2.5 px-3">Action F1</th>
                      <th className="py-2.5 px-3">PII Filter</th>
                      <th className="py-2.5 px-3">Latency</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {evaluationResult.results.map((res, idx) => (
                      <tr key={res.id} className={`hover:bg-[#F0F4F8] transition-colors ${idx % 2 === 1 ? 'bg-[#FAFAFC]' : 'bg-[#FFFFFF]'}`}>
                        <td className="py-3 px-3 font-bold text-[#0B0F19]">
                          {res.caseName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {res.category}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#009A44]">
                          {res.faithfulness}%
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#00A3A6]">
                          {res.actionItemF1}%
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#6D2077]">
                          {res.piiRate}%
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {res.latencySec}s
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                              res.passed
                                ? 'bg-[#E6F5EC] text-[#009A44] border border-[#009A44]/30'
                                : 'bg-[#F2E9F4] text-[#6D2077] border border-[#6D2077]/30'
                            }`}
                          >
                            {res.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-12 select-none">
            <FileCheck2 className="w-12 h-12 text-[#00338D]/30 mb-3" />
            <h4 className="text-sm font-bold text-[#0B0F19] tracking-tight">No Benchmark Executed</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              Configure alignment thresholds on the left and click "Run Benchmark & Alignment Suite" to evaluate against the Golden Dataset.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
