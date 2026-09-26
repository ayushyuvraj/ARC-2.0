import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Sparkles, Cpu, Layers, ShieldCheck, Database, Wrench, GitFork, Activity, DollarSign } from 'lucide-react';

export default function AgentCoreNode({ data, selected }) {
  const { name, framework, prompt, temperature, attachedCounts } = data;

  return (
    <div
      className={`relative w-[340px] bg-[#FFFFFF] border transition-all duration-150 shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${
        selected ? 'border-[#00338D] ring-2 ring-[#00338D]/25' : 'border-[#E0E0E0] hover:border-[#00338D]'
      }`}
    >
      {/* Institutional Top Banner */}
      <div className="px-4 py-3 bg-[#001E50] border-b border-[#00338D] flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#00338D] border border-[#0091DA] flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#005EB8] text-white">
                CORE AGENT
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                {framework?.name || 'Google ADK'}
              </span>
            </div>
            <h3 className="text-xs font-bold text-white mt-1 leading-tight tracking-wide">
              {name || 'Meeting Intelligence Agent'}
            </h3>
          </div>
        </div>
      </div>

      {/* Body: Prompt preview & Config */}
      <div className="p-4 space-y-3 bg-[#FFFFFF]">
        <div className="bg-[#F5F6F8] p-2.5 border border-[#E0E0E0]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#666666] mb-1 flex items-center justify-between">
            <span>System Instruction</span>
            <span className="text-[#00338D] font-mono text-[9px] font-bold">Temp: {temperature || 0.2}</span>
          </div>
          <p className="text-xs text-[#333333] line-clamp-2 italic leading-relaxed">
            "{prompt || 'Analyze meeting transcripts, extract decisions, action items with owners, and draft follow-up communications.'}"
          </p>
        </div>

        {/* Typed Sockets Status Grid */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            Architectural Attachment Sockets
          </div>
          
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 p-1.5 bg-[#E6EDF7] border border-[#00338D]/20 text-[#00338D] font-medium">
              <Cpu className="w-3.5 h-3.5 text-[#00338D] shrink-0" />
              <span className="truncate">Model: {attachedCounts?.model ? 'Active' : 'Unset'}</span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#E6F5EC] border border-[#009A44]/20 text-[#009A44] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#009A44] shrink-0" />
              <span className="truncate">Skills ({attachedCounts?.skills || 0})</span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#E6F6F6] border border-[#00A3A6]/20 text-[#00A3A6] font-medium">
              <Layers className="w-3.5 h-3.5 text-[#00A3A6] shrink-0" />
              <span className="truncate">MCP ({attachedCounts?.mcp || 0})</span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#E6EFF8] border border-[#005EB8]/20 text-[#005EB8] font-medium">
              <Wrench className="w-3.5 h-3.5 text-[#005EB8] shrink-0" />
              <span className="truncate">Tools ({attachedCounts?.tools || 0})</span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#FDF7E6] border border-[#EAAA00]/20 text-[#9E6D00] font-medium">
              <GitFork className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
              <span className="truncate">Gateway: {attachedCounts?.gateway ? 'Active' : 'Pass'}</span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#EFEBF5] border border-[#483698]/20 text-[#483698] font-medium">
              <Database className="w-3.5 h-3.5 text-[#483698] shrink-0" />
              <span className="truncate">Memory: {attachedCounts?.memory ? 'Active' : 'Off'}</span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#F2E9F4] border border-[#6D2077]/20 text-[#6D2077] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6D2077] shrink-0" />
              <span className="truncate">Policies ({attachedCounts?.policies || 0})</span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-[#FDF7E6] border border-[#EAAA00]/20 text-[#9E6D00] font-medium">
              <DollarSign className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
              <span className="truncate">ROI: Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Handles (Pins) - Sharp institutional square pins */}
      {/* Left Pins */}
      <div className="absolute -left-2.5 top-12 flex items-center">
        <Handle
          type="target"
          position={Position.Left}
          id="model-in"
          style={{ background: '#00338D', borderColor: '#001E50' }}
          title="Model Socket (Accepts: Model blocks only)"
        />
        <span className="text-[9px] font-mono text-[#00338D] font-bold ml-3.5 pointer-events-none uppercase">Model</span>
      </div>

      <div className="absolute -left-2.5 top-24 flex items-center">
        <Handle
          type="target"
          position={Position.Left}
          id="tool-in"
          style={{ background: '#005EB8', borderColor: '#001E50' }}
          title="Tools Socket (Accepts: Ingestion & Utility tools)"
        />
        <span className="text-[9px] font-mono text-[#005EB8] font-bold ml-3.5 pointer-events-none uppercase">Tools</span>
      </div>

      <div className="absolute -left-2.5 top-36 flex items-center">
        <Handle
          type="target"
          position={Position.Left}
          id="gateway-in"
          style={{ background: '#EAAA00', borderColor: '#9E6D00' }}
          title="Gateway Socket (Accepts: Rate limiters, Fallbacks)"
        />
        <span className="text-[9px] font-mono text-[#9E6D00] font-bold ml-3.5 pointer-events-none uppercase">Gateway</span>
      </div>

      <div className="absolute -left-2.5 top-48 flex items-center">
        <Handle
          type="target"
          position={Position.Left}
          id="memory-in"
          style={{ background: '#483698', borderColor: '#2E1A66' }}
          title="Memory Socket (Accepts: Episodic & Vector memory)"
        />
        <span className="text-[9px] font-mono text-[#483698] font-bold ml-3.5 pointer-events-none uppercase">Memory</span>
      </div>

      {/* Right Pins */}
      <div className="absolute -right-2.5 top-12 flex items-center justify-end">
        <span className="text-[9px] font-mono text-[#009A44] font-bold mr-3.5 pointer-events-none uppercase">Skills</span>
        <Handle
          type="target"
          position={Position.Right}
          id="skill-in"
          style={{ background: '#009A44', borderColor: '#005A28' }}
          title="Skills Socket (Accepts: Skill capabilities only)"
        />
      </div>

      <div className="absolute -right-2.5 top-24 flex items-center justify-end">
        <span className="text-[9px] font-mono text-[#00A3A6] font-bold mr-3.5 pointer-events-none uppercase">MCP</span>
        <Handle
          type="target"
          position={Position.Right}
          id="mcp-in"
          style={{ background: '#00A3A6', borderColor: '#006B6D' }}
          title="MCP Socket (Accepts: Model Context Protocol servers)"
        />
      </div>

      <div className="absolute -right-2.5 top-36 flex items-center justify-end">
        <span className="text-[9px] font-mono text-[#6D2077] font-bold mr-3.5 pointer-events-none uppercase">Policies</span>
        <Handle
          type="target"
          position={Position.Right}
          id="policy-in"
          style={{ background: '#6D2077', borderColor: '#3F1245' }}
          title="Policy Socket (Accepts: PII and Compliance guards)"
        />
      </div>

      <div className="absolute -right-2.5 top-48 flex items-center justify-end">
        <span className="text-[9px] font-mono text-[#001E50] font-bold mr-3.5 pointer-events-none uppercase">Audit</span>
        <Handle
          type="target"
          position={Position.Right}
          id="audit-in"
          style={{ background: '#001E50', borderColor: '#000E26' }}
          title="Audit Socket (Accepts: Cryptographic Audit blocks)"
        />
      </div>

      {/* Bottom Pins */}
      <div className="absolute -bottom-2.5 left-1/3 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="target"
          position={Position.Bottom}
          id="observability-in"
          style={{ background: '#0091DA', borderColor: '#005EB8' }}
          title="Observability Socket (Accepts: OpenTelemetry)"
        />
        <span className="text-[9px] font-mono text-[#005EB8] font-bold mt-2.5 pointer-events-none uppercase">Observe</span>
      </div>

      <div className="absolute -bottom-2.5 left-2/3 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="target"
          position={Position.Bottom}
          id="cost-benefit-in"
          style={{ background: '#EAAA00', borderColor: '#9E6D00' }}
          title="Cost & Benefit Socket (Accepts: ROI Trackers)"
        />
        <span className="text-[9px] font-mono text-[#9E6D00] font-bold mt-2.5 pointer-events-none uppercase">Cost/ROI</span>
      </div>
    </div>
  );
}
