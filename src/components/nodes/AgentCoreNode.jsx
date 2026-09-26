import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Bot, 
  Terminal,
  Activity,
  Server,
  Brain,
  Wrench,
  GitFork,
  Database,
  Sparkles,
  ShieldCheck,
  Fingerprint,
  Coins
} from 'lucide-react';

export default function AgentCoreNode({ data, selected }) {
  const { name, framework, prompt, temperature, topP, attachedCounts } = data;

  const totalConnected = Object.values(attachedCounts || {}).reduce(
    (acc, val) => acc + (typeof val === 'number' ? val : val ? 1 : 0), 
    0
  );

  return (
    <div
      className={`relative w-[460px] bg-[#FFFFFF] border select-none transition-all duration-200 ${
        selected
          ? 'border-[#00338D] ring-2 ring-[#0091DA] shadow-[0_16px_40px_rgba(0,30,80,0.22)]'
          : 'border-[#CBD5E1] hover:border-[#00338D] shadow-[0_8px_30px_rgba(0,30,80,0.08)]'
      }`}
    >
      {/* 1. Command Header */}
      <div className="px-5 py-3.5 bg-[#001E50] border-b border-[#00338D] flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00338D] border border-[#0091DA]/50 flex items-center justify-center text-white shadow-inner">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0091DA] uppercase tracking-wider">
                ORCHESTRATOR
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/20">
                {framework?.name || 'Google ADK'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5 tracking-tight">
              {name || 'Meeting Intelligence Agent'}
            </h3>
          </div>
        </div>

        {/* Live Operational Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#009A44]/20 border border-[#009A44]/40 text-[#E6F5EC] text-[10px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-[#009A44] beacon-live" />
          <span>ACTIVE</span>
        </div>
      </div>

      {/* 2. Embedded Directive Console */}
      <div className="p-4 bg-[#FFFFFF] space-y-4">
        <div className="bg-[#0B0F19] border border-[#1E293B] p-3 shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 mb-2 border-b border-[#1E293B]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-[#0091DA]" />
              <span className="font-bold">SYSTEM DIRECTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">T: {temperature || 0.2}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">P: {topP || 0.95}</span>
            </div>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
            {prompt || 'Analyze meeting transcripts, extract decisions, action items with owners, and draft follow-up communications.'}
          </p>
        </div>

        {/* 3. Architectural Sockets Port Bay */}
        <div className="border border-[#CBD5E1] bg-[#F8F9FB] p-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#0B0F19] mb-3 pb-2 border-b border-[#E0E0E0]">
            <span className="tracking-tight">Architectural Socket Matrix</span>
            <span className="text-[#00338D] text-[10px] font-mono px-2 py-0.5 bg-[#E6EDF7] border border-[#00338D]/20 rounded-full font-bold">
              {totalConnected} / 10 Connected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Left Port Column */}
            <div className="space-y-2">
              {/* Model Socket Row */}
              <div className={`p-2 border flex items-center justify-between transition-colors relative ${
                attachedCounts?.model 
                  ? 'bg-[#E6EDF7] border-[#00338D] text-[#00338D]' 
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 shrink-0 text-[#00338D]" />
                  <span className="font-bold text-[11px]">Model Socket</span>
                </div>
                <span className="font-mono text-[10px] font-bold">{attachedCounts?.model ? 'Active' : 'Unbound'}</span>
                <Handle
                  type="target"
                  position={Position.Left}
                  id="model-in"
                  className="!left-[-17px] !w-3 !h-3 !bg-[#00338D] !border-2 !border-[#001E50]"
                  title="Socket: model-in (Accepts Foundation Model only)"
                />
              </div>

              {/* Tools Socket Row */}
              <div className={`p-2 border flex items-center justify-between transition-colors relative ${
                attachedCounts?.tools > 0 
                  ? 'bg-[#E6EFF8] border-[#005EB8] text-[#005EB8]' 
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 shrink-0 text-[#005EB8]" />
                  <span className="font-bold text-[11px]">Ingest Tools</span>
                </div>
                <span className="font-mono text-[10px] font-bold">{attachedCounts?.tools || 0}</span>
                <Handle
                  type="target"
                  position={Position.Left}
                  id="tool-in"
                  className="!left-[-17px] !w-3 !h-3 !bg-[#005EB8] !border-2 !border-[#001E50]"
                  title="Socket: tool-in (Accepts Execution & Ingestion Tools)"
                />
              </div>

              {/* Gateway Socket Row */}
              <div className={`p-2 border flex items-center justify-between transition-colors relative ${
                attachedCounts?.gateway 
                  ? 'bg-[#FDF7E6] border-[#EAAA00] text-[#9E6D00]' 
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <GitFork className="w-3.5 h-3.5 shrink-0 text-[#EAAA00]" />
                  <span className="font-bold text-[11px]">Ingress Gateway</span>
                </div>
                <span className="font-mono text-[10px] font-bold">{attachedCounts?.gateway ? 'Capped' : 'Pass'}</span>
                <Handle
                  type="target"
                  position={Position.Left}
                  id="gateway-in"
                  className="!left-[-17px] !w-3 !h-3 !bg-[#EAAA00] !border-2 !border-[#9E6D00]"
                  title="Socket: gateway-in (Accepts Ingress Rate Limiters)"
                />
              </div>

              {/* Memory Socket Row */}
              <div className={`p-2 border flex items-center justify-between transition-colors relative ${
                attachedCounts?.memory 
                  ? 'bg-[#EFEBF5] border-[#483698] text-[#483698]' 
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 shrink-0 text-[#483698]" />
                  <span className="font-bold text-[11px]">Sync Memory</span>
                </div>
                <span className="font-mono text-[10px] font-bold">{attachedCounts?.memory ? 'Sync' : 'Off'}</span>
                <Handle
                  type="target"
                  position={Position.Left}
                  id="memory-in"
                  className="!left-[-17px] !w-3 !h-3 !bg-[#483698] !border-2 !border-[#2E1A66]"
                  title="Socket: memory-in (Accepts Memory Stores)"
                />
              </div>
            </div>

            {/* Right Port Column */}
            <div className="space-y-2">
              {/* Skills Socket Row */}
              <div className={`p-2 border flex items-center justify-between transition-colors relative ${
                attachedCounts?.skills > 0 
                  ? 'bg-[#E6F5EC] border-[#009A44] text-[#009A44]' 
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#009A44]" />
                  <span className="font-bold text-[11px]">Skills Hub</span>
                </div>
                <span className="font-mono text-[10px] font-bold">{attachedCounts?.skills || 0}</span>
                <Handle
                  type="target"
                  position={Position.Right}
                  id="skill-in"
                  className="!right-[-17px] !w-3 !h-3 !bg-[#009A44] !border-2 !border-[#005A28]"
                  title="Socket: skill-in (Accepts Specialized Skills)"
                />
              </div>

              {/* MCP Socket Row */}
              <div className={`p-2 border flex items-center justify-between transition-colors relative ${
                attachedCounts?.mcp > 0 
                  ? 'bg-[#E6F6F6] border-[#00A3A6] text-[#00A3A6]' 
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 shrink-0 text-[#00A3A6]" />
                  <span className="font-bold text-[11px]">MCP Servers</span>
                </div>
                <span className="font-mono text-[10px] font-bold">{attachedCounts?.mcp || 0}</span>
                <Handle
                  type="target"
                  position={Position.Right}
                  id="mcp-in"
                  className="!right-[-17px] !w-3 !h-3 !bg-[#00A3A6] !border-2 !border-[#005A5C]"
                  title="Socket: mcp-in (Accepts MCP Servers)"
                />
              </div>

              {/* Policies Socket Row */}
              <div className={`p-2 border flex items-center justify-between transition-colors relative ${
                attachedCounts?.policies > 0 
                  ? 'bg-[#F2E9F4] border-[#6D2077] text-[#6D2077]' 
                  : 'bg-[#FFFFFF] border-[#CBD5E1] text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#6D2077]" />
                  <span className="font-bold text-[11px]">Policy Guards</span>
                </div>
                <span className="font-mono text-[10px] font-bold">{attachedCounts?.policies || 0}</span>
                <Handle
                  type="target"
                  position={Position.Right}
                  id="policy-in"
                  className="!right-[-17px] !w-3 !h-3 !bg-[#6D2077] !border-2 !border-[#470A68]"
                  title="Socket: policy-in (Accepts Guardrails & Policies)"
                />
              </div>

              {/* Audit Socket Row */}
              <div className="p-2 border border-[#001E50] bg-[#001E50]/5 text-[#001E50] flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 shrink-0 text-[#001E50]" />
                  <span className="font-bold text-[11px]">Audit Ledger</span>
                </div>
                <span className="font-mono text-[10px] font-bold">SHA-256</span>
                <Handle
                  type="target"
                  position={Position.Right}
                  id="audit-in"
                  className="!right-[-17px] !w-3 !h-3 !bg-[#001E50] !border-2 !border-[#00338D]"
                  title="Socket: audit-in (Accepts Cryptographic Audit)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Observability & Cost-Benefit Handles */}
      <div className="px-5 py-2.5 bg-[#F8F9FB] border-t border-[#E0E0E0] flex items-center justify-between text-[11px] font-mono font-bold text-slate-600 relative">
        <div className="flex items-center gap-2 relative">
          <Activity className="w-3.5 h-3.5 text-[#0091DA]" />
          <span>Observability Span</span>
          <Handle
            type="target"
            position={Position.Bottom}
            id="observability-in"
            className="!left-[50px] !bottom-[-7px] !w-3 !h-3 !bg-[#0091DA] !border-2 !border-[#001E50]"
            title="Socket: observability-in (Accepts OpenTelemetry)"
          />
        </div>

        <div className="flex items-center gap-2 relative">
          <Coins className="w-3.5 h-3.5 text-[#EAAA00]" />
          <span>ROI Unit Cost</span>
          <Handle
            type="target"
            position={Position.Bottom}
            id="cost-benefit-in"
            className="!left-[45px] !bottom-[-7px] !w-3 !h-3 !bg-[#EAAA00] !border-2 !border-[#9E6D00]"
            title="Socket: cost-benefit-in (Accepts Cost & Benefit ROI)"
          />
        </div>
      </div>
    </div>
  );
}
