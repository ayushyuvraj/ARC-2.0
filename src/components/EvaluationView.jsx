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
    <div className="flex-1 h-full bg-[#F5F6F8] flex overflow-hidden">
      {/* Left Column: Golden Dataset & Threshold Settings */}
      <div className="w-[450px] h-full border-r border-[#E0E0E0] flex flex-col shrink-0 bg-[#FFFFFF] shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F6F8]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00338D] font-['Univers',sans-serif]">
              Quality Assurance & Alignment Gate
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20 font-bold">
              GOVERNANCE
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#0B0F19] tracking-wide">Golden Dataset & Criteria</h3>
          <p className="text-xs text-[#666666] mt-0.5">
            Upload verified ground truth transcripts and set alignment thresholds.
          </p>
        </div>

        {/* Dataset Upload Area */}
        <div className="p-4 border-b border-[#E0E0E0] space-y-3 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B0F19]">Benchmark Golden Dataset</span>
            <span className="text-[11px] font-mono font-bold text-[#00338D]">{dataset.length} cases active</span>
          </div>

          <div className="p-3.5 border border-[#E0E0E0] bg-[#F5F6F8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-[#00338D]" />
              <div>
                <span className="text-xs font-bold text-[#0B0F19] block">Upload Dataset File</span>
                <span className="text-[10px] text-[#666666]">Supports .json, .jsonl</span>
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
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#E6EDF7] text-xs font-bold text-[#00338D] border border-[#00338D] cursor-pointer transition-colors"
            >
              Browse
            </label>
          </div>
        </div>

        {/* Threshold Configuration Form */}
        <div className="p-4 flex-1 overflow-y-auto space-y-5 bg-[#FFFFFF]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B0F19]">
            <Sliders className="w-3.5 h-3.5 text-[#00338D]" />
            <span>Pass/Fail Alignment Thresholds</span>
          </div>

          {/* Faithfulness Threshold */}
          <div className="p-3 bg-[#F5F6F8] border border-[#E0E0E0] space-y-1.5">
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
            <p className="text-[10px] text-[#666666]">Hallucination check against source meeting transcript.</p>
          </div>

          {/* Action Item F1 Threshold */}
          <div className="p-3 bg-[#F5F6F8] border border-[#E0E0E0] space-y-1.5">
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
            <p className="text-[10px] text-[#666666]">Precision & recall on Assignee, Task, and Deadline extraction.</p>
          </div>

          {/* PII Redaction Rate */}
          <div className="p-3 bg-[#F5F6F8] border border-[#E0E0E0] space-y-1.5">
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
            <p className="text-[10px] text-[#666666]">Redaction rate on compensation, phone numbers, and secrets.</p>
          </div>

          {/* Max Latency */}
          <div className="p-3 bg-[#F5F6F8] border border-[#E0E0E0] space-y-1.5">
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
            <p className="text-[10px] text-[#666666]">Maximum execution time permitted per meeting synthesis.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-[#E0E0E0] bg-[#F5F6F8]">
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className={`w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isEvaluating
                ? 'bg-[#00338D]/60 text-white cursor-wait'
                : 'bg-[#00338D] hover:bg-[#005EB8] text-white shadow-sm'
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
              className={`p-5 text-white flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-l-4 ${
                evaluationResult.allPassed
                  ? 'bg-[#001E50] border-[#009A44]'
                  : 'bg-[#001E50] border-[#6D2077]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 flex items-center justify-center ${
                    evaluationResult.allPassed
                      ? 'bg-[#009A44] text-white'
                      : 'bg-[#6D2077] text-white'
                  }`}
                >
                  {evaluationResult.allPassed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-wide font-['Univers',sans-serif]">
                    {evaluationResult.allPassed
                      ? 'Alignment Gate PASSED — Institutional Quality Validated'
                      : 'Alignment Gate FAILED — Requirements Not Met'}
                  </h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {evaluationResult.allPassed
                      ? 'All metric scores meet or exceed target thresholds. "Deploy Agent" button unlocked in header.'
                      : 'Agent fell below required threshold. Please adjust system prompt or attach necessary skills.'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
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
              <div className="p-4 bg-[#FFFFFF] border border-[#E0E0E0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] font-['Univers',sans-serif]">
                  Faithfulness Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19]">{evaluationResult.aggregates.faithfulness}%</span>
                  <span className="text-xs font-mono text-[#666666]">Target: {thresholds.faithfulnessScore}%</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#009A44] h-full"
                    style={{ width: `${evaluationResult.aggregates.faithfulness}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#E0E0E0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] font-['Univers',sans-serif]">
                  Action Items F1
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19]">{evaluationResult.aggregates.actionItemF1}%</span>
                  <span className="text-xs font-mono text-[#666666]">Target: {thresholds.actionItemF1}%</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#00A3A6] h-full"
                    style={{ width: `${evaluationResult.aggregates.actionItemF1}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#E0E0E0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] font-['Univers',sans-serif]">
                  PII Compliance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19]">{evaluationResult.aggregates.piiRate}%</span>
                  <span className="text-xs font-mono text-[#666666]">Target: {thresholds.piiRedactionRate}%</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#6D2077] h-full"
                    style={{ width: `${evaluationResult.aggregates.piiRate}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#E0E0E0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] font-['Univers',sans-serif]">
                  Avg Latency
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B0F19]">{evaluationResult.aggregates.latencySec}s</span>
                  <span className="text-xs font-mono text-[#666666]">Max: {thresholds.maxLatencySeconds}s</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-[#EAAA00] h-full"
                    style={{ width: `${Math.min((evaluationResult.aggregates.latencySec / thresholds.maxLatencySeconds) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Test Case Breakdown Table */}
            <div className="p-5 bg-[#FFFFFF] border border-[#E0E0E0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-3">
              <h4 className="text-sm font-bold text-[#0B0F19] font-['Univers',sans-serif] tracking-wide border-b border-[#E0E0E0] pb-2">
                Test Case Verification Breakdown
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#F5F6F8] text-[#666666] text-[11px] uppercase tracking-wider font-bold">
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
                    {evaluationResult.results.map((res) => (
                      <tr key={res.id} className="hover:bg-[#F5F6F8] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#0B0F19]">
                          {res.caseName}
                        </td>
                        <td className="py-3 px-3 text-[#666666]">
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
                        <td className="py-3 px-3 font-mono text-[#666666]">
                          {res.latencySec}s
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              res.passed
                                ? 'bg-[#E6F5EC] text-[#009A44]'
                                : 'bg-[#F2E9F4] text-[#6D2077]'
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
          <div className="h-full flex flex-col items-center justify-center text-center text-[#666666] p-12">
            <FileCheck2 className="w-12 h-12 text-[#00338D]/30 mb-3" />
            <h4 className="text-sm font-bold text-[#0B0F19]">No Benchmark Executed</h4>
            <p className="text-xs text-[#666666] max-w-sm mt-1">
              Configure alignment thresholds on the left and click "Run Benchmark & Alignment Suite" to evaluate against the Golden Dataset.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
