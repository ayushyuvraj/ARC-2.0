import React, { useState } from 'react';
import { Terminal, Copy, Check, Download } from 'lucide-react';
import { FRAMEWORKS } from '../constants/frameworks';
import { generateFrameworkCode } from '../utils/codeGenerators';

export default function CodeExportView({ activeUseCase, nodes }) {
  const [selectedFwId, setSelectedFwId] = useState(activeUseCase.framework.id);
  const [copied, setCopied] = useState(false);

  const attachedPillars = {
    model: nodes.find(n => n.data?.pillarType === 'model')?.data,
    skills: nodes.filter(n => n.data?.pillarType === 'skills').map(n => n.data),
    mcp: nodes.filter(n => n.data?.pillarType === 'mcp').map(n => n.data),
    tools: nodes.filter(n => n.data?.pillarType === 'tools').map(n => n.data),
    gateway: nodes.filter(n => n.data?.pillarType === 'gateway').map(n => n.data),
    memory: nodes.filter(n => n.data?.pillarType === 'memory').map(n => n.data),
    policies: nodes.filter(n => n.data?.pillarType === 'policies').map(n => n.data)
  };

  const code = generateFrameworkCode(selectedFwId, activeUseCase.agent, attachedPillars);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `keaos_agent_${selectedFwId}.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 h-full bg-[#F5F6F8] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 px-6 border-b border-[#E0E0E0] flex items-center justify-between bg-[#FFFFFF] shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#00338D]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B0F19] font-['Univers',sans-serif]">
            SDK Code Exporter
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20 font-bold">
            PRODUCTION READY
          </span>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#F5F6F8] p-1 border border-[#E0E0E0]">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              onClick={() => setSelectedFwId(fw.id)}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                selectedFwId === fw.id
                  ? 'bg-[#00338D] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#0B0F19]'
              }`}
            >
              {fw.name}
            </button>
          ))}
        </div>

        {/* Copy / Download buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#00338D] border border-[#00338D] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#009A44]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#00338D] hover:bg-[#005EB8] text-white transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 overflow-auto p-6 bg-[#0B0F19]">
        <pre className="p-6 bg-[#001438] border border-[#00338D] text-xs text-slate-100 font-mono leading-relaxed overflow-x-auto shadow-2xl selection:bg-[#005EB8]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
