import React, { useState } from 'react';
import { CloudUpload, Layers, Radio } from 'lucide-react';
import { TopologyMap } from './TopologyMap.js';
import { TargetManager } from './TargetManager.js';

export const DeploymentsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'topology' | 'targets'>('topology');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-arc-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CloudUpload className="w-6 h-6 text-blue-400" />
            <span>Execution Planes & Multi-Cloud Topology</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Decoupled deployment targets across sovereign enclaves, commercial hyperscalers, and pluggable cloud provider adapters.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-arc-surface p-1 rounded-lg border border-arc-border text-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'topology' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Cloud Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('targets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'targets' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Target Planes & Adapters</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'topology' && <TopologyMap />}

      {activeTab === 'targets' && <TargetManager />}
    </div>
  );
};
