import React from 'react';
import { A2UICard, A2UICardProps } from './components/A2UICard.js';
import { A2UIComparisonPanel, A2UIComparisonPanelProps } from './components/A2UIComparisonPanel.js';
import { A2UIEvidencePanel, A2UIEvidencePanelProps } from './components/A2UIEvidencePanel.js';
import { A2UIApprovalPanel, A2UIApprovalPanelProps } from './components/A2UIApprovalPanel.js';
import { ShieldAlert, Layers } from 'lucide-react';

export interface A2UISurfacePayload {
  surfaceId: string;
  title: string;
  description?: string;
  components: Array<{
    type: string;
    id?: string;
    props: Record<string, unknown>;
  }>;
}

interface A2UIRendererProps {
  surface: A2UISurfacePayload;
  onAction?: (actionId: string, comment: string) => void;
}

export const A2UIRenderer: React.FC<A2UIRendererProps> = ({ surface, onAction }) => {
  if (!surface || !Array.isArray(surface.components)) {
    return (
      <div className="p-8 text-center text-xs text-rose-400 bg-rose-950/20 border border-rose-500/30 rounded-xl">
        Invalid A2UI Surface payload: missing components array.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Surface Header */}
      <div className="pb-4 border-b border-arc-border">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
            A2UI DYNAMIC SURFACE
          </span>
          <span className="font-mono text-[10px] text-gray-500">{surface.surfaceId}</span>
        </div>
        <h2 className="text-lg font-bold text-white mt-1">{surface.title}</h2>
        {surface.description && (
          <p className="text-xs text-gray-400 mt-0.5">{surface.description}</p>
        )}
      </div>

      {/* Render Controlled Components */}
      <div className="space-y-6">
        {surface.components.map((comp, idx) => {
          switch (comp.type) {
            case 'Card':
              return <A2UICard key={comp.id || idx} {...(comp.props as unknown as A2UICardProps)} />;

            case 'ComparisonPanel':
              return (
                <A2UIComparisonPanel
                  key={comp.id || idx}
                  {...(comp.props as unknown as A2UIComparisonPanelProps)}
                />
              );

            case 'EvidencePanel':
              return (
                <A2UIEvidencePanel
                  key={comp.id || idx}
                  {...(comp.props as unknown as A2UIEvidencePanelProps)}
                />
              );

            case 'ApprovalPanel':
              return (
                <A2UIApprovalPanel
                  key={comp.id || idx}
                  {...(comp.props as unknown as A2UIApprovalPanelProps)}
                  onAction={onAction}
                />
              );

            default:
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-amber-300"
                >
                  Controlled Vocabulary Notice: Unknown component type '{comp.type}' skipped to prevent unverified script injection.
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};
