import React, { useState } from 'react';
import { Gauge, Database, Play, BarChart2 } from 'lucide-react';
import { RegressionMatrix } from './RegressionMatrix.js';
import { GoldenDatasetsViewer } from './GoldenDatasetsViewer.js';
import { EvaluationRunBenchmark } from './EvaluationRunBenchmark.js';

export const EvaluationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'datasets' | 'runner'>('matrix');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-arc-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-blue-400" />
            <span>Continuous Evaluation Platform & Regression Suite</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Ongoing operational quality benchmarks, side-by-side model/prompt regression matrices, and ground-truth golden datasets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-arc-surface p-1 rounded-lg border border-arc-border text-xs">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'matrix' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Regression Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'datasets' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Golden Datasets</span>
          </button>

          <button
            onClick={() => setActiveTab('runner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'runner' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Benchmark Runner</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'matrix' && <RegressionMatrix />}

      {activeTab === 'datasets' && <GoldenDatasetsViewer />}

      {activeTab === 'runner' && <EvaluationRunBenchmark />}
    </div>
  );
};
