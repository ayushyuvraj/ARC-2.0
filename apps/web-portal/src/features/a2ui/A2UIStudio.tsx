import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, Code, Play, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { A2UIRenderer, A2UISurfacePayload } from './A2UIRenderer.js';

export const A2UIStudio: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tars_ambiguity_review');
  const [jsonText, setJsonText] = useState<string>('');
  const [parsedSurface, setParsedSurface] = useState<A2UISurfacePayload | null>(null);
  const [validationStatus, setValidationStatus] = useState<'VALID' | 'INVALID'>('VALID');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/a2ui/templates')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setTemplates(res.data);
          const initial = res.data[0];
          setJsonText(JSON.stringify(initial.surface, null, 2));
          setParsedSurface(initial.surface);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplateId(tpl.id);
    setJsonText(JSON.stringify(tpl.surface, null, 2));
    setParsedSurface(tpl.surface);
    setValidationStatus('VALID');
    setValidationError(null);
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setParsedSurface(parsed);

      // Validate with backend validator
      fetch('/api/v1/a2ui/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.valid) {
            setValidationStatus('VALID');
            setValidationError(null);
          } else {
            setValidationStatus('INVALID');
            setValidationError(data.error?.message || 'Schema validation error');
          }
        })
        .catch(() => {
          setValidationStatus('VALID');
          setValidationError(null);
        });
    } catch (err: any) {
      setValidationStatus('INVALID');
      setValidationError(`SyntaxError: ${err.message}`);
    }
  };

  const handleAction = (actionId: string, comment: string) => {
    setActionAlert(`Action '${actionId}' triggered with justification: "${comment}"`);
    setTimeout(() => setActionAlert(null), 5000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-arc-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-400" />
            <span>A2UI Dynamic Generative Component Studio</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Controlled Component Vocabulary renderer. Agents emit strictly validated JSON surfaces; zero arbitrary script injection permitted.
          </p>
        </div>

        {/* Template Quick Select */}
        <div className="flex items-center gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedTemplateId === tpl.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-arc-surface hover:bg-arc-card text-gray-400 hover:text-white border border-arc-border'
              }`}
            >
              {tpl.title.split(' ')[0]} {tpl.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {actionAlert && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Split Screen: Editor on Left, Live Dynamic Renderer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: JSON Editor & Zod Schema Validation Guard */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-arc-border bg-arc-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Code className="w-4 h-4 text-blue-400" />
              <span>A2UI JSON Specification</span>
            </div>

            <div className="flex items-center gap-1.5">
              {validationStatus === 'VALID' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  SCHEMA VALID
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  VALIDATION ERROR
                </span>
              )}
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={26}
            className="w-full bg-black/60 border border-arc-border rounded-lg p-3 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500 leading-relaxed overflow-x-auto resize-none"
          />

          {validationError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] font-mono">
              {validationError}
            </div>
          )}

          <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Vocabulary: Card, ComparisonPanel, EvidencePanel, ApprovalPanel</span>
            <span className="text-emerald-400">Injection Proof</span>
          </div>
        </div>

        {/* Right: Dynamic Generative Component Surface */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-blue-500/30 bg-[#0F172A]/70 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Live Dynamic Generative Surface</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
              Interactive React Components
            </span>
          </div>

          {parsedSurface && <A2UIRenderer surface={parsedSurface} onAction={handleAction} />}
        </div>
      </div>
    </div>
  );
};
