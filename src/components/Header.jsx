import React from 'react';
import { 
  Bot, 
  Plus, 
  Play, 
  FileCheck2, 
  Code2, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  Layers,
  Key,
  ShieldCheck,
  Activity,
  Cpu
} from 'lucide-react';

export default function Header({
  activeUseCase,
  viewMode,
  setViewMode,
  onOpenMakeModal,
  onResetTemplate,
  evaluationPassed,
  onDeployClick,
  hasApiKey,
  configuredCount,
  onOpenApiSettings
}) {
  const tabs = [
    { id: 'canvas', label: 'Visual Canvas', icon: Layers },
    { id: 'simulator', label: 'Meeting Simulator', icon: Play, pulse: true },
    { id: 'evaluation', label: 'Evaluation & Gate', icon: FileCheck2, badge: evaluationPassed ? 'PASSED' : null },
    { id: 'code', label: 'Export SDK', icon: Code2 },
    { id: 'audit', label: 'Audit Ledger', icon: ShieldCheck },
    { id: 'observability', label: 'Observability', icon: Activity },
    { id: 'catalog', label: 'Pillars Catalog', icon: Cpu }
  ];

  return (
    <header className="h-16 px-6 bg-[#001E50] border-b-2 border-[#00338D] flex items-center justify-between shrink-0 z-30 shadow-[0_4px_24px_rgba(0,30,80,0.4)] select-none">
      {/* Brand & Active Architecture Meta */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00338D] border border-[#0091DA]/60 flex items-center justify-center text-white shadow-inner">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg font-['Univers',sans-serif]">
                KEAOS
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#005EB8] text-white border border-[#0091DA]/40">
                STUDIO OS
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium tracking-wide">Enterprise Agent Operating Studio</p>
          </div>
        </div>

        <div className="h-8 w-px bg-white/20" />

        {/* Current Use Case Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">
              Active Specification
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-white tracking-tight">{activeUseCase.name}</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#00338D] text-slate-100 border border-[#0091DA]/50 font-bold shadow-sm">
                {activeUseCase.framework.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Modes (Instrument Switcher) */}
      <nav className="flex items-center bg-[#001438] p-1 border border-[#00338D] shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`btn-tactile flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-none transition-all duration-150 relative ${
                isActive
                  ? 'bg-[#00338D] text-white shadow-sm border-b-2 border-[#0091DA]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border-b-2 border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0091DA]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.pulse && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6] beacon-live" />
              )}
              {tab.badge && (
                <span className="text-[9px] font-mono font-bold px-1.5 rounded-full bg-[#009A44] text-white shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Buttons Cluster */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenApiSettings}
          className={`btn-tactile flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-none shadow-sm ${
            hasApiKey
              ? 'bg-[#009A44]/20 border-[#009A44] text-[#E6F5EC] hover:bg-[#009A44]/30'
              : 'bg-[#EAAA00]/20 border-[#EAAA00] text-[#FDF7E6] hover:bg-[#EAAA00]/30'
          }`}
          title="Configure real LLM providers (Google, Anthropic, OpenAI, Ollama, OpenRouter)"
        >
          <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-[#009A44] beacon-live' : 'bg-[#EAAA00]'}`} />
          <Key className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] font-bold">{hasApiKey ? `LLMs: ${configuredCount || 1} Active` : 'Set LLM APIs'}</span>
        </button>

        <button
          onClick={onResetTemplate}
          className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-white/20 hover:bg-white/10 rounded-none transition-colors"
          title="Reset back to pilot configuration"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
          <span>Reset Pilot</span>
        </button>

        <button
          onClick={onOpenMakeModal}
          className="btn-tactile flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-[#005EB8] hover:bg-[#00478F] text-white rounded-none shadow-sm border-b-2 border-[#001E50]"
        >
          <Plus className="w-4 h-4" />
          <span>Make Use Case</span>
        </button>

        <button
          onClick={onDeployClick}
          className={`btn-tactile flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-none shadow-sm transition-all ${
            evaluationPassed
              ? 'bg-[#009A44] hover:bg-[#007A36] text-white cursor-pointer border-b-2 border-[#004D22]'
              : 'bg-white/10 text-slate-400 border border-white/15 cursor-not-allowed opacity-80'
          }`}
          title={evaluationPassed ? 'Deploy to Production' : 'Evaluation benchmark must pass threshold before deployment'}
        >
          {evaluationPassed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Deploy Agent</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Deploy Locked</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
