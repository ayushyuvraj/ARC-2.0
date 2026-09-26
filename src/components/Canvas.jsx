import React, { useCallback } from 'react';
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
import { ShieldAlert, Info, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

const nodeTypes = {
  agentCore: AgentCoreNode,
  pillar: PillarNode
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
  setInvalidConnectionAlert
}) {
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

  return (
    <div className="relative w-full h-full bg-[#F5F6F8] overflow-hidden select-none">
      {/* Top Institutional Socket Enforcer Bar */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-4 px-4 py-2.5 bg-[#FFFFFF] border border-[#CBD5E1] shadow-[0_6px_20px_rgba(0,30,80,0.08)] pointer-events-auto">
        <div className="flex items-center gap-2 border-r border-[#E0E0E0] pr-3">
          <Info className="w-4 h-4 text-[#00338D]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00338D] font-mono">
            Socket Enforcer:
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#00338D]">
            <span className="w-2.5 h-2.5 bg-[#00338D] shadow-sm" />
            Model
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#009A44]">
            <span className="w-2.5 h-2.5 bg-[#009A44] shadow-sm" />
            Skills
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#00A3A6]">
            <span className="w-2.5 h-2.5 bg-[#00A3A6] shadow-sm" />
            MCP
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#005EB8]">
            <span className="w-2.5 h-2.5 bg-[#005EB8] shadow-sm" />
            Tools
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#9E6D00]">
            <span className="w-2.5 h-2.5 bg-[#EAAA00] shadow-sm" />
            Gateway
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#483698]">
            <span className="w-2.5 h-2.5 bg-[#483698] shadow-sm" />
            Memory
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#6D2077]">
            <span className="w-2.5 h-2.5 bg-[#6D2077] shadow-sm" />
            Policies
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
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-6 py-4 bg-[#001E50] border-l-4 border-[#6D2077] shadow-[0_16px_40px_rgba(0,30,80,0.4)] text-white animate-in slide-in-from-top-3 duration-150">
          <AlertTriangle className="w-5 h-5 text-[#EAAA00] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white tracking-wide">Incompatible Socket Rejection: </span>
            <span className="text-slate-200">
              Cannot connect <strong className="text-white bg-white/10 px-1.5 py-0.5">{invalidConnectionAlert.sourceName}</strong> to socket <code className="px-1.5 py-0.5 bg-[#00338D] text-white font-mono text-[11px] font-bold">{invalidConnectionAlert.targetHandle}</code>.
            </span>
            <div className="text-[11px] text-[#0091DA] mt-1 font-semibold">
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

      {/* ReactFlow Workspace */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onSelectNode(node)}
        onPaneClick={() => onSelectNode(null)}
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
          className="!bg-[#FFFFFF] !border-[#CBD5E1] !shadow-md"
        />
      </ReactFlow>
    </div>
  );
}
