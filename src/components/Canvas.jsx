import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  MarkerType
} from '@xyflow/react';
import AgentCoreNode from './nodes/AgentCoreNode';
import PillarNode from './nodes/PillarNode';
import { SOCKET_RULES, PILLARS } from '../constants/pillars';
import { 
  Info, 
  AlertTriangle,
  Brain, 
  Sparkles, 
  Server, 
  Wrench, 
  GitFork, 
  Database, 
  ShieldCheck, 
  Fingerprint, 
  Activity, 
  Coins,
  Plus,
  Search,
  X,
  Layers,
  Mic,
  FileText,
  Type,
  Sun,
  Moon,
  ChevronRight,
  Sparkle,
  ArrowUp,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';

const nodeTypes = {
  agentCore: AgentCoreNode,
  pillar: PillarNode
};

const PILLAR_ICONS = {
  model: Brain,
  skills: Sparkles,
  mcp: Server,
  tools: Wrench,
  gateway: GitFork,
  memory: Database,
  policies: ShieldCheck,
  audit: Fingerprint,
  observability: Activity,
  cost_benefit: Coins
};

export default function Canvas({
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  onSelectNode,
  invalidConnectionAlert,
  setInvalidConnectionAlert,
  onAddNode,
  isInspectorOpen,
  setIsInspectorOpen,
  selectedNode
}) {
  const [selectedPillarKey, setSelectedPillarKey] = useState(null);
  const [canvasSearch, setCanvasSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark canvas matching Stitch SS
  const [quickPrompt, setQuickPrompt] = useState('');

  const isValidConnection = useCallback(
    (connection) => {
      const { source, target, targetHandle } = connection;
      const sourceNode = nodes.find(n => n.id === source);
      const targetNode = nodes.find(n => n.id === target);

      if (!sourceNode || !targetNode) return false;

      if (targetNode.type === 'agentCore') {
        const requiredPillar = SOCKET_RULES[targetHandle];
        const sourcePillar = sourceNode.data.pillarType;

        if (requiredPillar === sourcePillar) {
          return true;
        } else {
          setInvalidConnectionAlert({
            sourceName: sourceNode.data.name,
            sourceType: sourcePillar,
            targetHandle,
            requiredType: requiredPillar
          });
          return false;
        }
      }

      return false;
    },
    [nodes, setInvalidConnectionAlert]
  );

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const pillarDef = PILLARS[sourceNode?.data?.pillarType] || PILLARS.tools;

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: pillarDef.color, strokeWidth: 2.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: pillarDef.color,
              width: 14,
              height: 14
            }
          },
          eds
        )
      );
      setInvalidConnectionAlert(null);
    },
    [nodes, setEdges, setInvalidConnectionAlert]
  );

  const handlePillarClick = (pillarKey) => {
    if (selectedPillarKey === pillarKey) {
      setSelectedPillarKey(null);
    } else {
      setSelectedPillarKey(pillarKey);
      setCanvasSearch('');
    }
  };

  const handleAddFromCanvas = (pillarKey, item) => {
    if (onAddNode) {
      onAddNode(pillarKey, item);
    }
    setSelectedPillarKey(null);
  };

  const activePillarDef = selectedPillarKey ? PILLARS[selectedPillarKey] : null;

  return (
    <div className={`relative w-full h-full overflow-hidden select-none transition-colors duration-200 ${
      isDarkMode ? 'bg-[#10131A] text-white' : 'bg-[#F5F6F8] text-[#0B0F19]'
    }`}>
      {/* Top Left: Socket Enforcer HUD Bar */}
      <div className={`absolute top-4 left-6 z-10 flex items-center gap-4 px-4 py-2 border shadow-lg pointer-events-auto transition-colors ${
        isDarkMode 
          ? 'bg-[#181D28]/95 border-[#2B354B] text-slate-200 backdrop-blur-md' 
          : 'bg-[#FFFFFF]/95 border-[#CBD5E1] text-[#0B0F19] backdrop-blur-md'
      }`}>
        <div className={`flex items-center gap-2 border-r pr-3 ${isDarkMode ? 'border-white/10' : 'border-[#E0E0E0]'}`}>
          <Info className="w-3.5 h-3.5 text-[#0091DA]" />
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-[#0091DA]">
            Socket Enforcer:
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 font-bold text-[#0091DA]">
            <Brain className="w-3 h-3 text-[#0091DA]" />
            Model
          </span>
          <span className="flex items-center gap-1 font-bold text-[#009A44]">
            <Sparkles className="w-3 h-3 text-[#009A44]" />
            Skills
          </span>
          <span className="flex items-center gap-1 font-bold text-[#00A3A6]">
            <Server className="w-3 h-3 text-[#00A3A6]" />
            MCP
          </span>
          <span className="flex items-center gap-1 font-bold text-[#005EB8]">
            <Wrench className="w-3 h-3 text-[#005EB8]" />
            Tools
          </span>
          <span className="flex items-center gap-1 font-bold text-[#EAAA00]">
            <GitFork className="w-3 h-3 text-[#EAAA00]" />
            Gateway
          </span>
          <span className="flex items-center gap-1 font-bold text-[#483698]">
            <Database className="w-3 h-3 text-[#483698]" />
            Memory
          </span>
          <span className="flex items-center gap-1 font-bold text-[#6D2077]">
            <ShieldCheck className="w-3 h-3 text-[#6D2077]" />
            Policies
          </span>
          <span className="flex items-center gap-1 font-bold text-[#0091DA]">
            <Fingerprint className="w-3 h-3 text-[#0091DA]" />
            Audit
          </span>
          <span className="flex items-center gap-1 font-bold text-[#00A3A6]">
            <Activity className="w-3 h-3 text-[#00A3A6]" />
            Telemetry
          </span>
          <span className="flex items-center gap-1 font-bold text-[#EAAA00]">
            <Coins className="w-3 h-3 text-[#EAAA00]" />
            ROI
          </span>
        </div>

        <div className={`border-l pl-3 flex items-center gap-2 text-[10px] font-mono ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-[#E0E0E0] text-slate-500'}`}>
          <span className="font-bold text-[#0091DA]">{nodes.length}</span> Blocks
          <span>•</span>
          <span className="font-bold text-[#0091DA]">{edges.length}</span> Links
        </div>
      </div>

      {/* Top Right: Light / Dark Mode Toggle & Inspector Control */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`btn-tactile flex items-center gap-2 px-3 py-1.5 border shadow-md transition-all font-mono text-xs font-bold ${
            isDarkMode
              ? 'bg-[#181D28] hover:bg-[#202736] border-[#2B354B] text-amber-400'
              : 'bg-[#FFFFFF] hover:bg-[#F8F9FB] border-[#CBD5E1] text-[#00338D]'
          }`}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#00338D]" />
              <span className="text-[#00338D] text-[11px]">Dark</span>
            </>
          )}
        </button>

        {setIsInspectorOpen && (
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`btn-tactile flex items-center gap-2 px-3 py-1.5 border shadow-md transition-all font-mono text-xs font-bold ${
              isDarkMode
                ? isInspectorOpen
                  ? 'bg-[#00338D] border-[#0091DA] text-white'
                  : 'bg-[#181D28] hover:bg-[#202736] border-[#2B354B] text-slate-300'
                : isInspectorOpen
                  ? 'bg-[#00338D] border-[#00338D] text-white'
                  : 'bg-[#FFFFFF] hover:bg-[#F8F9FB] border-[#CBD5E1] text-[#00338D]'
            }`}
            title={isInspectorOpen ? 'Collapse Inspector' : 'Open Inspector Panel'}
          >
            {isInspectorOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span>{selectedNode ? 'Inspect Block' : 'Studio HUD'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#009A44] beacon-live" />
          </button>
        )}
      </div>

      {/* LEFT FLOATING VERTICAL TOOLBAR: 10 Pillars Icon-Only Dock (matching Stitch SS right toolbar) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex items-start gap-3">
        {/* The 10 Pillar Icon Buttons (Pure Icons - No text normally) */}
        <div className={`flex flex-col items-center gap-1 p-1.5 border shadow-2xl backdrop-blur-md transition-colors ${
          isDarkMode 
            ? 'bg-[#181D28]/95 border-[#2B354B] shadow-[0_12px_40px_rgba(0,0,0,0.6)]' 
            : 'bg-[#FFFFFF]/95 border-[#CBD5E1] shadow-[0_12px_40px_rgba(0,30,80,0.12)]'
        }`}>
          {Object.entries(PILLARS).map(([pillarKey, pillar]) => {
            const Icon = PILLAR_ICONS[pillarKey] || Layers;
            const isSelected = selectedPillarKey === pillarKey;

            return (
              <div key={pillarKey} className="relative group">
                <button
                  onClick={() => handlePillarClick(pillarKey)}
                  className={`btn-tactile w-10 h-10 flex items-center justify-center transition-all border ${
                    isSelected
                      ? 'border-[#0091DA] bg-[#0091DA]/20 text-white shadow-md'
                      : isDarkMode
                        ? 'border-transparent text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/15'
                        : 'border-transparent text-slate-600 hover:text-[#00338D] hover:bg-[#F0F4FA] hover:border-[#CBD5E1]'
                  }`}
                  style={{
                    borderLeft: isSelected ? `3px solid ${pillar.color}` : undefined
                  }}
                  title={pillar.label}
                >
                  <Icon 
                    className="w-4 h-4 transition-transform group-hover:scale-110" 
                    style={{ color: isSelected ? '#0091DA' : pillar.color }} 
                  />
                </button>

                {/* Text ONLY upon hover tooltip (right side of icon) */}
                <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono font-bold whitespace-nowrap shadow-xl border pointer-events-none z-30 animate-in fade-in slide-in-from-left-1 duration-100 ${
                  isDarkMode 
                    ? 'bg-[#001438] text-white border-[#00338D]' 
                    : 'bg-[#001E50] text-white border-[#00338D]'
                }`}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pillar.color }} />
                  <span>{pillar.label}</span>
                  <span className="text-[10px] text-slate-400">({pillar.items.length})</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Respective Box upon Click (Floating Popover Box directly next to clicked pillar) */}
        {selectedPillarKey && activePillarDef && (
          <div 
            className={`w-[440px] border shadow-2xl animate-in fade-in slide-in-from-left-2 duration-150 z-30 overflow-hidden ${
              isDarkMode 
                ? 'bg-[#141824] border-[#2B354B] text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)]' 
                : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0B0F19] shadow-[0_20px_60px_rgba(0,30,80,0.2)]'
            }`}
            style={{ borderTop: `4px solid ${activePillarDef.color}` }}
          >
            {/* Popover Header */}
            <div className={`p-3.5 border-b flex items-center justify-between ${
              isDarkMode ? 'bg-[#181D2A] border-[#2B354B]' : 'bg-[#F8F9FB] border-[#E0E0E0]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-7 h-7 flex items-center justify-center shrink-0 shadow-inner"
                  style={{ 
                    backgroundColor: activePillarDef.bgColor, 
                    color: activePillarDef.color,
                    border: `1px solid ${activePillarDef.color}40`
                  }}
                >
                  {React.createElement(PILLAR_ICONS[selectedPillarKey] || Layers, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight">{activePillarDef.label}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Port: {activePillarDef.socketId} • Click to instantiate</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPillarKey(null)}
                className={`btn-tactile p-1 transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-[#0B0F19] hover:bg-[#E0E0E0]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className={`p-2.5 border-b ${isDarkMode ? 'bg-[#141824] border-[#2B354B]' : 'bg-[#FFFFFF] border-[#E0E0E0]'}`}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search ${activePillarDef.label}...`}
                  value={canvasSearch}
                  onChange={(e) => setCanvasSearch(e.target.value)}
                  className={`w-full pl-8 pr-2.5 py-1.5 text-xs focus:outline-none rounded-none font-mono ${
                    isDarkMode 
                      ? 'bg-[#1E2433] border border-[#2B354B] text-white placeholder-slate-500 focus:border-[#0091DA]' 
                      : 'bg-[#FFFFFF] border border-[#CBD5E1] text-[#0B0F19] placeholder-slate-400 focus:border-[#00338D]'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Items List */}
            <div className={`max-h-[340px] overflow-y-auto p-2 space-y-2 ${
              isDarkMode ? 'bg-[#10131C]' : 'bg-[#F8F9FB]'
            }`}>
              {activePillarDef.items
                .filter(item => 
                  !canvasSearch || 
                  item.name.toLowerCase().includes(canvasSearch.toLowerCase()) || 
                  item.description.toLowerCase().includes(canvasSearch.toLowerCase())
                )
                .map((item) => {
                  let ItemIcon = PILLAR_ICONS[selectedPillarKey] || Layers;
                  if (item.id === 'tool-audio-transcribe') ItemIcon = Mic;
                  if (item.id === 'tool-doc-parser') ItemIcon = FileText;
                  if (item.id === 'tool-text-box-ingest') ItemIcon = Type;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleAddFromCanvas(selectedPillarKey, item)}
                      className={`group p-2.5 border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isDarkMode
                          ? 'border-[#2B354B] bg-[#181D2A] hover:border-[#0091DA] hover:bg-[#202738]'
                          : 'border-[#CBD5E1] bg-[#FFFFFF] hover:border-[#00338D] hover:bg-[#F5F8FC]'
                      }`}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <ItemIcon className="w-3.5 h-3.5 shrink-0" style={{ color: activePillarDef.color }} />
                          <span className={`text-xs font-bold truncate ${
                            isDarkMode ? 'text-white group-hover:text-[#0091DA]' : 'text-[#0B0F19] group-hover:text-[#00338D]'
                          }`}>
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <button
                        className="btn-tactile px-2 py-1 bg-[#00338D] text-white text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 mt-0.5 border border-[#0091DA]/40 group-hover:bg-[#005EB8]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Incompatible Socket Alert Modal / Toast */}
      {invalidConnectionAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-6 py-3.5 bg-[#001E50] border-l-4 border-[#6D2077] shadow-[0_16px_40px_rgba(0,30,80,0.5)] text-white animate-in slide-in-from-top-3 duration-150">
          <AlertTriangle className="w-5 h-5 text-[#EAAA00] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white tracking-wide">Incompatible Socket Rejection: </span>
            <span className="text-slate-200">
              Cannot connect <strong className="text-white bg-white/10 px-1.5 py-0.5">{invalidConnectionAlert.sourceName}</strong> to socket <code className="px-1.5 py-0.5 bg-[#00338D] text-white font-mono text-[11px] font-bold">{invalidConnectionAlert.targetHandle}</code>.
            </span>
            <div className="text-[11px] text-[#0091DA] mt-0.5 font-semibold">
              Requires an architectural block of type: <strong className="uppercase underline">{invalidConnectionAlert.requiredType}</strong>.
            </div>
          </div>
          <button
            onClick={() => setInvalidConnectionAlert(null)}
            className="btn-tactile text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white transition-colors ml-4 font-bold border border-white/20"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bottom Center: Stitch-Style Agent Execution Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[540px] pointer-events-auto">
        <div className={`p-2.5 border shadow-2xl backdrop-blur-md flex flex-col gap-2 transition-colors ${
          isDarkMode 
            ? 'bg-[#181D28]/95 border-[#2B354B] shadow-[0_16px_48px_rgba(0,0,0,0.7)] text-white' 
            : 'bg-[#FFFFFF]/95 border-[#CBD5E1] shadow-[0_16px_48px_rgba(0,30,80,0.15)] text-[#0B0F19]'
        }`}>
          <div className="text-[11px] font-medium text-slate-400 px-1">
            What would you like the agent to execute or modify?
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0091DA] pl-1 font-mono">/</span>
            <input
              type="text"
              placeholder="e.g. Synthesize transcripts and extract owner action items..."
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              className={`flex-1 text-xs focus:outline-none font-mono py-1 px-2 ${
                isDarkMode 
                  ? 'bg-transparent text-white placeholder-slate-500' 
                  : 'bg-transparent text-[#0B0F19] placeholder-slate-400'
              }`}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0091DA]/20 text-[#0091DA] border border-[#0091DA]/30 font-bold">
                Live
              </span>
              <button
                className="w-7 h-7 bg-[#00338D] hover:bg-[#005EB8] text-white flex items-center justify-center transition-colors shadow-sm"
                title="Send Command"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ReactFlow Workspace with Stitch Dot Grid */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onSelectNode(node)}
        onPaneClick={() => {
          onSelectNode(null);
          setSelectedPillarKey(null);
        }}
        nodeTypes={nodeTypes}
        isValidConnection={isValidConnection}
        fitView
        minZoom={0.25}
        maxZoom={1.75}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color={isDarkMode ? '#2D3548' : '#CBD5E1'} 
        />
        <Controls className={`!shadow-lg ${
          isDarkMode 
            ? '!bg-[#181D28] !border-[#2B354B] !fill-slate-300 [&>button]:!bg-[#181D28] [&>button]:!border-[#2B354B] [&>button]:!text-slate-300 hover:[&>button]:!bg-[#202738]' 
            : '!bg-[#FFFFFF] !border-[#CBD5E1] !fill-[#00338D] [&>button]:!bg-[#FFFFFF] [&>button]:!border-[#CBD5E1] [&>button]:!text-[#00338D] hover:[&>button]:!bg-[#F5F6F8]'
        }`} />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'agentCore') return '#00338D';
            return PILLARS[n.data?.pillarType]?.color || '#005EB8';
          }}
          maskColor={isDarkMode ? 'rgba(16, 19, 26, 0.85)' : 'rgba(245, 246, 248, 0.85)'}
          className={`!shadow-lg !bottom-24 !right-6 ${
            isDarkMode ? '!bg-[#181D28] !border-[#2B354B]' : '!bg-[#FFFFFF] !border-[#CBD5E1]'
          }`}
        />
      </ReactFlow>
    </div>
  );
}
