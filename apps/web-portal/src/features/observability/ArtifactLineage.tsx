import React, { useEffect, useState } from 'react';
import { FileText, ArrowDown, Shield, Hash, CheckCircle, Database, Layers } from 'lucide-react';

export const ArtifactLineage: React.FC = () => {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('');
  const [lineageData, setLineageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/artifacts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setArtifacts(data.data);
          setSelectedArtifactId(data.data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedArtifactId) {
      fetch(`/api/v1/artifacts/${selectedArtifactId}/lineage`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLineageData(data.data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [selectedArtifactId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-arc-border">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Cryptographic Artifact Lineage DAG</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Trace the complete upstream derivation chain from final deliverables to raw source records with SHA-256 validation.
          </p>
        </div>

        {artifacts.length > 0 && (
          <select
            value={selectedArtifactId}
            onChange={(e) => setSelectedArtifactId(e.target.value)}
            className="bg-arc-surface border border-arc-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            {artifacts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading artifacts...</div>
      ) : lineageData ? (
        <div className="space-y-6">
          {/* Target Deliverable Banner */}
          <div className="p-5 rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{lineageData.targetArtifact.name}</h3>
                  <span className="text-[10px] font-mono text-gray-400">{lineageData.targetArtifact.id}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                {lineageData.targetArtifact.dataClassification}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-blue-500/20 text-xs font-mono">
              <div>
                <span className="text-gray-400 text-[10px] block">Content Hash (SHA-256):</span>
                <span className="text-emerald-400 text-[11px] truncate block" title={lineageData.targetArtifact.contentHash}>
                  {lineageData.targetArtifact.contentHash}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">Byte Size:</span>
                <span className="text-white text-[11px]">{(lineageData.targetArtifact.byteSize / 1024).toFixed(1)} KB</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">Provenance:</span>
                <span className="text-blue-300 text-[11px]">wf_tars_recon_v2 Run Deliverable</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">Integrity:</span>
                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> VERIFIED IMMUTABLE
                </span>
              </div>
            </div>
          </div>

          {/* Upstream Derivation Flow */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Upstream Derivation Hierarchy (Root Sources → Transformations → Deliverable)
            </h4>

            <div className="space-y-3">
              {lineageData.upstreamLineage.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-arc-border bg-arc-surface flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-arc-card border border-arc-border flex items-center justify-center font-mono font-bold text-gray-400 text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{item.name}</span>
                        <span className="text-[10px] font-mono text-gray-500">({item.id})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        SHA-256: {item.contentHash.substring(0, 32)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.classification}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-gray-500 bg-arc-surface rounded-xl border border-arc-border">
          No lineage data available. Execute a workflow to generate persistent artifacts.
        </div>
      )}
    </div>
  );
};
