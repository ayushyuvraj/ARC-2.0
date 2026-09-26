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
  ChevronUp,
  ChevronDown,
  Layers,
  Mic,
  FileText,
  Type
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
  onAddNode
}) {
  const [selectedPillarKey, setSelectedPillarKey] = useState(null);
  const [isDockExpanded, setIsDockExpanded] = useState(true);
  const [canvasSearch, setCanvasSearch] = useState('');

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
    <div className="relative w-full h-full bg-[#F5F6F8] overflow-hidden select-none">
      {/* Top Institutional Socket Enforcer HUD Bar */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-4 px-4 py-2 bg-[#FFFFFF] border border-[#CBD5E1] shadow-[0_4px_16px_rgba(0,30,80,0.06)] pointer-events-auto">
        <div className="flex items-center gap-2 border-r border-[#E0E0E0] pr-3">
          <Info className="w-3.5 h-3.5 text-[#00338D]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00338D] font-mono">
            Socket Enforcer:
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 font-bold text-[#00338D]">
            <Brain className="w-3 h-3 text-[#00338D]" />
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
          <span className="flex items-center gap-1 font-bold text-[#0091DA]">
            <Wrench className="w-3 h-3 text-[#0091DA]" />
            Tools
          </span>
          <span className="flex items-center gap-1 font-bold text-[#9E6D00]">
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
          <span className="flex items-center gap-1 font-bold text-[#001E50]">
            <Fingerprint className="w-3 h-3 text-[#001E50]" />
            Audit
          </span>
          <span className="flex items-center gap-1 font-bold text-[#0091DA]">
            <Activity className="w-3 h-3 text-[#0091DA]" />
            Telemetry
          </span>
          <span className="flex items-center gap-1 font-bold text-[#9E6D00]">
            <Coins className="w-3 h-3 text-[#EAAA00]" />
            ROI
          </span>
        </div>

        <div className="border-l border-[#E0E0E0] pl-3 flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="font-bold text-[#00338D]">{nodes.length}</span> Blocks
          <span>•</span>
          <span className="font-bold text-[#00338D]">{edges.length}</span> Links
        </div>
      </div>

      {/* Incompatible Socket Alert Modal / Toast */}
      {invalidConnectionAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-6 py-3.5 bg-[#001E50] border-l-4 border-[#6D2077] shadow-[0_16px_40px_rgba(0,30,80,0.4)] text-white animate-in slide-in-from-top-3 duration-150">
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

      {/* Floating Canvas Component Popover Card (when a pillar is clicked on the canvas) */}
      {selectedPillarKey && activePillarDef && (
        <div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[480px] bg-[#FFFFFF] border-2 border-[#00338D] shadow-[0_16px_48px_rgba(0,30,80,0.22)] animate-in fade-in slide-in-from-bottom-2 duration-150"
          style={{ borderTop: `4px solid ${activePillarDef.color}` }}
        >
          {/* Header */}
          <div className="p-3 bg-[#F8F9FB] border-b border-[#E0E0E0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {React.createElement(PILLAR_ICONS[selectedPillarKey] || Layers, {
                className: 'w-4 h-4',
                style: { color: activePillarDef.color }
              })}
              <div>
                <h4 className="text-xs font-bold text-[#0B0F19] tracking-tight">{activePillarDef.label}</h4>
                <p className="text-[10px] text-slate-500 font-mono">Port: {activePillarDef.socketId} • Click to instantiate on canvas</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPillarKey(null)}
              className="btn-tactile p-1 text-slate-400 hover:text-[#0B0F19] hover:bg-[#E0E0E0] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search inside selected pillar */}
          <div className="p-2 border-b border-[#E0E0E0] bg-[#FFFFFF]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={`Search ${activePillarDef.label} items...`}
                value={canvasSearch}
                onChange={(e) => setCanvasSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#0B0F19] focus:outline-none focus:border-[#00338D] rounded-none font-mono"
                autoFocus
              />
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1.5 bg-[#F8F9FB]">
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
                    className="group p-2.5 border border-[#CBD5E1] bg-[#FFFFFF] hover:border-[#00338D] hover:bg-[#F5F8FC] cursor-pointer transition-all flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <ItemIcon className="w-3.5 h-3.5 shrink-0" style={{ color: activePillarDef.color }} />
                        <span className="text-xs font-bold text-[#0B0F19] group-hover:text-[#00338D]">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <button
                      className="btn-tactile px-2 py-1 bg-[#E6EDF7] group-hover:bg-[#00338D] text-[#00338D] group-hover:text-white text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 mt-0.5 border border-[#00338D]/20"
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

      {/* Floating Canvas Component Dock (Anchored right on the main visual canvas screen) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        {/* Toggle Bar / Header */}
        <div className="flex items-center justify-between w-full px-3 py-1 bg-[#001E50] border-t-2 border-[#0091DA] text-white shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold tracking-widest text-[#0091DA] uppercase">
              CANVAS ARCHITECTURAL DOCK
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#00338D] rounded-full text-slate-200 border border-white/20">
              10 Pillars
            </span>
          </div>

          <button
            onClick={() => setIsDockExpanded(!isDockExpanded)}
            className="btn-tactile text-slate-300 hover:text-white flex items-center gap-1 text-[10px] font-mono transition-colors p-0.5"
            title={isDockExpanded ? 'Collapse Dock' : 'Expand Dock'}
          >
            <span>{isDockExpanded ? 'Hide' : 'Show'}</span>
            {isDockExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 10 Intuitive Pillar Buttons */}
        {isDockExpanded && (
          <div className="flex items-center gap-1.5 p-2 bg-[#FFFFFF] border-2 border-[#001E50] border-t-0 shadow-[0_12px_36px_rgba(0,30,80,0.18)]">
            {Object.entries(PILLARS).map(([pillarKey, pillar]) => {
              const Icon = PILLAR_ICONS[pillarKey] || Layers;
              const isSelected = selectedPillarKey === pillarKey;

              return (
                <button
                  key={pillarKey}
                  onClick={() => handlePillarClick(pillarKey)}
                  className={`btn-tactile flex flex-col items-center justify-center w-18 h-15 p-1 transition-all border relative ${
                    isSelected
                      ? 'border-[#00338D] bg-[#E6EDF7] shadow-md -translate-y-1'
                      : 'border-[#CBD5E1] bg-[#FFFFFF] hover:border-[#00338D] hover:bg-[#F8F9FB] hover:-translate-y-0.5'
                  }`}
                  style={{ borderBottom: `3px solid ${pillar.color}` }}
                  title={`Click to open ${pillar.label} components`}
                >
                  <div
                    className="w-7 h-7 flex items-center justify-center shrink-0 mb-0.5"
                    style={{ 
                      backgroundColor: pillar.bgColor, 
                      color: pillar.color,
                      border: `1px solid ${pillar.color}40`
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-[#0B0F19] tracking-tight truncate max-w-full">
                    {pillar.label.split(' ')[0]}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 -mt-0.5">
                    {pillar.items.length} items
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ReactFlow Workspace */}
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
        <Background variant={BackgroundVariant.Lines} gap={32} size={1} color="#CBD5E1" />
        <Controls className="!bg-[#FFFFFF] !border-[#CBD5E1] !fill-[#00338D] [&>button]:!bg-[#FFFFFF] [&>button]:!border-[#CBD5E1] [&>button]:!text-[#00338D] hover:[&>button]:!bg-[#F5F6F8] !shadow-md" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'agentCore') return '#00338D';
            return PILLARS[n.data?.pillarType]?.color || '#005EB8';
          }}
          maskColor="rgba(245, 246, 248, 0.8)"
          className="!bg-[#FFFFFF] !border-[#CBD5E1] !shadow-md !bottom-24"
        />
      </ReactFlow>
    </div>
  );
}
