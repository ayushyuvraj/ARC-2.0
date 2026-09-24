import React, { useEffect, useState } from 'react';
import { History, Search, Filter, ShieldCheck, ChevronDown, ChevronRight, Eye } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResourceType, setSelectedResourceType] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    const query = selectedResourceType !== 'ALL' ? `?resourceType=${selectedResourceType}` : '';
    fetch(`/api/v1/governance/audit-logs${query}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setLogs(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedResourceType]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionBadge = (what: string) => {
    if (what.includes('APPROVE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{what}</span>;
    }
    if (what.includes('REJECT') || what.includes('BLOCKED') || what.includes('VIOLATION')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">{what}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">{what}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <span>Cryptographic Tamper-Evident Audit Trail</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable append-only records tracking administrative mutations, policy overrides, and governance decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-arc-surface p-1 rounded-lg border border-arc-border text-xs">
            {['ALL', 'APPROVAL_REQUEST', 'WORKFLOW', 'DATA_CLASSIFICATION'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedResourceType(type)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedResourceType === type ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 bg-arc-surface hover:bg-arc-card text-gray-300 hover:text-white rounded-md border border-arc-border text-xs transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-arc-border bg-arc-surface/60 text-gray-300">
              <th className="py-3 px-4 font-semibold text-white">Timestamp</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Actor (Who)</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Action (What)</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Resource</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Justification</th>
              <th className="py-3 px-4 font-semibold text-gray-300 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arc-border/60">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => toggleExpand(log.id)}
                    className="hover:bg-arc-surface/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-white max-w-xs truncate">
                      {log.who}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.what)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-300">
                      <div>{log.resourceId}</div>
                      <div className="text-[10px] text-gray-500">{log.resourceType}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 max-w-sm truncate">
                      {log.justification}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="text-gray-400 hover:text-white p-1">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-arc-surface/60">
                      <td colSpan={6} className="p-4 border-y border-arc-border/80">
                        <div className="space-y-3 max-w-4xl">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-400">Log Entry ID:</span>
                            <span className="font-mono text-white font-bold">{log.id}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">Environment:</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-900/60">
                              {log.environment}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-[11px] font-semibold text-gray-400 mb-1">State Before Action:</div>
                              <pre className="p-3 rounded-lg bg-black/60 border border-arc-border text-gray-300 font-mono text-[11px] overflow-x-auto max-h-36">
                                {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : 'null (Created)'}
                              </pre>
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold text-gray-400 mb-1">State After Action:</div>
                              <pre className="p-3 rounded-lg bg-black/60 border border-arc-border text-gray-300 font-mono text-[11px] overflow-x-auto max-h-36">
                                {log.afterState ? JSON.stringify(log.afterState, null, 2) : 'null'}
                              </pre>
                            </div>
                          </div>

                          <div className="text-xs text-gray-300">
                            <strong>Full Signed Justification:</strong> {log.justification}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                  No audit logs recorded for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
