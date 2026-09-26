import React, { useState } from 'react';
import { 
  Play, 
  Upload, 
  FileText, 
  Music, 
  Type, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Activity, 
  DollarSign, 
  CheckCircle2, 
  Plus
} from 'lucide-react';
import { SAMPLE_MEETINGS } from '../constants/sampleMeetings';
import { runMeetingSimulation } from '../utils/meetingSimulatorEngine';
import { transcribeAudioUniversal, getProviderCredential } from '../services/llmService';
import { getActiveApiKey } from '../services/geminiService';

export default function MeetingSimulator({
  activeUseCase,
  nodes,
  edges,
  onAddToolToCanvas
}) {
  const [inputMode, setInputMode] = useState('paste');
  const [transcriptText, setTranscriptText] = useState(SAMPLE_MEETINGS[0].transcript);
  const [mp3File, setMp3File] = useState(null);
  const [txtFile, setTxtFile] = useState(null);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);

  const attachedPillars = nodes
    .filter(n => n.type === 'pillar')
    .map(n => ({
      id: n.data.toolId || n.id,
      name: n.data.name,
      type: n.data.pillarType,
      config: n.data.config
    }));

  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);

  const handleMp3Upload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setMp3File({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        duration: 'Processing...'
      });

      const googleKey = getProviderCredential('google') || getActiveApiKey();
      const openAiKey = getProviderCredential('openai');

      if (googleKey || openAiKey) {
        setIsTranscribingAudio(true);
        try {
          const transResult = await transcribeAudioUniversal(file);
          setTranscriptText(transResult.transcript);
          setMp3File(prev => ({ 
            ...prev, 
            duration: `${(transResult.durationMs / 1000).toFixed(1)}s (${transResult.provider})` 
          }));
        } catch (err) {
          alert(`Audio transcription failed: ${err.message}`);
        } finally {
          setIsTranscribingAudio(false);
        }
      } else {
        setTranscriptText(`[00:02] Sarah Chen: Finalizing the Q3 Enterprise Launch roadmap and GPU cluster expansion.
[00:18] David Miller: Streaming gateway is 95% complete. We anticipate a bottleneck without additional H100 instances.
[01:05] Alex Wong: What is the cost impact?
[01:12] David Miller: Approximately $45,000 extra per month. Base compensation already accounts for maintenance.
[02:14] Alex Wong: Approved using the $60,000 Q2 marketing reserve buffer, provided Priya delivers the latency benchmark report by next Tuesday.
[02:45] Priya Patel: I will run stress tests against Singapore and Frankfurt clusters and publish the final latency matrix by Tuesday, 5 PM EST.`);
      }
    }
  };

  const handleTxtUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTxtFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
        setTranscriptText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setExecutionSteps([]);
    setSimulationResult(null);

    const result = await runMeetingSimulation({
      transcript: transcriptText,
      frameworkId: activeUseCase.framework.id,
      agentConfig: activeUseCase.agent,
      attachedPillars,
      onStepProgress: (newStep, allSteps) => {
        setExecutionSteps(allSteps);
      }
    });

    setSimulationResult(result);
    setIsRunning(false);
  };

  return (
    <div className="flex-1 h-full bg-[#F8F9FB] flex overflow-hidden select-none">
      {/* Left Column: Input Ingestion & Tool Management */}
      <div className="w-[480px] h-full border-r border-[#CBD5E1] flex flex-col shrink-0 bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,30,80,0.04)]">
        {/* Header */}
        <div className="p-4 border-b border-[#E0E0E0] bg-[#F8F9FB]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00338D] font-mono">
              Input Ingestion Layer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20 font-bold">
              MULTIMODAL
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#0B0F19] tracking-tight">Meeting Ingestion Interface</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Upload audio recording, conversation document, or paste transcript text.
          </p>
        </div>

        {/* Input Selector Tabs (Angular 0px borders) */}
        <div className="p-4 pb-2 bg-[#FFFFFF]">
          <div className="grid grid-cols-3 gap-1 bg-[#F8F9FB] p-1 border border-[#CBD5E1]">
            <button
              onClick={() => setInputMode('mp3')}
              className={`btn-tactile flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-all rounded-none ${
                inputMode === 'mp3'
                  ? 'bg-[#00338D] text-white shadow-sm border-b-2 border-[#001E50]'
                  : 'text-slate-600 hover:text-[#0B0F19]'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>MP3 Audio</span>
            </button>

            <button
              onClick={() => setInputMode('txt')}
              className={`btn-tactile flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-all rounded-none ${
                inputMode === 'txt'
                  ? 'bg-[#00338D] text-white shadow-sm border-b-2 border-[#001E50]'
                  : 'text-slate-600 hover:text-[#0B0F19]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>TXT Doc</span>
            </button>

            <button
              onClick={() => setInputMode('paste')}
              className={`btn-tactile flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-all rounded-none ${
                inputMode === 'paste'
                  ? 'bg-[#00338D] text-white shadow-sm border-b-2 border-[#001E50]'
                  : 'text-slate-600 hover:text-[#0B0F19]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
          </div>
        </div>

        {/* Ingestion Content Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-[#FFFFFF]">
          {inputMode === 'mp3' && (
            <div className="space-y-3">
              <div className="p-4 border-2 border-dashed border-[#00338D]/30 bg-[#F8F9FB] text-center">
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/m4a"
                  onChange={handleMp3Upload}
                  className="hidden"
                  id="mp3-upload-input"
                />
                <label
                  htmlFor="mp3-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-10 h-10 bg-[#E6EDF7] text-[#00338D] flex items-center justify-center mb-2 shadow-inner">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#0B0F19] tracking-tight">
                    {mp3File ? mp3File.name : 'Upload MP3 Recording'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 font-mono">
                    {mp3File ? `${mp3File.size} • ${mp3File.duration}` : 'Supports MP3, M4A, WAV up to 250MB'}
                  </span>
                </label>
              </div>

              {/* Audio Waveform Player */}
              <div className="p-3 bg-[#F8F9FB] border border-[#E0E0E0] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="font-bold text-[#00338D]">Audio Ingestion Stream</span>
                  <span className="text-[#00338D]">01:24 / 18:42</span>
                </div>
                <div className="flex items-center gap-1 h-8 px-2 bg-[#FFFFFF] border border-[#CBD5E1]">
                  {[40, 60, 30, 80, 95, 45, 70, 85, 30, 65, 90, 75, 50, 85, 40, 60, 90, 35, 70, 55, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 transition-all ${
                        i < 8 ? 'bg-[#00338D]' : 'bg-[#CBD5E1]'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Attach Ingestion Tool */}
              <div className="p-3 bg-[#E6EDF7] border border-[#00338D]/20 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#00338D] tracking-tight">Audio Ingest Tool</h5>
                  <p className="text-[11px] text-slate-700">Add Whisper MP3 transcription tool to visual canvas</p>
                </div>
                <button
                  onClick={() => onAddToolToCanvas('tool-audio-transcribe')}
                  className="btn-tactile flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#00338D] hover:bg-[#005EB8] text-white transition-all shrink-0 rounded-none shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Tool</span>
                </button>
              </div>
            </div>
          )}

          {inputMode === 'txt' && (
            <div className="space-y-3">
              <div className="p-4 border-2 border-dashed border-[#009A44]/30 bg-[#F8F9FB] text-center">
                <input
                  type="file"
                  accept=".txt,.vtt,.srt,.md"
                  onChange={handleTxtUpload}
                  className="hidden"
                  id="txt-upload-input"
                />
                <label
                  htmlFor="txt-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-10 h-10 bg-[#E6F5EC] text-[#009A44] flex items-center justify-center mb-2 shadow-inner">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#0B0F19] tracking-tight">
                    {txtFile ? txtFile.name : 'Upload Transcript Document'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 font-mono">
                    {txtFile ? txtFile.size : 'Supports .txt, .vtt, .srt format'}
                  </span>
                </label>
              </div>

              <div className="p-3 bg-[#E6F5EC] border border-[#009A44]/20 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#009A44] tracking-tight">Document Parser Tool</h5>
                  <p className="text-[11px] text-slate-700">Add TXT/VTT parser block to visual canvas</p>
                </div>
                <button
                  onClick={() => onAddToolToCanvas('tool-doc-parser')}
                  className="btn-tactile flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#009A44] hover:bg-[#007A36] text-white transition-all shrink-0 rounded-none shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Tool</span>
                </button>
              </div>
            </div>
          )}

          {/* Transcript Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#0B0F19] font-mono">
                Meeting Transcript Text
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTranscriptText(SAMPLE_MEETINGS[0].transcript)}
                  className="btn-tactile text-[10px] px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#E6EDF7] text-[#00338D] border border-[#CBD5E1] font-bold font-mono"
                >
                  Sample 1
                </button>
                <button
                  onClick={() => setTranscriptText(SAMPLE_MEETINGS[1].transcript)}
                  className="btn-tactile text-[10px] px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#E6EDF7] text-[#00338D] border border-[#CBD5E1] font-bold font-mono"
                >
                  Sample 2
                </button>
              </div>
            </div>

            <textarea
              rows={11}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste raw conversation text here with timestamps or speaker tags..."
              className="w-full p-3 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#0B0F19] leading-relaxed font-mono focus:outline-none focus:border-[#00338D] focus:ring-1 focus:ring-[#00338D] rounded-none resize-none transition-colors"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>{transcriptText.length} chars</span>
              <span>~{Math.round(transcriptText.length / 4)} tokens</span>
            </div>
          </div>
        </div>

        {/* Execution Button (Sharp 0px Primary CTA) */}
        <div className="p-4 border-t border-[#E0E0E0] bg-[#F8F9FB]">
          <button
            onClick={handleRunSimulation}
            disabled={isRunning || !transcriptText.trim()}
            className={`btn-tactile w-full py-3 text-xs font-bold uppercase tracking-[0.08em] flex items-center justify-center gap-2 transition-all rounded-none font-mono ${
              isRunning
                ? 'bg-[#00338D]/60 text-white cursor-wait'
                : 'bg-[#00338D] hover:bg-[#005EB8] text-white shadow-sm border-b-2 border-[#001E50]'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>
              {isRunning
                ? `Synthesizing with ${activeUseCase.framework.name}...`
                : `Run Intelligence Agent (${activeUseCase.framework.name})`}
            </span>
          </button>
        </div>
      </div>

      {/* Right Column: Execution Traces & Structured Results */}
      <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">
        {/* Step-by-Step Live Execution Pipeline */}
        {executionSteps.length > 0 && (
          <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-[0_4px_16px_rgba(0,30,80,0.06)] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#00338D] flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-[#00338D]" />
                Architectural Node Execution Pipeline
              </span>
              <span className="text-xs font-mono font-bold text-[#00338D]">
                Framework: {activeUseCase.framework.name}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {executionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#F8F9FB] border border-[#CBD5E1] text-xs shadow-inner"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span className="font-bold text-[#00338D]">Step {idx + 1}</span>
                    <span>{step.latencyMs}ms</span>
                  </div>
                  <h5 className="font-bold text-[#0B0F19] truncate tracking-tight">{step.step}</h5>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results View */}
        {simulationResult ? (
          <div className="space-y-6">
            {/* Spotlight / Dark Event Banner Card (from design.md: Deep Navy #001E50, text #FFFFFF) */}
            <div className="p-5 bg-[#001E50] border-l-4 border-[#EAAA00] text-white flex items-center justify-between shadow-[0_8px_24px_rgba(0,30,80,0.25)]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-[#00338D] text-[#EAAA00] flex items-center justify-center border border-[#0091DA]/30 shadow-inner">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#EAAA00] font-mono">
                    Financial Impact & ROI Analysis
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5 tracking-tight">
                    Compute Spend: ${simulationResult.economics.costUsd} • Advisory Value Saved: ${simulationResult.economics.humanValueSavedUsd}
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#EAAA00] text-[#001E50] font-bold shadow-sm">
                  {simulationResult.economics.netRoiMultiplier}x ROI
                </span>
                <span className="block text-[11px] text-slate-300 mt-1 font-medium">
                  Preserved {simulationResult.economics.humanMinutesSaved} mins of executive review time
                </span>
              </div>
            </div>

            {/* Executive Summary Card (Standard Insight Card: #FFFFFF, 1px solid #E0E0E0, 0px radius) */}
            <div className="p-5 bg-[#FFFFFF] border border-[#CBD5E1] shadow-[0_4px_16px_rgba(0,30,80,0.06)] space-y-3">
              <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-2">
                <Sparkles className="w-4 h-4 text-[#009A44]" />
                <h4 className="text-sm font-bold text-[#0B0F19] tracking-tight">
                  Executive Synthesis & Key Takeaways
                </h4>
              </div>
              <ul className="space-y-2">
                {simulationResult.summary.map((point, i) => (
                  <li key={i} className="text-xs text-[#333333] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-[#00338D] mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Decisions Register */}
            <div className="p-5 bg-[#FFFFFF] border border-[#CBD5E1] shadow-[0_4px_16px_rgba(0,30,80,0.06)] space-y-3">
              <div className="flex items-center gap-2 border-b border-[#E0E0E0] pb-2">
                <CheckCircle2 className="w-4 h-4 text-[#00338D]" />
                <h4 className="text-sm font-bold text-[#0B0F19] tracking-tight">
                  Binding Decisions Register
                </h4>
              </div>
              <div className="space-y-2">
                {simulationResult.decisions.map((dec, i) => (
                  <div key={i} className="p-3 bg-[#F8F9FB] border-l-4 border-[#00338D] text-xs text-[#0B0F19] font-medium leading-relaxed">
                    {dec}
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Action Items Table */}
            <div className="p-5 bg-[#FFFFFF] border border-[#CBD5E1] shadow-[0_4px_16px_rgba(0,30,80,0.06)] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00A3A6]" />
                  <h4 className="text-sm font-bold text-[#0B0F19] tracking-tight">
                    Extracted Action Items & Accountabilities
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-[#00A3A6]">
                  {simulationResult.actionItems.length} tasks identified
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] bg-[#F8F9FB] text-slate-600 text-[10px] uppercase tracking-[0.08em] font-bold font-mono">
                      <th className="py-2.5 px-3">Assignee</th>
                      <th className="py-2.5 px-3">Action Task</th>
                      <th className="py-2.5 px-3">Deadline</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">MCP Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {simulationResult.actionItems.map((item, idx) => (
                      <tr key={item.id} className={`hover:bg-[#F0F4F8] transition-colors ${idx % 2 === 1 ? 'bg-[#FAFAFC]' : 'bg-[#FFFFFF]'}`}>
                        <td className="py-2.5 px-3 font-bold text-[#0B0F19] whitespace-nowrap">
                          {item.assignee}
                        </td>
                        <td className="py-2.5 px-3 text-[#333333] leading-relaxed">
                          {item.task}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {item.deadline}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                            item.priority === 'Critical' ? 'bg-[#F2E9F4] text-[#6D2077] border border-[#6D2077]/30' :
                            item.priority === 'High' ? 'bg-[#FDF7E6] text-[#9E6D00] border border-[#EAAA00]/30' :
                            'bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] font-bold text-[#00A3A6]">
                          {item.jiraTicket}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PII & Audit Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6D2077] flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6D2077]" />
                  Regulatory Policy Guard (PII)
                </span>
                <p className="text-xs text-[#0B0F19] font-medium">
                  {simulationResult.redactedPiiCount > 0
                    ? `Protected: Redacted ${simulationResult.redactedPiiCount} confidential financial values.`
                    : 'Passed: Zero PII violations detected in transcript.'}
                </p>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#001E50] flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5 text-[#001E50]" />
                  Cryptographic Audit & Telemetry
                </span>
                <p className="text-xs font-mono text-slate-700 truncate">
                  Hash: {simulationResult.auditHash}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-12 select-none">
            <Play className="w-12 h-12 text-[#00338D]/30 mb-3" />
            <h4 className="text-sm font-bold text-[#0B0F19] tracking-tight">Simulator Idle</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              Select or upload a meeting transcript on the left, then click "Run Intelligence Agent" to execute live multi-LLM synthesis and inspect cryptographic traces.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
