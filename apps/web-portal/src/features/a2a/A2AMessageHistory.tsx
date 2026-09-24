import React, { useEffect, useState } from 'react';
import { History, ChevronDown, ChevronRight, Radio, RefreshCw, Clock, DollarSign, Layers } from 'lucide-react';

export const A2AMessageHistory: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = () => {
    setLoading(true);
    fetch('/api/v1/a2a/messages')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setMessages(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <span>A2A Inter-Agent Transaction Telemetry Log</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable cross-cloud message envelope records with latency, token consumption, and policy provenance.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-arc-surface hover:bg-arc-card text-xs text-gray-300 hover:text-white border border-arc-border transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-arc-border bg-arc-surface/60 text-gray-300">
              <th className="py-3 px-4 font-semibold text-white">Timestamp</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Correlation ID</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Sender</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Recipient</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Operation</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Latency</th>
              <th className="py-3 px-4 font-semibold text-gray-300">Tokens</th>
              <th className="py-3 px-4 font-semibold text-gray-300 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arc-border/60">
            {messages.map((m) => {
              const isExpanded = expandedId === m.id;
              return (
                <React.Fragment key={m.id}>
                  <tr
                    onClick={() => toggleExpand(m.id)}
                    className="hover:bg-arc-surface/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-400 text-[11px] max-w-xs truncate">
                      {m.correlationId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{m.senderAgentId}</div>
                      <div className="text-[10px] text-gray-500 font-mono">[{m.senderExecutionPlane}]</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{m.recipientAgentId}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">[{m.classification}]</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-arc-surface border border-arc-border text-[11px]">
                        {m.operation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white">{m.latencyMs}ms</td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">{m.tokensUsed}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="text-gray-400 hover:text-white p-1">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-arc-surface/60">
                      <td colSpan={8} className="p-4 border-y border-arc-border/80">
                        <div className="space-y-3 max-w-4xl text-xs">
                          {m.policyCitation && (
                            <div className="text-emerald-300 text-xs">
                              <strong>Policy Citation:</strong> {m.policyCitation}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <div className="text-[11px] font-semibold text-gray-400 mb-1">Request Payload:</div>
                              <pre className="p-3 rounded-lg bg-black/60 border border-arc-border text-gray-300 font-mono text-[11px] overflow-x-auto max-h-36">
                                {JSON.stringify(m.requestPayload, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold text-gray-400 mb-1">Response Payload:</div>
                              <pre className="p-3 rounded-lg bg-black/60 border border-arc-border text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-36">
                                {JSON.stringify(m.responsePayload, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {messages.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-gray-400">
                  No A2A messages recorded yet. Dispatch an envelope to observe real-time trace telemetry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
