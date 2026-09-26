import React, { useEffect, useState } from 'react';
import { Database, Plus, CheckCircle2, ChevronRight, ChevronDown, Layers, FileCode, Shield } from 'lucide-react';

export const GoldenDatasetsViewer: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [datasetDetail, setDatasetDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // New Test Case Modal
  const [showAddCase, setShowAddCase] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [caseCategory, setCaseCategory] = useState('EDGE_CASE');
  const [inputJson, setInputJson] = useState('{\n  "gstin": "27AABCU9603R1ZM",\n  "invoiceNo": "INV-2026-9999",\n  "taxAmount": 15000.00\n}');
  const [outputJson, setOutputJson] = useState('{\n  "matchStatus": "EXACT_MATCH",\n  "admissibleITC": 15000.00\n}');
  const [classification, setClassification] = useState('CONFIDENTIAL');
  const [savingCase, setSavingCase] = useState(false);

  const fetchDatasets = () => {
    fetch('/api/v1/evaluations/datasets')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDatasets(res.data);
          if (res.data.length > 0 && !selectedDatasetId) {
            setSelectedDatasetId(res.data[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchDetail = (id: string) => {
    fetch(`/api/v1/evaluations/datasets/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDatasetDetail(res.data);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedDatasetId) {
      fetchDetail(selectedDatasetId);
    }
  }, [selectedDatasetId]);

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId) return;
    setSavingCase(true);
    try {
      const res = await fetch(`/api/v1/evaluations/datasets/${selectedDatasetId}/test-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: caseName,
          category: caseCategory,
          inputPayload: JSON.parse(inputJson),
          expectedOutput: JSON.parse(outputJson),
          assertionRules: [{ field: 'matchStatus', operator: 'EXACT_MATCH', expectedValue: 'EXACT_MATCH' }],
          dataClassification: classification
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddCase(false);
        setCaseName('');
        fetchDetail(selectedDatasetId);
        fetchDatasets();
      } else {
        alert(`Error: ${data.error?.message}`);
      }
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    } finally {
      setSavingCase(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'STANDARD_EXACT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-400 border border-blue-800/60">EXACT MATCH</span>;
      case 'NUMERIC_TOLERANCE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60">TOLERANCE</span>;
      case 'SYNTACTIC_AMBIGUITY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/60 text-purple-400 border border-purple-800/60">SYNTAX AMBIGUITY</span>;
      case 'LEGAL_POLICY_REASONING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">POLICY REASONING</span>;
      case 'FRAUD_EXCEPTION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60">FRAUD EXCEPTION</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700">{cat}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Datasets Sidebar */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span>Golden Benchmark Corpora</span>
        </h3>

        <div className="space-y-3">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              onClick={() => setSelectedDatasetId(ds.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedDatasetId === ds.id
                  ? 'border-blue-500/60 bg-blue-950/20'
                  : 'border-arc-border bg-arc-card hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-blue-400 font-bold">{ds.version}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-arc-surface text-gray-300 border border-arc-border">
                  {ds.domain}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{ds.name}</h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ds.description}</p>
              <div className="mt-3 pt-2 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
                <span>Test Cases: <strong className="text-white">{ds._count?.testCases || 0}</strong></span>
                <span>Runs: <strong className="text-white">{ds._count?.evaluationRuns || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Details & Test Cases List */}
      <div className="md:col-span-2 space-y-6">
        {datasetDetail ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-arc-border bg-arc-card">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{datasetDetail.name}</h3>
                  <span className="font-mono text-xs text-blue-400 font-semibold">{datasetDetail.version}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{datasetDetail.description}</p>
              </div>

              <button
                onClick={() => setShowAddCase(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ground-Truth Case</span>
              </button>
            </div>

            {/* Test Cases Accordion / List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Ground-Truth Test Cases ({datasetDetail.testCases?.length || 0})
              </h4>

              {datasetDetail.testCases?.map((tc: any) => {
                const isExpanded = expandedCaseId === tc.id;
                return (
                  <div
                    key={tc.id}
                    className="rounded-xl border border-arc-border bg-arc-card overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setExpandedCaseId(isExpanded ? null : tc.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-arc-surface/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-400">{tc.id}</span>
                        <span className="text-sm font-semibold text-white">{tc.name}</span>
                        {getCategoryBadge(tc.category)}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-arc-surface text-gray-300 border border-arc-border">
                          {tc.dataClassification}
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-arc-surface/50 border-t border-arc-border space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-[11px] font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
                              <FileCode className="w-3.5 h-3.5 text-blue-400" />
                              <span>Input Test Payload:</span>
                            </div>
                            <pre className="p-3 rounded-lg bg-black/60 border border-arc-border text-gray-300 font-mono text-[11px] overflow-x-auto max-h-40">
                              {JSON.stringify(tc.inputPayload, null, 2)}
                            </pre>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Expected Ground Truth Output:</span>
                            </div>
                            <pre className="p-3 rounded-lg bg-black/60 border border-arc-border text-gray-300 font-mono text-[11px] overflow-x-auto max-h-40">
                              {JSON.stringify(tc.expectedOutput, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {tc.assertionRules && tc.assertionRules.length > 0 && (
                          <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-300">
                            <span className="text-gray-400 font-semibold">Assertion Rules: </span>
                            <span className="font-mono text-blue-300">{JSON.stringify(tc.assertionRules)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-400">Select a golden dataset to inspect test cases.</div>
        )}
      </div>

      {/* Add Test Case Modal */}
      {showAddCase && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleAddCase} className="bg-[#111827] border border-arc-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-arc-border">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Add Ground-Truth Test Case</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCase(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Test Case Name:</label>
              <input
                required
                type="text"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="e.g. Rounding tolerance edge case"
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Evaluation Category:</label>
                <select
                  value={caseCategory}
                  onChange={(e) => setCaseCategory(e.target.value)}
                  className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STANDARD_EXACT">STANDARD_EXACT</option>
                  <option value="NUMERIC_TOLERANCE">NUMERIC_TOLERANCE</option>
                  <option value="SYNTACTIC_AMBIGUITY">SYNTACTIC_AMBIGUITY</option>
                  <option value="LEGAL_POLICY_REASONING">LEGAL_POLICY_REASONING</option>
                  <option value="FRAUD_EXCEPTION">FRAUD_EXCEPTION</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Data Classification:</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Input Payload (JSON):</label>
              <textarea
                required
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                rows={3}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Expected Ground-Truth Output (JSON):</label>
              <textarea
                required
                value={outputJson}
                onChange={(e) => setOutputJson(e.target.value)}
                rows={3}
                className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-arc-border">
              <button
                type="button"
                onClick={() => setShowAddCase(false)}
                className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingCase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-md"
              >
                {savingCase ? 'Adding...' : 'Add to Golden Dataset'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
