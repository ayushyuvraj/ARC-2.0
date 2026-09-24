import React, { useEffect, useState } from 'react';
import { PlayCircle, Clock, CheckCircle2, AlertCircle, UserCheck, ChevronRight, X, Play, RefreshCw } from 'lucide-react';
import { TraceWaterfall } from '../observability/TraceWaterfall.js';

export const RunExplorer: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumeComment, setResumeComment] = useState('Approved discrepancy under Section 16(2) statutory tolerance guidelines');
  const [resuming, setResuming] = useState(false);

  const fetchRuns = () => {
    setLoading(true);
    fetch('/api/v1/runs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRuns(data.data);
          if (data.data.length > 0 && !selectedRun) {
            fetchRunDetail(data.data[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchRunDetail = (id: string) => {
    fetch(`/api/v1/runs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSelectedRun(data.data);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleResume = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedRun?.resumeToken) return;
    setResuming(true);
    try {
      const res = await fetch(`/api/v1/runs/${selectedRun.id}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeToken: selectedRun.resumeToken,
          decision,
          humanComment: resumeComment
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchRunDetail(selectedRun.id);
        fetchRuns();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResuming(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') {
      return (
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> COMPLETED
        </span>
      );
    }
    if (status === 'WAITING_FOR_HUMAN') {
      return (
        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold flex items-center gap-1 animate-pulse">
          <UserCheck className="w-3 h-3" /> ACTION REQUIRED
        </span>
      );
    }
    if (status === 'RUNNING') {
      return (
        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" /> RUNNING
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[10px] font-semibold">
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-arc-border">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-400" />
            <span>Workflow Runs & Execution Instances</span>
          </h1>
          <p className="text-xs text-gray-400">
            Inspect live execution checkpoints, token consumption, cost per transaction, and human sign-off gates.
          </p>
        </div>

        <button
          onClick={fetchRuns}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-arc-surface hover:bg-arc-card border border-arc-border text-xs text-gray-300 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Runs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Runs List (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Execution History</h3>
          <div className="border border-arc-border rounded-xl bg-arc-surface overflow-hidden divide-y divide-arc-border/60">
            {runs.map((r) => {
              const isSelected = selectedRun?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => fetchRunDetail(r.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-600/15 border-l-4 border-blue-500' : 'hover:bg-arc-card/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{r.application?.name || 'Workflow Run'}</h4>
                      <span className="text-[10px] font-mono text-gray-400">{r.id}</span>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400 font-mono">
                    <span>{new Date(r.startTime).toLocaleTimeString()}</span>
                    <span className="text-emerald-400 font-semibold">${(r.costTotalUsd || 0).toFixed(4)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Run Details (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedRun ? (
            <div className="p-6 rounded-xl border border-arc-border bg-arc-surface space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-arc-border">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedRun.application?.name}</h3>
                    {getStatusBadge(selectedRun.status)}
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">Run ID: {selectedRun.id}</span>
                </div>
              </div>

              {/* Human-In-The-Loop Action Gate */}
              {selectedRun.status === 'WAITING_FOR_HUMAN' && (
                <div className="p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                    <span>Human Approval Gate Active (Ambiguity Review Panel)</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    The Matching Agent and Tax Policy Agent identified ambiguous invoice discrepancies that require statutory sign-off before compiling the final audit report.
                  </p>

                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-semibold text-gray-300 block">Auditor Commentary & Citation</label>
                    <input
                      type="text"
                      value={resumeComment}
                      onChange={(e) => setResumeComment(e.target.value)}
                      className="w-full bg-arc-card border border-arc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => handleResume('APPROVED')}
                      disabled={resuming}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow disabled:opacity-50"
                    >
                      {resuming ? 'Resuming...' : 'Approve & Continue Workflow'}
                    </button>
                    <button
                      onClick={() => handleResume('REJECTED')}
                      disabled={resuming}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow disabled:opacity-50"
                    >
                      Reject Claim
                    </button>
                  </div>
                </div>
              )}

              {/* Run Metrics Summary */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-arc-card/60 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 block">Total Tokens:</span>
                  <span className="text-blue-400 font-semibold">{selectedRun.tokensTotal || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Model Cost:</span>
                  <span className="text-emerald-400 font-semibold">${(selectedRun.costTotalUsd || 0).toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Execution Plane:</span>
                  <span className="text-white font-semibold">Simulated GCC</span>
                </div>
              </div>

              {/* Traces Waterfall for this Run */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Execution Trace Waterfall (OpenTelemetry Spans)
                </h4>
                <TraceWaterfall spans={selectedRun.traces || []} />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-gray-500 bg-arc-surface rounded-xl border border-arc-border">
              Select a run from the history list to inspect its execution spans and state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
