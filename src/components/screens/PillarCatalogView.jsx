import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Wrench, 
  Server, 
  ShieldCheck, 
  Database, 
  Activity, 
  DollarSign, 
  FileCheck2,
  Lock,
  Search,
  CheckCircle2,
  PlugZap
} from 'lucide-react';
import ScreenScaffold from '../common/ScreenScaffold';
import { PILLARS } from '../../constants/pillars';
import { DESIGN_CLASSES } from '../../constants/designTokens';

/**
 * PillarCatalogView
 * Complete Architectural Registry for the 10 Segregated Pillars
 * Adheres strictly to src/design.md.
 */
export default function PillarCatalogView({ onSelectPillar }) {
  const [selectedPillarId, setSelectedPillarId] = useState('model');
  const [searchTerm, setSearchTerm] = useState('');

  const currentPillar = PILLARS[selectedPillarId] || PILLARS.model;

  const pillarList = Object.values(PILLARS);

  const filteredItems = currentPillar.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScreenScaffold
      title="10 Architectural Pillars Registry & Catalog"
      eyebrow="ARCHITECTURE & EXTENSIBILITY"
      statusText="STRICT SOCKET RULES"
      statusType="brand"
    >
      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: Pillar Categories (design.md 0px Angular) */}
        <div className="w-72 bg-[#FFFFFF] border border-[#E0E0E0] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 bg-[#F5F6F8] border-b border-[#E0E0E0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] font-mono">
              Select Architectural Pillar
            </span>
          </div>

          <div className="divide-y divide-[#E0E0E0]">
            {pillarList.map((pillar) => {
              const isSelected = pillar.id === selectedPillarId;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillarId(pillar.id)}
                  className={`w-full text-left p-3.5 flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-[#E6EDF7] border-l-4 border-l-[#00338D]' 
                      : 'hover:bg-[#F5F6F8] border-l-4 border-l-transparent'
                  }`}
                >
                  <div>
                    <h4 className={`text-xs font-bold ${isSelected ? 'text-[#00338D]' : 'text-[#0B0F19]'}`}>
                      {pillar.label}
                    </h4>
                    <span className="text-[10px] text-[#666666] font-mono">
                      Socket: {pillar.socketId}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#E0E0E0] text-[#0B0F19]">
                    {pillar.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pillar Specification & Catalog Items */}
        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
          {/* Pillar Specification Card */}
          <div className={DESIGN_CLASSES.card + ' p-5'}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] mb-3">
              <div>
                <span className={DESIGN_CLASSES.eyebrow}>
                  {currentPillar.badge}
                </span>
                <h3 className="text-base font-bold text-[#0B0F19]">
                  {currentPillar.label} Specification
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={DESIGN_CLASSES.statusPillBrand}>
                  Socket Port: {currentPillar.socketId}
                </span>
                <span className={DESIGN_CLASSES.statusPillActive}>
                  Max Connections: {currentPillar.maxConnections === 99 ? 'Unlimited' : currentPillar.maxConnections}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#333333] leading-relaxed">
              {currentPillar.description}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${currentPillar.label} components...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={DESIGN_CLASSES.input + ' pl-9'}
            />
          </div>

          {/* Catalog Items Grid */}
          <div className="grid grid-cols-2 gap-4 pb-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className={DESIGN_CLASSES.card + ' ' + DESIGN_CLASSES.cardHover + ' p-4 flex flex-col justify-between'}
                style={{ borderTop: `3px solid ${currentPillar.color}` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5F6F8] border border-[#E0E0E0] text-[#00338D]">
                      {item.id}
                    </span>
                    <PlugZap className="w-3.5 h-3.5 text-[#666666]" />
                  </div>
                  <h4 className="text-xs font-bold text-[#0B0F19] mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#666666] leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                {item.config && (
                  <div className="p-2.5 bg-[#F5F6F8] border border-[#E0E0E0] text-[10px] font-mono text-[#333333]">
                    <span className="font-bold text-[#0B0F19] block mb-1">Default Configuration:</span>
                    <pre className="overflow-x-auto text-[10px] leading-tight">
                      {JSON.stringify(item.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenScaffold>
  );
}
