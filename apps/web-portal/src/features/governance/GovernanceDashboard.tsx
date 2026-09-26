import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Lock, History, AlertCircle } from 'lucide-react';
import { ApprovalsQueue } from './ApprovalsQueue.js';
import { RbacMatrixViewer } from './RbacMatrixViewer.js';
import { DataClassificationGuard } from './DataClassificationGuard.js';
import { AuditLogViewer } from './AuditLogViewer.js';

export const GovernanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'rbac' | 'classification' | 'audit'>('approvals');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = () => {
    fetch('/api/v1/governance/approvals')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setApprovals(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-arc-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Governance, RBAC, Approvals & Boundary Guards</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Enterprise authority framework: multi-role sign-offs, least-privilege matrix, data classification boundaries, and tamper-evident audit logging.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-arc-surface p-1 rounded-lg border border-arc-border text-xs">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'approvals' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Approvals Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'rbac' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>RBAC Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('classification')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'classification' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Data Classification</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'audit' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'approvals' && (
        <ApprovalsQueue approvals={approvals} onRefresh={fetchApprovals} />
      )}

      {activeTab === 'rbac' && <RbacMatrixViewer />}

      {activeTab === 'classification' && <DataClassificationGuard />}

      {activeTab === 'audit' && <AuditLogViewer />}
    </div>
  );
};
