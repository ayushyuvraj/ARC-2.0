import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, UserCheck, ArrowUpRight, Send, Plus } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  actionType: string;
  targetResourceId: string;
  requestedBy: string;
  reason: string;
  riskAssessment: {
    level: string;
    affectedEntitiesCount: number;
    details: string;
  };
  status: string;
  reviewedBy?: string;
  reviewComment?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface ApprovalsQueueProps {
  approvals: ApprovalRequest[];
  onRefresh: () => void;
}

export const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({ approvals, onRefresh }) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [reviewerRole, setReviewerRole] = useState('ROLE_SECURITY_OFFICER');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // New Request Form State
  const [newActionType, setNewActionType] = useState('DEPLOY_PRODUCTION');
  const [newTargetResource, setNewTargetResource] = useState('app_tars');
  const [newReason, setNewReason] = useState('');
  const [creating, setCreating] = useState(false);

  const filteredApprovals = approvals.filter((a) => (filter === 'ALL' ? true : a.status === filter));

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedApproval) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/governance/approvals/${selectedApproval.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reviewerRole,
          comment: reviewComment || (decision === 'APPROVED' ? 'Approved per enterprise compliance standards' : 'Rejected due to risk assessment')
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedApproval(null);
        setReviewComment('');
        onRefresh();
      } else {
        alert(`Error: ${data.error?.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason) return;
    setCreating(true);
    try {
      const res = await fetch('/api/v1/governance/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: newActionType,
          targetResourceId: newTargetResource,
          requestedBy: 'platform-architect@kpmg.com',
          reason: newReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewModal(false);
        setNewReason('');
        onRefresh();
      } else {
        alert(`Error: ${data.error?.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60">CRITICAL RISK</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">HIGH RISK</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950/60 text-blue-400 border border-blue-800/60">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-400 border border-gray-700">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            PENDING REVIEW
          </span>
        );
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-arc-surface p-1 rounded-lg border border-arc-border text-xs">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab}
              {tab === 'PENDING' && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px]">
                  {approvals.filter((a) => a.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Approval Request</span>
        </button>
      </div>

      {/* Approvals Table / Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredApprovals.map((req) => (
          <div
            key={req.id}
            className="p-5 rounded-xl border border-arc-border bg-arc-card/70 hover:border-gray-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-400">{req.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-arc-surface border border-arc-border text-gray-300 font-mono">
                  {req.actionType}
                </span>
                {getRiskBadge(req.riskAssessment?.level || 'LOW')}
                {getStatusBadge(req.status)}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Target:</span>
                  <span className="font-mono text-blue-300">{req.targetResourceId}</span>
                </h4>
                <p className="text-xs text-gray-300 mt-1">{req.reason}</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-gray-400">
                <span>Requested by: <strong className="text-gray-300">{req.requestedBy}</strong></span>
                <span>•</span>
                <span>Affected Downstream Entities: <strong className="text-amber-400">{req.riskAssessment?.affectedEntitiesCount || 0}</strong></span>
                <span>•</span>
                <span>Created: {new Date(req.createdAt).toLocaleString()}</span>
              </div>

              {req.reviewedBy && (
                <div className="mt-2 p-2.5 rounded bg-arc-surface/60 border border-arc-border text-xs space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reviewed by: <strong className="text-white">{req.reviewedBy}</strong></span>
                    <span>on {new Date(req.reviewedAt!).toLocaleString()}</span>
                  </div>
                  {req.reviewComment && (
                    <p className="text-gray-300 italic pl-5 text-[11px]">"{req.reviewComment}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {req.status === 'PENDING' && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedApproval(req);
                    setReviewComment('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Review & Decide</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredApprovals.length === 0 && (
          <div className="p-12 text-center rounded-xl border border-arc-border bg-arc-card/40 text-gray-400 text-xs">
            No approval requests found for filter: <strong className="text-white">{filter}</strong>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-arc-border rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-arc-border">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Enterprise Governance Sign-off</span>
              </h3>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-arc-surface border border-arc-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Request ID:</span>
                <span className="font-mono text-white font-bold">{selectedApproval.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Action:</span>
                <span className="font-mono text-blue-400">{selectedApproval.actionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Resource:</span>
                <span className="font-mono text-white">{selectedApproval.targetResourceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Calculated Blast Radius Risk:</span>
                {getRiskBadge(selectedApproval.riskAssessment?.level || 'LOW')}
              </div>
              <div className="pt-2 border-t border-gray-800 text-gray-300">
                <strong>Justification:</strong> {selectedApproval.reason}
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Signing Authority Role:</label>
              <select
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ROLE_SECURITY_OFFICER">Chief Information Security Officer (CISO)</option>
                <option value="ROLE_TAX_LEAD">Tax & Domain Practice Lead (SME)</option>
                <option value="ROLE_PLATFORM_ADMIN">Platform Super Administrator</option>
              </select>
            </div>

            {/* Audit Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Auditor Sign-off Justification:</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Enter formal compliance sign-off rationale or statutory citation..."
                rows={3}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-arc-border">
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision('REJECTED')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Request</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision('APPROVED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize & Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Approval Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleCreateRequest} className="bg-[#111827] border border-arc-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-arc-border">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Submit Approval Request</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Governance Action Type:</label>
              <select
                value={newActionType}
                onChange={(e) => setNewActionType(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="DEPLOY_PRODUCTION">Deploy Application to Production Target</option>
                <option value="DISABLE_SHARED_TOOL">Disable Shared Deterministic Tool</option>
                <option value="CHANGE_POLICY">Update Authoritative Policy Version</option>
                <option value="UPDATE_MODEL">Promote / Switch Foundation Model</option>
                <option value="CLASSIFICATION_OVERRIDE">Override Restricted Data Classification</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Target Resource Identifier:</label>
              <input
                type="text"
                value={newTargetResource}
                onChange={(e) => setNewTargetResource(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Business Justification & Impact Scope:</label>
              <textarea
                required
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Explain why this promotion, toggle, or override is required..."
                rows={4}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-arc-border">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{creating ? 'Analyzing Blast Radius...' : 'Submit for Multi-Role Sign-off'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
