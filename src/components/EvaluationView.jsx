import React, { useState } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Sliders,
  ShieldCheck,
  Activity,
  Award,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu
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
    <div className="flex-1 h-full bg-[#F5F6F8] flex overflow-hidden select-none">
      {/* Left Column: Golden Dataset & Threshold Settings */}
      <div className="w-[450px] h-full border-r border-[#CBD5E1] flex flex-col shrink-0 bg-[#FFFFFF] shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F8F9FB]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#0B0F19] tracking-tight">Golden Dataset & Criteria</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20 font-bold">
              GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Upload verified ground truth transcripts and set alignment thresholds.
          </p>
        </div>

        {/* Dataset Upload Area */}
        <div className="p-4 border-b border-[#E0E0E0] space-y-3 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B0F19] tracking-tight">Benchmark Golden Dataset</span>
            <span className="text-[11px] font-mono font-bold text-[#00338D]">{dataset.length} cases active</span>
          </div>

          <div className="p-3 border border-[#CBD5E1] bg-[#F8F9FB] flex items-center justify-between shadow-inner">
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B0F19] font-mono">
            <Sliders className="w-3.5 h-3.5 text-[#00338D]" />
            <span>Pass/Fail Alignment Thresholds</span>
          </div>

          {/* Slider 1: Faithfulness */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0B0F19]">Min Summary Faithfulness</span>
              <span className="font-mono font-bold text-[#009A44]">{thresholds.minFaithfulness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={thresholds.minFaithfulness}
              onChange={(e) => setThresholds({ ...thresholds, minFaithfulness: Number(e.target.value) })}
              className="w-full accent-[#009A44] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Hallucination check against source meeting transcript.</p>
          </div>

          {/* Slider 2: Action Item F1 */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0B0F19]">Min Action Item F1 Score</span>
              <span className="font-mono font-bold text-[#00A3A6]">{thresholds.minActionItemF1}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={thresholds.minActionItemF1}
              onChange={(e) => setThresholds({ ...thresholds, minActionItemF1: Number(e.target.value) })}
              className="w-full accent-[#00A3A6] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Precision & recall on Assignee, Task, and Deadline extraction.</p>
          </div>

          {/* Slider 3: PII Redaction */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0B0F19]">PII Redaction Compliance</span>
              <span className="font-mono font-bold text-[#6D2077]">{thresholds.minPiiCompliance}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              value={thresholds.minPiiCompliance}
              onChange={(e) => setThresholds({ ...thresholds, minPiiCompliance: Number(e.target.value) })}
              className="w-full accent-[#6D2077] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Redaction rate on compensation, phone numbers, and secrets.</p>
          </div>

          {/* Max Latency */}
          <div className="p-3 bg-[#F8F9FB] border border-[#CBD5E1] flex justify-between items-center text-xs">
            <span className="font-bold text-[#0B0F19]">Max Latency Budget</span>
            <span className="font-mono font-bold text-[#EAAA00]">{thresholds.maxLatencySec}s</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-[#CBD5E1] bg-[#F8F9FB]">
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="btn-tactile w-full py-3 bg-[#00338D] hover:bg-[#005EB8] disabled:bg-slate-400 text-white font-bold text-xs flex items-center justify-center gap-2 rounded-none shadow-sm transition-all"
          >
            {isEvaluating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Evaluating Cases ({evalProgress?.current || 0}/{evalProgress?.total || dataset.length})...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Benchmark & Alignment Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Benchmark Results or Pre-Evaluation Rubric */}
      <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">
        {evaluationResult ? (
          <div className="space-y-6">
            {/* Gate Decision Banner */}
            <div className={`p-6 border-t-4 shadow-sm text-white flex items-center justify-between ${
              evaluationResult.allPassed
                ? 'bg-[#001E50] border-[#009A44]'
                : 'bg-[#001E50] border-[#6D2077]'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center shadow-inner ${
                  evaluationResult.allPassed ? 'bg-[#009A44] text-white' : 'bg-[#6D2077] text-white'
                }`}>
                  {evaluationResult.allPassed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0091DA] font-mono">
                    Alignment Gatekeeper Decision
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {evaluationResult.allPassed
                      ? 'PASS: Certified for Production Deployment'
                      : 'FAIL: Alignment Standards Not Met'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {evaluationResult.allPassed
                      ? 'All golden dataset test cases met or exceeded your institutional threshold SLAs.'
                      : 'One or more test cases violated fidelity, PII compliance, or latency thresholds.'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  evaluationResult.allPassed
                    ? 'bg-[#009A44] text-white'
                    : 'bg-[#6D2077] text-white'
                }`}>
                  {evaluationResult.aggregates.passedCases} / {evaluationResult.aggregates.totalCases} PASSED
                </span>
              </div>
            </div>

            {/* Aggregate Scorecards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Avg Faithfulness</span>
                <span className="text-2xl font-extrabold text-[#009A44] font-mono block mt-1">
                  {evaluationResult.aggregates.faithfulness}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Target: {thresholds.minFaithfulness}%</span>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Action Item F1</span>
                <span className="text-2xl font-extrabold text-[#00A3A6] font-mono block mt-1">
                  {evaluationResult.aggregates.actionItemF1}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Target: {thresholds.minActionItemF1}%</span>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">PII Redaction</span>
                <span className="text-2xl font-extrabold text-[#6D2077] font-mono block mt-1">
                  {evaluationResult.aggregates.piiCompliance}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Target: {thresholds.minPiiCompliance}%</span>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Avg Latency</span>
                <span className="text-2xl font-extrabold text-[#001E50] font-mono block mt-1">
                  {evaluationResult.aggregates.avgLatencySec}s
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Budget: {thresholds.maxLatencySec}s</span>
              </div>
            </div>

            {/* Test Case Breakdown Table */}
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E0E0E0] bg-[#F8F9FB] flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0B0F19] tracking-tight uppercase font-mono">
                  Ground Truth Test Case Ledger
                </h4>
                <span className="text-xs font-mono text-slate-500">{dataset.length} Evaluations</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FB] border-b border-[#CBD5E1] text-[10px] font-mono font-bold text-slate-600">
                      <th className="py-2.5 px-3">Case ID</th>
                      <th className="py-2.5 px-3">Test Scenario</th>
                      <th className="py-2.5 px-3">Faithfulness</th>
                      <th className="py-2.5 px-3">Action F1</th>
                      <th className="py-2.5 px-3">PII Redact</th>
                      <th className="py-2.5 px-3">Latency</th>
                      <th className="py-2.5 px-3">Gate Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {(evaluationResult.caseResults || evaluationResult.results || []).map((res, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F9FB] transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#00338D]">{res.caseId}</td>
                        <td className="py-3 px-3 text-[#0B0F19] font-medium">{res.name}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#009A44]">{res.faithfulness}%</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#00A3A6]">{res.actionItemF1}%</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#6D2077]">{res.piiRate}%</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{res.latencySec}s</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                            res.passed
                              ? 'bg-[#E6F5EC] text-[#009A44] border border-[#009A44]/30'
                              : 'bg-[#F2E9F4] text-[#6D2077] border border-[#6D2077]/30'
                          }`}>
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
          /* Institutional Pre-Evaluation Benchmark Specification (NO EMPTY VOID!) */
          <div className="space-y-6">
            <div className="p-5 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#00338D] text-white flex items-center justify-center shadow-inner">
                    <FileCheck2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B0F19] tracking-tight">
                      Institutional Alignment Gatekeeper Specification
                    </h4>
                    <p className="text-xs text-slate-500">
                      Evaluates agent faithfulness, hallucination risk, and extraction precision against human ground truth.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/30 font-mono text-xs font-bold">
                    3 BENCHMARKS LOADED
                  </span>
                </div>
              </div>

              {/* 3 Benchmark Cards Preview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 border border-[#CBD5E1] bg-[#F8F9FB]">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#00338D] mb-1">
                    <span>CASE-01</span>
                    <span>STRATEGY</span>
                  </div>
                  <h5 className="font-bold text-xs text-[#0B0F19]">Q3 Executive Alignment</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Evaluates multi-speaker budget allocation ($45,000 GPU cluster) and latency sign-offs.
                  </p>
                </div>

                <div className="p-3.5 border border-[#CBD5E1] bg-[#F8F9FB]">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#00338D] mb-1">
                    <span>CASE-02</span>
                    <span>SECURITY</span>
                  </div>
                  <h5 className="font-bold text-xs text-[#0B0F19]">Auth Latency Postmortem</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Tests high-risk PII redaction (session tokens, keys) and deadline assignments.
                  </p>
                </div>

                <div className="p-3.5 border border-[#CBD5E1] bg-[#F8F9FB]">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#00338D] mb-1">
                    <span>CASE-03</span>
                    <span>ARCHITECTURE</span>
                  </div>
                  <h5 className="font-bold text-xs text-[#0B0F19]">Architecture Review Board</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Validates complex technical decision extraction and multi-agent dependency mapping.
                  </p>
                </div>
              </div>

              {/* Ready Trigger Bar */}
              <div className="p-4 bg-[#E6EDF7] border border-[#00338D]/30 flex items-center justify-between mt-3">
                <div className="text-xs text-[#00338D]">
                  <span className="font-bold block">Ready for Alignment Gate</span>
                  <span className="text-[11px] text-slate-600">Click to execute full regression suite against the LLM-as-a-Judge engine.</span>
                </div>
                <button
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="btn-tactile px-5 py-2 bg-[#00338D] hover:bg-[#005EB8] text-white text-xs font-bold rounded-none shadow-sm flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Benchmark Suite</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
