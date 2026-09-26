import React, { useState } from 'react';
import { Send, ArrowRight, ShieldCheck, Zap, Bot, Radio, CheckCircle2, AlertCircle, FileCode, Layers } from 'lucide-react';

export const A2ADispatchConsole: React.FC = () => {
  const [senderAgent, setSenderAgent] = useState('agent_matching');
  const [senderPlane, setSenderPlane] = useState('AZURE');
  const [recipientAgent, setRecipientAgent] = useState('agent_tax_policy');
  const [operation, setOperation] = useState('evaluate_itc_admissibility');
  const [classification, setClassification] = useState('RESTRICTED');
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(
      {
        invoiceNo: 'INV-2026-9810',
        discrepancyType: 'ROUNDING_TOLERANCE',
        taxAmount: 42300.0,
        vendorGstin: '27AABCU9603R1ZM'
      },
      null,
      2
    )
  );

  const [dispatching, setDispatching] = useState(false);
  const [responseEnvelope, setResponseEnvelope] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);
    setResponseEnvelope(null);
    setErrorMsg(null);

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch (err: any) {
        setErrorMsg(`JSON Syntax Error in payload: ${err.message}`);
        setDispatching(false);
        return;
      }

      const res = await fetch('/api/v1/a2a/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolVersion: '1.0',
          sender: {
            agentId: senderAgent,
            agentVersion: '1.0.0',
            executionPlane: senderPlane
          },
          recipient: {
            agentId: recipientAgent,
            operation
          },
          securityContext: {
            tenantId: 'kpmg_enterprise_tenant',
            classification,
            callerPrincipal: 'matching_service@arc.local'
          },
          payload: parsedPayload
        })
      });

      const data = await res.json();
      if (data.success) {
        setResponseEnvelope(data.data);
      } else {
        setErrorMsg(data.error?.message || 'A2A Dispatch failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual Sequence Flow */}
      <div className="p-5 rounded-xl border border-arc-border bg-arc-surface/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
          A2A Cross-Cloud Dispatch Topology
        </h4>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Sender Node */}
          <div className="p-4 rounded-lg bg-arc-card border border-blue-500/40 w-full md:w-1/3 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-blue-400">Sender Agent ({senderPlane})</span>
            <div className="font-bold text-white text-sm">
              {senderAgent === 'agent_matching' ? 'TARS Matching Agent' : senderAgent}
            </div>
            <div className="font-mono text-[10px] text-gray-400">OpenAI GPT-4o (Azure)</div>
          </div>

          {/* Central Dispatch Fabric */}
          <div className="flex flex-col items-center justify-center text-center px-4">
            <ArrowRight className="w-5 h-5 text-blue-400 hidden md:block" />
            <div className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 font-mono text-[10px] border border-blue-500/30 my-1">
              A2A Envelope Dispatch Fabric
            </div>
            <span className="text-[10px] text-gray-400">OTel Trace Injected • Zero Script Execution</span>
          </div>

          {/* Recipient Node */}
          <div className="p-4 rounded-lg bg-arc-card border border-emerald-500/40 w-full md:w-1/3 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-400">Recipient Target</span>
            <div className="font-bold text-white text-sm">
              {recipientAgent === 'agent_tax_policy' ? 'TARS Tax Policy Agent' : recipientAgent}
            </div>
            <div className="font-mono text-[10px] text-gray-400">Google Gemini 1.5 Pro (Vertex AI)</div>
          </div>
        </div>
      </div>

      {/* Dispatcher Form & Interactive Payload Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleDispatch} className="p-6 rounded-xl border border-arc-border bg-arc-card space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-400" />
            <span>A2A Request Envelope Formulator</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Sender Agent:</label>
              <select
                value={senderAgent}
                onChange={(e) => setSenderAgent(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="agent_matching">agent_matching (Matching Agent)</option>
                <option value="agent_tax_policy">agent_tax_policy (Tax Policy Agent)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Sender Execution Plane:</label>
              <select
                value={senderPlane}
                onChange={(e) => setSenderPlane(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="AZURE">AZURE (Commercial)</option>
                <option value="VERTEX">VERTEX AI (GCP)</option>
                <option value="GCC">KPMG SOVEREIGN GCC</option>
                <option value="LOCAL">SIMULATED LOCAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Recipient Target Agent:</label>
              <select
                value={recipientAgent}
                onChange={(e) => setRecipientAgent(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="agent_tax_policy">agent_tax_policy (Tax Policy Agent)</option>
                <option value="agent_matching">agent_matching (Matching Agent)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Target Operation:</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="evaluate_itc_admissibility">evaluate_itc_admissibility</option>
                <option value="resolve_discrepancy">resolve_discrepancy</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Security Clearance Level:</label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="RESTRICTED">RESTRICTED (Air-gapped verification)</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL (Customer encryption)</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="PUBLIC">PUBLIC</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Payload Envelope (JSON):</label>
            <textarea
              required
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={6}
              className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={dispatching}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Send className={`w-3.5 h-3.5 ${dispatching ? 'animate-spin' : ''}`} />
            <span>{dispatching ? 'Dispatching Inter-Agent Envelope...' : 'Dispatch A2A Envelope'}</span>
          </button>
        </form>

        {/* Live A2A Response Envelope Inspector */}
        <div className="p-6 rounded-xl border border-arc-border bg-arc-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>A2AResponseEnvelope Inspector</span>
              </h3>
              {responseEnvelope && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  STATUS: {responseEnvelope.status}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="mt-4 p-4 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Dispatch Error:</strong>
                  {errorMsg}
                </div>
              </div>
            )}

            {responseEnvelope ? (
              <div className="mt-4 space-y-4">
                {/* Telemetry Pills */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-arc-surface border border-arc-border">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Latency</span>
                    <span className="font-bold font-mono text-white text-sm">
                      {responseEnvelope.executionMetadata?.latencyMs}ms
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-arc-surface border border-arc-border">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Tokens Total</span>
                    <span className="font-bold font-mono text-white text-sm">
                      {responseEnvelope.executionMetadata?.tokensUsed?.total}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-arc-surface border border-arc-border">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Cost USD</span>
                    <span className="font-bold font-mono text-emerald-400 text-sm">
                      ${responseEnvelope.executionMetadata?.costUsd?.toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* Policy Citation */}
                {responseEnvelope.policyEvaluations?.length > 0 && (
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs space-y-1">
                    <div className="text-[10px] font-bold text-blue-300 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Statutory Policy Citation Verified</span>
                    </div>
                    <div className="text-gray-200 font-semibold">
                      {responseEnvelope.policyEvaluations[0].citation}
                    </div>
                  </div>
                )}

                {/* Result JSON */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Response Result Payload:</span>
                  <pre className="p-3 rounded-lg bg-black/60 border border-arc-border text-emerald-300 font-mono text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(responseEnvelope.result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              !errorMsg && (
                <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                  <Radio className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
                  <p>Ready to dispatch. Submit an envelope on the left to inspect real-time inter-agent response.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
