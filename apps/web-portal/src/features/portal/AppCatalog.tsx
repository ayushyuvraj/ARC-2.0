import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, ShieldCheck, Sparkles, Building, Play, ChevronRight, Layers } from 'lucide-react';

interface AppCatalogProps {
  onSelectApp: (slug: string) => void;
  onOpenUseCaseComposer?: () => void;
}

export const AppCatalog: React.FC<AppCatalogProps> = ({ onSelectApp, onOpenUseCaseComposer }) => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApps(data.data);
        }
      })
      .catch((err) => console.error('Failed to load applications:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-arc-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Enterprise Applications Catalog</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-normal">
              {apps.length} Applications Registered
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Production-ready business applications orchestrated and governed by the ARC platform fabric.
          </p>
        </div>

        <button
          onClick={onOpenUseCaseComposer}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>Compose New Use Case & Agents</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 space-x-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading enterprise application catalog...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const branding = app.branding || { primaryColor: '#2563EB', accentColor: '#3B82F6' };
            const isTars = app.slug === 'tars';

            return (
              <div
                key={app.id}
                onClick={() => onSelectApp(app.slug)}
                className={`group cursor-pointer rounded-xl border transition-all duration-200 relative overflow-hidden bg-arc-surface hover:bg-arc-surface/90 flex flex-col justify-between ${
                  isTars
                    ? 'border-blue-500/40 hover:border-blue-400 shadow-xl shadow-blue-500/10'
                    : 'border-arc-border hover:border-gray-500/50'
                }`}
              >
                {/* Accent top stripe */}
                <div
                  className="h-1.5 w-full transition-all group-hover:h-2"
                  style={{ backgroundColor: branding.primaryColor }}
                />

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                          {app.name}
                        </h2>
                        {isTars && (
                          <span className="text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            Flagship
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{app.domain}</p>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-arc-card text-gray-300 border border-arc-border">
                      {app.uiMode}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                    {app.description}
                  </p>

                  <div className="pt-2 border-t border-arc-border/60 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-400">Business Unit:</span>
                      <p className="font-medium text-gray-200 truncate">{app.businessUnit}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Active Use Cases:</span>
                      <p className="font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{app.useCases?.length || 1} Ready</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-arc-card/50 border-t border-arc-border flex items-center justify-between text-xs font-medium text-gray-400 group-hover:text-blue-400">
                  <span className="flex items-center space-x-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Application Portal</span>
                  </span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
