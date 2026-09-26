import React, { useState } from 'react';
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
  Plus, 
  Search,
  ChevronDown,
  ChevronRight,
  Mic,
  FileText,
  Type
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

export default function Palette({ onAddNode }) {
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

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside className="w-80 h-full bg-[#FFFFFF] border-r border-[#E0E0E0] flex flex-col shrink-0 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#E0E0E0] bg-[#F5F6F8]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00338D] font-['Univers',sans-serif]">
            Component Taxonomy
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20 font-semibold">
            10 PILLARS
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search skills, MCP, tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E0E0E0] text-xs text-[#0B0F19] placeholder-[#666666] focus:outline-none focus:border-[#00338D]"
          />
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#F5F6F8]">
        {Object.entries(PILLARS).map(([pillarKey, pillar]) => {
          const Icon = PILLAR_ICONS[pillarKey] || Wrench;
          const isOpen = openCategories[pillarKey];
          
          const filteredItems = pillar.items.filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
          );

          if (search && filteredItems.length === 0) return null;

          return (
            <div key={pillarKey} className="border border-[#E0E0E0] bg-[#FFFFFF] overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(pillarKey)}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#F5F6F8] transition-colors text-left border-b border-transparent"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 flex items-center justify-center shrink-0 border"
                    style={{ 
                      backgroundColor: pillar.bgColor, 
                      color: pillar.color,
                      borderColor: `${pillar.color}40`
                    }}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-[#0B0F19] tracking-wide">{pillar.label}</span>
                  <span className="text-[10px] font-mono text-[#666666]">({pillar.items.length})</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#666666]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
                )}
              </button>

              {/* Items List */}
              {isOpen && (
                <div className="p-2 space-y-1.5 border-t border-[#E0E0E0] bg-[#FAFAFA]">
                  {filteredItems.map((item) => {
                    let ItemIcon = Icon;
                    if (item.id === 'tool-audio-transcribe') ItemIcon = Mic;
                    if (item.id === 'tool-doc-parser') ItemIcon = FileText;
                    if (item.id === 'tool-text-box-ingest') ItemIcon = Type;

                    return (
                      <div
                        key={item.id}
                        className="group p-2.5 border border-[#E0E0E0] bg-[#FFFFFF] hover:border-[#00338D] transition-all flex items-start justify-between gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                      >
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <ItemIcon className="w-3.5 h-3.5 shrink-0" style={{ color: pillar.color }} />
                            <h5 className="text-xs font-bold text-[#0B0F19] truncate">{item.name}</h5>
                          </div>
                          <p className="text-[11px] text-[#333333] mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 uppercase font-semibold"
                              style={{ backgroundColor: pillar.bgColor, color: pillar.color }}
                            >
                              Socket: {pillar.socketId}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onAddNode(pillarKey, item)}
                          className="w-6 h-6 bg-[#00338D] hover:bg-[#005EB8] text-white flex items-center justify-center transition-all shrink-0 mt-0.5"
                          title="Add block to canvas"
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
    </aside>
  );
}
