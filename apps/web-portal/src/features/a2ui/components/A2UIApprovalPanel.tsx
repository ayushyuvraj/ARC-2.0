import React, { useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, FileQuestion, Send } from 'lucide-react';

interface ActionItem {
  id: string;
  label: string;
  variant: 'PRIMARY' | 'DANGER' | 'SECONDARY';
}

export interface A2UIApprovalPanelProps {
  actions: ActionItem[];
  requireComment?: boolean;
  resumeToken?: string;
  onAction?: (actionId: string, comment: string) => void;
}

export const A2UIApprovalPanel: React.FC<A2UIApprovalPanelProps> = ({
  actions = [],
  requireComment = true,
  resumeToken,
  onAction
}) => {
  const [comment, setComment] = useState('Approved discrepancy under Section 16(2) statutory tolerance guidelines');
  const [submitting, setSubmitting] = useState(false);
  const [submittedAction, setSubmittedAction] = useState<string | null>(null);

  const handleActionClick = (actionId: string) => {
    setSubmitting(true);
    if (onAction) {
      onAction(actionId, comment);
    }
    setSubmittedAction(actionId);
    setTimeout(() => setSubmitting(false), 500);
  };

  const getButtonClass = (variant: string) => {
    switch (variant) {
      case 'PRIMARY':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30';
      case 'DANGER':
        return 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500/30';
      default:
        return 'bg-arc-surface hover:bg-arc-card text-gray-300 hover:text-white border-arc-border';
    }
  };

  const getActionIcon = (id: string) => {
    if (id.includes('APPROVE')) return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
    if (id.includes('REJECT')) return <XCircle className="w-4 h-4 mr-1.5" />;
    return <FileQuestion className="w-4 h-4 mr-1.5" />;
  };

  return (
    <div className="p-5 rounded-xl border border-arc-border bg-arc-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-arc-border">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Human-in-the-Loop Sign-off & Resumption Controls</span>
        </h4>
        {resumeToken && (
          <span className="font-mono text-[10px] text-gray-400 bg-arc-surface px-2 py-0.5 rounded border border-arc-border">
            Token: {resumeToken}
          </span>
        )}
      </div>

      {requireComment && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Auditor Sign-off Justification:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Enter mandatory auditor review notes or legal sign-off rationale..."
            className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {submittedAction ? (
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Action <strong>{submittedAction}</strong> executed! Resume token submitted to Workflow Runner.
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {actions.map((act) => (
            <button
              key={act.id}
              disabled={submitting}
              onClick={() => handleActionClick(act.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center shadow-md border transition-all ${getButtonClass(
                act.variant
              )}`}
            >
              {getActionIcon(act.id)}
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
