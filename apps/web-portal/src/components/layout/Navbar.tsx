import React from 'react';
import { Layers, ShieldCheck, Activity, Terminal } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab }) => {
  return (
    <header className="h-14 border-b border-arc-border bg-arc-surface px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-wider text-white">ARC</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Control Plane
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-tight">Enterprise Agentic Runtime</p>
          </div>
        </div>

        <div className="h-4 w-px bg-arc-border mx-2" />

        <div className="flex items-center space-x-2 text-xs text-gray-300">
          <span className="text-gray-500">Tenant:</span>
          <span className="font-medium text-white px-2 py-0.5 rounded bg-arc-card border border-arc-border">
            Global Tax Advisory & Risk
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Simulated Execution Plane Alert Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>SIMULATED EXECUTION PLANE ACTIVE</span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Activity className="w-3.5 h-3.5" />
          <span>API 200 OK</span>
        </div>

        <div className="h-4 w-px bg-arc-border" />

        <div className="flex items-center space-x-2 text-xs">
          <div className="w-7 h-7 rounded-full bg-arc-card border border-arc-border flex items-center justify-center font-semibold text-gray-300">
            TA
          </div>
          <span className="text-gray-300 font-medium">tax-lead@kpmg.com</span>
        </div>
      </div>
    </header>
  );
};
