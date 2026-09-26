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
import { ShieldAlert, Info } from 'lucide-react';

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
    <div className="relative w-full h-full bg-[#F8F9FB] overflow-hidden select-none">
      {/* Visual Socket Compatibility Bar (Top Banner) */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-3.5 px-4 py-2 bg-[#FFFFFF] border border-[#CBD5E1] shadow-[0_4px_16px_rgba(0,30,80,0.08)] pointer-events-auto">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00338D] flex items-center gap-1.5 font-mono">
          <Info className="w-3.5 h-3.5 text-[#00338D]" />
          Socket Enforcer:
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#00338D]">
            <span className="w-2 h-2 bg-[#00338D]" />
            Model
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#009A44]">
            <span className="w-2 h-2 bg-[#009A44]" />
            Skills
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#00A3A6]">
            <span className="w-2 h-2 bg-[#00A3A6]" />
            MCP
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#005EB8]">
            <span className="w-2 h-2 bg-[#005EB8]" />
            Tools
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#9E6D00]">
            <span className="w-2 h-2 bg-[#EAAA00]" />
            Gateway
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#483698]">
            <span className="w-2 h-2 bg-[#483698]" />
            Memory
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#6D2077]">
            <span className="w-2 h-2 bg-[#6D2077]" />
            Policies
          </span>
        </div>
      </div>

      {/* Invalid Connection Toast Alert */}
      {invalidConnectionAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3.5 px-5 py-3.5 bg-[#001E50] border-l-4 border-[#6D2077] shadow-[0_12px_32px_rgba(0,30,80,0.35)] text-white">
          <ShieldAlert className="w-5 h-5 text-[#EAAA00] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white tracking-wide">Incompatible Socket Rejection: </span>
            <span className="text-slate-200">
              Cannot connect <strong className="text-white">{invalidConnectionAlert.sourceName}</strong> to socket <code className="px-1.5 py-0.5 bg-[#00338D] text-white font-mono text-[11px]">{invalidConnectionAlert.targetHandle}</code>.
            </span>
            <div className="text-[11px] text-[#0091DA] mt-0.5 font-medium">
              Requires a <strong>{invalidConnectionAlert.requiredType?.toUpperCase()}</strong> architectural block.
            </div>
          </div>
          <button
            onClick={() => setInvalidConnectionAlert(null)}
            className="btn-tactile text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white transition-colors ml-3 font-bold"
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
        minZoom={0.3}
        maxZoom={1.6}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#CBD5E1" />
        <Controls className="!bg-[#FFFFFF] !border-[#CBD5E1] !fill-[#00338D] [&>button]:!bg-[#FFFFFF] [&>button]:!border-[#E0E0E0] [&>button]:!text-[#00338D] hover:[&>button]:!bg-[#F5F6F8] !shadow-sm" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'agentCore') return '#00338D';
            return PILLARS[n.data?.pillarType]?.color || '#005EB8';
          }}
          maskColor="rgba(248, 249, 251, 0.75)"
          className="!bg-[#FFFFFF] !border-[#CBD5E1] !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
