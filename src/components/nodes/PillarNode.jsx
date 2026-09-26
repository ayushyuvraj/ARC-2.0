import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Cpu, 
  Sparkles, 
  Layers, 
  Wrench, 
  GitFork, 
  Database, 
  ShieldCheck, 
  FileCheck, 
  Activity, 
  DollarSign, 
  X,
  Mic,
  FileText,
  Type
} from 'lucide-react';
import { PILLARS } from '../../constants/pillars';

const PILLAR_ICONS = {
  model: Cpu,
  skills: Sparkles,
  mcp: Layers,
  tools: Wrench,
  gateway: GitFork,
  memory: Database,
  policies: ShieldCheck,
  audit: FileCheck,
  observability: Activity,
  cost_benefit: DollarSign
};

export default function PillarNode({ id, data, selected }) {
  const { pillarType, name, description, config, onDelete, toolId } = data;
  const pillarDef = PILLARS[pillarType] || PILLARS.tools;
  
  let IconComponent = PILLAR_ICONS[pillarType] || Wrench;
  if (toolId === 'tool-audio-transcribe') IconComponent = Mic;
  if (toolId === 'tool-doc-parser') IconComponent = FileText;
  if (toolId === 'tool-text-box-ingest') IconComponent = Type;

  const isLeftConnecting = ['model', 'tools', 'gateway', 'memory'].includes(pillarType);
  const isBottomConnecting = ['observability', 'cost_benefit'].includes(pillarType);

  let handlePosition = Position.Right;
  if (isLeftConnecting) handlePosition = Position.Right;
  else if (isBottomConnecting) handlePosition = Position.Top;
  else handlePosition = Position.Left;

  return (
    <div
      className={`relative w-[240px] bg-[#FFFFFF] border transition-all duration-150 select-none ${
        selected
          ? 'ring-2 ring-[#0091DA] border-[#00338D] shadow-[0_8px_24px_rgba(0,30,80,0.16)] -translate-y-0.5'
          : 'border-[#CBD5E1] hover:border-[#00338D] shadow-[0_4px_16px_rgba(0,30,80,0.06)] hover:shadow-[0_6px_20px_rgba(0,30,80,0.12)]'
      }`}
      style={{
        borderTop: `3px solid ${pillarDef.color}`
      }}
    >
      {/* Node Header */}
      <div className="p-3 border-b border-[#E0E0E0] flex items-center justify-between bg-[#FFFFFF]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-7 h-7 flex items-center justify-center shrink-0 border shadow-inner"
            style={{ 
              backgroundColor: pillarDef.bgColor, 
              color: pillarDef.color,
              borderColor: `${pillarDef.color}40`
            }}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <span
              className="text-[9px] font-bold tracking-[0.08em] uppercase block font-mono"
              style={{ color: pillarDef.color }}
            >
              {pillarDef.badge}
            </span>
            <h4 className="text-xs font-bold text-[#0B0F19] truncate leading-tight tracking-tight">{name}</h4>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="btn-tactile w-5 h-5 hover:bg-[#F5F6F8] text-[#94A3B8] hover:text-[#0B0F19] flex items-center justify-center transition-colors"
            title="Remove block"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Node Details */}
      <div className="p-3 space-y-2 bg-[#FFFFFF]">
        <p className="text-[11px] text-[#333333] line-clamp-2 leading-relaxed">
          {description}
        </p>

        {config && Object.keys(config).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-[#F0F2F5]">
            {Object.entries(config).slice(0, 2).map(([k, v]) => (
              <span key={k} className="text-[9px] font-mono px-1.5 py-0.5 bg-[#F8F9FB] text-[#333333] border border-[#E0E0E0] truncate max-w-[200px]">
                <strong className="text-slate-500 font-semibold">{k}:</strong> {String(v)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Typed Output Handle */}
      <Handle
        type="source"
        position={handlePosition}
        id="out"
        style={{
          background: pillarDef.color,
          borderColor: '#001E50'
        }}
        title={`Connect to ${pillarDef.socketId} on Core Agent`}
      />
    </div>
  );
}
