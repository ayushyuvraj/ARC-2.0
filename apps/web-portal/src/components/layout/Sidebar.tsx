import React from 'react';
import {
  Home,
  LayoutGrid,
  CheckCircle2,
  GitFork,
  Bot,
  Cpu,
  Boxes,
  Wrench,
  Radio,
  BookOpen,
  Scale,
  CloudUpload,
  Gauge,
  PlayCircle,
  FileArchive,
  BarChart3,
  ShieldAlert,
  Network,
  Settings,
  Layers
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navSections = [
    {
      title: 'PLATFORM PORTAL',
      items: [
        { id: 'apps', label: 'Applications', icon: LayoutGrid },
        { id: 'usecases', label: 'Use Cases', icon: CheckCircle2 },
        { id: 'runs', label: 'Active Runs', icon: PlayCircle }
      ]
    },
    {
      title: 'COMPOSITION & LOGIC',
      items: [
        { id: 'workflows', label: 'Workflows', icon: GitFork },
        { id: 'agents', label: 'Agents', icon: Bot },
        { id: 'a2a', label: 'A2A Fabric', icon: Radio },
        { id: 'a2ui', label: 'A2UI Studio', icon: Layers },
        { id: 'orchestrators', label: 'Orchestrators', icon: Cpu }
      ]
    },
    {
      title: 'REGISTRIES',
      items: [
        { id: 'models', label: 'Models', icon: Boxes },
        { id: 'tools', label: 'Tools', icon: Wrench },
        { id: 'mcp', label: 'MCP Servers', icon: Radio },
        { id: 'skills', label: 'Skills', icon: BookOpen },
        { id: 'policies', label: 'Policies', icon: Scale }
      ]
    },
    {
      title: 'GOVERNANCE & OPS',
      items: [
        { id: 'dependencies', label: 'Dependency Graph', icon: Network },
        { id: 'observability', label: 'Observability & Traces', icon: BarChart3 },
        { id: 'evaluations', label: 'Evaluations', icon: Gauge },
        { id: 'deployments', label: 'Deployments', icon: CloudUpload },
        { id: 'governance', label: 'Approvals & RBAC', icon: ShieldAlert }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-arc-border bg-arc-surface flex flex-col justify-between h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="px-3">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        active
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-arc-card/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-arc-border">
        <button
          onClick={() => onSelectTab('settings')}
          className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-arc-card"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span>Platform Settings</span>
        </button>
      </div>
    </aside>
  );
};
