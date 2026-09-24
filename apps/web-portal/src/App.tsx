import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { AppCatalog } from './features/portal/AppCatalog.js';
import { AppDetail } from './features/portal/AppDetail.js';
import { RegistryViewer } from './features/registries/RegistryViewer.js';
import { ImpactViewer } from './features/dependencies/ImpactViewer.js';
import { WorkflowBuilder } from './features/workflow/WorkflowBuilder.js';

export function App() {
  const [currentTab, setCurrentTab] = useState('apps');
  const [selectedAppSlug, setSelectedAppSlug] = useState<string | null>(null);

  const handleSelectApp = (slug: string) => {
    setSelectedAppSlug(slug);
    setCurrentTab('app-detail');
  };

  const handleBackToApps = () => {
    setSelectedAppSlug(null);
    setCurrentTab('apps');
  };

  const handleStartRun = (appId: string, useCaseId: string) => {
    // Quick run trigger
    fetch('/api/v1/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: appId,
        useCaseId: useCaseId,
        workflowId: 'wf_tars_recon_v2',
        environment: 'DEVELOPMENT',
        inputs: {
          gstInvoicesCount: 10000,
          purchaseRegisterCount: 9800,
          sampleId: 'sample_gst_pr_sept_2026'
        }
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(`Run Queued Successfully!\nRun ID: ${data.data.id}\nStatus: ${data.data.status}`);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-arc-dark flex flex-col">
      <Navbar currentTab={currentTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab === 'app-detail' ? 'apps' : currentTab}
          onSelectTab={(tab) => {
            setSelectedAppSlug(null);
            setCurrentTab(tab);
          }}
        />
        <main className="flex-1 overflow-y-auto bg-[#0B0F19]">
          {currentTab === 'apps' && <AppCatalog onSelectApp={handleSelectApp} />}
          {currentTab === 'app-detail' && selectedAppSlug && (
            <AppDetail
              appSlug={selectedAppSlug}
              onBack={handleBackToApps}
              onStartRun={handleStartRun}
            />
          )}
          {['models', 'tools', 'mcp', 'policies', 'agents'].includes(currentTab) && (
            <RegistryViewer registryType={currentTab as any} />
          )}
          {currentTab === 'dependencies' && <ImpactViewer />}
          {currentTab === 'workflows' && <WorkflowBuilder />}
          {currentTab === 'runs' && (
            <div className="p-8 max-w-7xl mx-auto space-y-4">
              <h1 className="text-xl font-bold text-white">Active Runs & Execution Spans</h1>
              <p className="text-xs text-gray-400">Run State Machine and Distributed Tracing Waterfall.</p>
              <div className="p-6 rounded-xl border border-arc-border bg-arc-surface text-xs text-gray-400">
                Execute a run from TARS 2.0 to observe real-time trace spans and checkpoint deltas.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
