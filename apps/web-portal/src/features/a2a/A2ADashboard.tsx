import React, { useState } from 'react';
import { Radio, Send, History, Layers } from 'lucide-react';
import { CapabilityDirectory } from './CapabilityDirectory.js';
import { A2ADispatchConsole } from './A2ADispatchConsole.js';
import { A2AMessageHistory } from './A2AMessageHistory.js';

export const A2ADashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dispatcher' | 'directory' | 'history'>('dispatcher');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-arc-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-blue-400" />
            <span>A2A (Agent-to-Agent) Inter-Agent Communication Fabric</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Location-transparent inter-agent messaging, cross-cloud execution planes, schema-validated envelopes, and OpenTelemetry trace propagation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-arc-surface p-1 rounded-lg border border-arc-border text-xs">
          <button
            onClick={() => setActiveTab('dispatcher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'dispatcher' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Testbench</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'directory' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Capability Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Message Telemetry</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'dispatcher' && <A2ADispatchConsole />}

      {activeTab === 'directory' && <CapabilityDirectory />}

      {activeTab === 'history' && <A2AMessageHistory />}
    </div>
  );
};
