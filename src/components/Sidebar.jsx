import React, { useState } from 'react';
import { 
  Bot, 
  Layers, 
  Play, 
  FileCheck2, 
  Code2, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Plus, 
  RotateCcw, 
  Key, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles, 
  Wrench, 
  GitFork, 
  Database, 
  FileCheck, 
  Mic, 
  FileText, 
  Type,
  Rocket
} from 'lucide-react';
import { PILLARS } from '../constants/pillars';

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

export default function Sidebar({
  activeUseCase,
  viewMode,
  setViewMode,
  onOpenMakeModal,
  onResetTemplate,
  evaluationPassed,
  onDeployClick,
  hasApiKey,
  configuredCount,
  onOpenApiSettings,
  onAddNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState({
    model: true,
    skills: true,
    tools: true,
    mcp: true,
    gateway: false,
    memory: false,
    policies: false,
    audit: false,
    observability: false,
    cost_benefit: false
  });

  const tabs = [
    { id: 'canvas', label: 'Visual Canvas', icon: Layers },
    { id: 'simulator', label: 'Meeting Simulator', icon: Play, pulse: true },
    { id: 'evaluation', label: 'Evaluation & Gate', icon: FileCheck2, badge: evaluationPassed ? 'PASSED' : null },
    { id: 'code', label: 'Export SDK', icon: Code2 },
    { id: 'audit', label: 'Audit Ledger', icon: ShieldCheck },
    { id: 'observability', label: 'Observability', icon: Activity },
    { id: 'catalog', label: 'Pillars Catalog', icon: Cpu }
  ];

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (isCollapsed) {
    return (
      <aside className="w-16 h-full bg-[#001E50] border-r border-[#00338D] flex flex-col items-center justify-between py-4 shrink-0 z-30 shadow-lg select-none">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Brand Logo & Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-10 h-10 bg-[#00338D] border border-[#0091DA]/50 flex items-center justify-center text-white shadow-inner hover:bg-[#005EB8] transition-colors"
            title="Expand Sidebar (KEAOS Studio)"
          >
            <Bot className="w-5 h-5 text-white" />
          </button>

          <div className="w-8 h-px bg-white/10" />

          {/* Collapsed View Tabs */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`btn-tactile w-10 h-10 flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-[#00338D] text-white border-l-2 border-[#0091DA] shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={tab.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0091DA]' : 'text-slate-400'}`} />
                  {tab.pulse && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6] beacon-live absolute top-2 right-2" />
                  )}
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-[#009A44] absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collapsed Bottom Actions */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <button
            onClick={onOpenApiSettings}
            className={`w-10 h-10 flex items-center justify-center border transition-colors ${
              hasApiKey
                ? 'bg-[#009A44]/20 border-[#009A44] text-[#E6F5EC]'
                : 'bg-[#EAAA00]/20 border-[#EAAA00] text-[#FDF7E6]'
            }`}
            title="Configure API Keys"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCollapsed(false)}
            className="w-10 h-10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 h-full bg-[#001E50] border-r border-[#00338D] flex flex-col shrink-0 overflow-hidden shadow-xl select-none z-30">
      {/* Sidebar Header: Brand & Collapse */}
      <div className="p-4 border-b border-[#00338D] bg-[#001438] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00338D] border border-[#0091DA]/60 flex items-center justify-center text-white shadow-inner shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base font-['Univers',sans-serif]">
                KEAOS
              </span>
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.2 rounded-full bg-[#005EB8] text-white border border-[#0091DA]/40">
                STUDIO OS
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium tracking-wide">Enterprise Agent Studio</p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="btn-tactile p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Active Specification & Action Bar */}
      <div className="p-3 bg-[#001E50] border-b border-[#00338D]/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">
            Active Specification
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-[#00338D] text-slate-100 border border-[#0091DA]/50 font-bold">
            {activeUseCase.framework.name}
          </span>
        </div>

        <div className="text-xs font-bold text-white tracking-tight truncate">
          {activeUseCase.name}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenMakeModal}
            className="btn-tactile flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-bold bg-[#005EB8] hover:bg-[#00478F] text-white rounded-none shadow-sm border border-[#0091DA]/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Make Use Case</span>
          </button>

          <button
            onClick={onResetTemplate}
            className="btn-tactile flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold text-slate-300 border border-white/20 hover:bg-white/10 rounded-none transition-colors"
            title="Reset back to pilot template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Pilot</span>
          </button>
        </div>
      </div>

      {/* Navigation View Modes (Tabs) */}
      <div className="p-2 border-b border-[#00338D]/80 bg-[#001438]/60 space-y-1">
        <div className="px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Studio Views
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`btn-tactile w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-none transition-all ${
                isActive
                  ? 'bg-[#00338D] text-white shadow-sm border-l-3 border-[#0091DA]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0091DA]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {tab.pulse && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A3A6] beacon-live" />
                )}
                {tab.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#009A44] text-white shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* System API Keys & Deployment Controls */}
      <div className="p-3 border-b border-[#00338D] bg-[#001E50] space-y-2">
        <button
          onClick={onOpenApiSettings}
          className={`btn-tactile w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold border rounded-none ${
            hasApiKey
              ? 'bg-[#009A44]/20 border-[#009A44] text-[#E6F5EC] hover:bg-[#009A44]/30'
              : 'bg-[#EAAA00]/20 border-[#EAAA00] text-[#FDF7E6] hover:bg-[#EAAA00]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-[#009A44] beacon-live' : 'bg-[#EAAA00]'}`} />
            <Key className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{hasApiKey ? `LLM APIs (${configuredCount || 1})` : 'Set LLM APIs'}</span>
          </div>
          <span className="text-[9px] font-mono uppercase opacity-80">{hasApiKey ? 'Ready' : 'Config'}</span>
        </button>

        <button
          onClick={onDeployClick}
          className={`btn-tactile w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold rounded-none transition-all ${
            evaluationPassed
              ? 'bg-[#009A44] hover:bg-[#007A36] text-white border-b-2 border-[#004D22]'
              : 'bg-white/10 text-slate-400 border border-white/15 cursor-not-allowed opacity-75'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>{evaluationPassed ? 'Deploy Agent to Prod' : 'Deploy (Gate Locked)'}</span>
        </button>
      </div>

      {/* Component Dock (10 Pillars Accordion) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FFFFFF] text-[#0B0F19]">
        {/* Dock Header & Search */}
        <div className="p-3 border-b border-[#E0E0E0] bg-[#F8F9FB]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00338D] font-mono">
              Component Dock
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/30 font-bold">
              10 PILLARS
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search components & skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#0B0F19] placeholder-slate-400 focus:outline-none focus:border-[#00338D] focus:ring-1 focus:ring-[#00338D] rounded-none font-mono"
            />
          </div>
        </div>

        {/* Accordion Categories */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#F8F9FB]">
          {Object.entries(PILLARS).map(([pillarKey, pillar]) => {
            const Icon = PILLAR_ICONS[pillarKey] || Wrench;
            const isOpen = openCategories[pillarKey];
            
            const filteredItems = pillar.items.filter(item => 
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase())
            );

            if (search && filteredItems.length === 0) return null;

            return (
              <div 
                key={pillarKey} 
                className="border border-[#CBD5E1] bg-[#FFFFFF] overflow-hidden shadow-sm transition-all"
                style={{ borderLeft: `3px solid ${pillar.color}` }}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(pillarKey)}
                  className="w-full px-2.5 py-2 flex items-center justify-between hover:bg-[#F5F6F8] transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 flex items-center justify-center shrink-0 shadow-inner"
                      style={{ 
                        backgroundColor: pillar.bgColor, 
                        color: pillar.color,
                        border: `1px solid ${pillar.color}40`
                      }}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0B0F19] tracking-tight block">{pillar.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-[#F8F9FB] border border-[#CBD5E1] text-slate-600">
                      {pillar.items.length}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Items List */}
                {isOpen && (
                  <div className="p-1.5 space-y-1.5 border-t border-[#E0E0E0] bg-[#FAFAFC]">
                    {filteredItems.map((item) => {
                      let ItemIcon = Icon;
                      if (item.id === 'tool-audio-transcribe') ItemIcon = Mic;
                      if (item.id === 'tool-doc-parser') ItemIcon = FileText;
                      if (item.id === 'tool-text-box-ingest') ItemIcon = Type;

                      return (
                        <div
                          key={item.id}
                          className="group p-2 border border-[#E0E0E0] bg-[#FFFFFF] hover:border-[#00338D] hover:translate-x-0.5 transition-all duration-150 flex items-start justify-between gap-2 shadow-[0_1px_3px_rgba(0,30,80,0.02)] hover:shadow-[0_2px_8px_rgba(0,30,80,0.06)]"
                        >
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <ItemIcon className="w-3 h-3 shrink-0" style={{ color: pillar.color }} />
                              <span className="text-xs font-bold text-[#0B0F19] truncate group-hover:text-[#00338D]">
                                {item.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                              {item.description}
                            </p>
                          </div>

                          <button
                            onClick={() => onAddNode && onAddNode(pillarKey, item)}
                            className="btn-tactile shrink-0 w-6 h-6 bg-[#E6EDF7] group-hover:bg-[#00338D] text-[#00338D] group-hover:text-white flex items-center justify-center transition-colors border border-[#00338D]/20 mt-0.5"
                            title={`Add ${item.name} to canvas`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
