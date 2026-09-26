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
  ChevronRight,
  Key,
  ShieldCheck,
  Activity
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
  return (
    <header className="h-16 px-6 bg-[#001E50] border-b border-[#00338D] flex items-center justify-between shrink-0 z-30 shadow-md">
      {/* Brand & Active Use Case */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00338D] border border-[#0091DA] flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base font-['Univers',sans-serif]">
                KEAOS
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#005EB8] text-white">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Enterprise Agent Studio</p>
          </div>
        </div>

        <div className="h-8 w-px bg-white/20" />

        {/* Current Use Case Info */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
              Active Specification
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-wide">{activeUseCase.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-[#00338D] text-slate-100 border border-[#0091DA]/50 font-medium">
                {activeUseCase.framework.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Modes */}
      <div className="flex items-center bg-[#001438] p-1 border border-[#00338D]">
        <button
          onClick={() => setViewMode('canvas')}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'canvas'
              ? 'bg-[#00338D] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Visual Canvas</span>
        </button>

        <button
          onClick={() => setViewMode('simulator')}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'simulator'
              ? 'bg-[#00338D] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Meeting Simulator</span>
          <span className="w-2 h-2 rounded-full bg-[#00A3A6] animate-pulse" />
        </button>

        <button
          onClick={() => setViewMode('evaluation')}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'evaluation'
              ? 'bg-[#00338D] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Evaluation & Gate</span>
          {evaluationPassed && (
            <span className="text-[10px] font-bold px-1.5 rounded-full bg-[#009A44] text-white">
              PASSED
            </span>
          )}
        </button>

        <button
          onClick={() => setViewMode('code')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'code'
              ? 'bg-[#00338D] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Export SDK</span>
        </button>

        <button
          onClick={() => setViewMode('audit')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'audit'
              ? 'bg-[#00338D] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Ledger</span>
        </button>

        <button
          onClick={() => setViewMode('observability')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'observability'
              ? 'bg-[#00338D] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Observability</span>
        </button>

        <button
          onClick={() => setViewMode('catalog')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'catalog'
              ? 'bg-[#00338D] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pillars Catalog</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenApiSettings}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border transition-all ${
            hasApiKey
              ? 'bg-[#009A44]/20 border-[#009A44] text-[#E6F5EC]'
              : 'bg-[#EAAA00]/20 border-[#EAAA00] text-[#FDF7E6]'
          }`}
          title="Configure real LLM providers (Google, Anthropic, OpenAI, Ollama, OpenRouter)"
        >
          <Key className="w-3.5 h-3.5" />
          <span>{hasApiKey ? `LLM APIs: ${configuredCount || 1} Active` : 'Configure LLM APIs'}</span>
        </button>

        <button
          onClick={onResetTemplate}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 border border-white/20 hover:bg-white/10 transition-colors"
          title="Reset back to pilot configuration"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Pilot</span>
        </button>

        <button
          onClick={onOpenMakeModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#005EB8] hover:bg-[#00338D] text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Make Use Case</span>
        </button>

        <button
          onClick={onDeployClick}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all ${
            evaluationPassed
              ? 'bg-[#009A44] hover:bg-[#007A36] text-white cursor-pointer shadow-sm'
              : 'bg-white/10 text-slate-400 border border-white/15 cursor-not-allowed'
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
