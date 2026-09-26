import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { FRAMEWORKS } from '../constants/frameworks';

export default function MakeUseCaseModal({ isOpen, onClose, onCreateUseCase }) {
  const [name, setName] = useState('Meeting Intelligence Agent');
  const [description, setDescription] = useState('Multi-speaker transcript synthesis, action item extraction, and task dispatching.');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState('google-adk');
  const [template, setTemplate] = useState('meeting-pilot');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const frameworkObj = FRAMEWORKS.find(f => f.id === selectedFrameworkId) || FRAMEWORKS[0];
    onCreateUseCase({
      name,
      description,
      framework: frameworkObj,
      template
    });
    onClose();
  };

  const selectedFramework = FRAMEWORKS.find(f => f.id === selectedFrameworkId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#FFFFFF] border border-[#E0E0E0] shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#001E50] border-b border-[#00338D] flex items-center justify-between text-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0091DA] font-['Univers',sans-serif]">
              Workflow Generator
            </span>
            <h2 className="text-base font-bold text-white mt-0.5 tracking-wide">
              Make New Use Case
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#FFFFFF]">
          {/* Use Case Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0B0F19] mb-1.5">
              Use Case Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meeting Intelligence Agent"
              className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-[#E0E0E0] text-[#0B0F19] text-sm focus:outline-none focus:border-[#00338D]"
            />
          </div>

          {/* Framework Dropdown (Clean dropdown without pictures) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B0F19]">
                Agent Orchestration Framework
              </label>
              <span className="text-[11px] text-[#00338D] font-mono font-bold">Clean Selection</span>
            </div>
            <select
              value={selectedFrameworkId}
              onChange={(e) => setSelectedFrameworkId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5F6F8] border border-[#E0E0E0] text-[#0B0F19] text-sm focus:outline-none focus:border-[#00338D] font-medium"
            >
              {FRAMEWORKS.map((fw) => (
                <option key={fw.id} value={fw.id} className="bg-[#FFFFFF] text-[#0B0F19] py-2">
                  {fw.name} — {fw.subtitle}
                </option>
              ))}
            </select>

            {selectedFramework && (
              <div className="mt-2.5 p-3 bg-[#E6EDF7] border border-[#00338D]/20 text-xs text-[#333333] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#00338D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#00338D]">{selectedFramework.name}: </span>
                  <span>{selectedFramework.description}</span>
                  <div className="mt-1 text-[11px] font-mono text-[#00338D] font-bold">
                    Default Model: {selectedFramework.defaultModel} • File Export: {selectedFramework.exportExtension}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0B0F19] mb-1.5">
              Business Goal & Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should this agent accomplish?"
              className="w-full px-3.5 py-2 bg-[#F5F6F8] border border-[#E0E0E0] text-[#0B0F19] text-xs focus:outline-none focus:border-[#00338D]"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0B0F19] mb-2">
              Initial Workspace Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTemplate('meeting-pilot')}
                className={`p-3.5 text-left border transition-all ${
                  template === 'meeting-pilot'
                    ? 'border-[#00338D] bg-[#E6EDF7] text-[#0B0F19]'
                    : 'border-[#E0E0E0] bg-[#FFFFFF] text-[#666666] hover:border-[#00338D]'
                }`}
              >
                <div className="font-bold text-xs text-[#0B0F19] flex items-center justify-between">
                  <span>Meeting Intelligence</span>
                  {template === 'meeting-pilot' && <Check className="w-3.5 h-3.5 text-[#00338D]" />}
                </div>
                <p className="text-[11px] text-[#333333] mt-1 leading-snug">
                  Pre-configured with Gemini, Summarizer, Action Items, Calendar MCP, PII policy & evaluation suite.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('blank')}
                className={`p-3.5 text-left border transition-all ${
                  template === 'blank'
                    ? 'border-[#00338D] bg-[#E6EDF7] text-[#0B0F19]'
                    : 'border-[#E0E0E0] bg-[#FFFFFF] text-[#666666] hover:border-[#00338D]'
                }`}
              >
                <div className="font-bold text-xs text-[#0B0F19] flex items-center justify-between">
                  <span>Blank Canvas</span>
                  {template === 'blank' && <Check className="w-3.5 h-3.5 text-[#00338D]" />}
                </div>
                <p className="text-[11px] text-[#333333] mt-1 leading-snug">
                  Starts with an empty Core Agent node for custom modular assembly from scratch.
                </p>
              </button>
            </div>
          </div>

          {/* Form Actions (Sharp 0px CTAs) */}
          <div className="pt-3 border-t border-[#E0E0E0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#666666] hover:text-[#0B0F19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#00338D] hover:bg-[#005EB8] text-white transition-all shadow-sm"
            >
              <span>Initialize in {selectedFramework?.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
