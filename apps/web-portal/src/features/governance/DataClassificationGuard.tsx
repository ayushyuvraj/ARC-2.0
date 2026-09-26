import React, { useEffect, useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Key, AlertTriangle } from 'lucide-react';

export const DataClassificationGuard: React.FC = () => {
  const [policyData, setPolicyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Verification tool state
  const [testRole, setTestRole] = useState('ROLE_APPLICATION_OPERATOR');
  const [testClassification, setTestClassification] = useState('RESTRICTED');
  const [testResource, setTestResource] = useState('art_pr_records_raw');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/governance/data-classification/policies')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setPolicyData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/v1/governance/data-classification/verify-clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerRole: testRole,
          targetClassification: testClassification,
          targetModelOrTarget: testResource
        })
      });
      const data = await res.json();
      if (data.success) {
        setVerifyResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'RESTRICTED':
        return 'border-rose-500/40 bg-rose-950/20 text-rose-300';
      case 'CONFIDENTIAL':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
      case 'INTERNAL':
        return 'border-blue-500/40 bg-blue-950/20 text-blue-300';
      default:
        return 'border-gray-600 bg-gray-900/40 text-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Policy Tiers Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Data Classification Boundaries & Egress Guardrails</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Automated enforcement preventing sensitive data contamination across models, clouds, and untrusted execution planes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ENFORCEMENT: STRICT_BLOCK
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policyData?.tiers?.map((tier: any) => (
            <div
              key={tier.tier}
              className={`p-5 rounded-xl border ${getTierColor(tier.tier)} space-y-3 flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm tracking-wide">{tier.tier}</span>
                  {tier.humanApprovalForExport && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Sign-off Required for Egress
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{tier.description}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-800 text-[11px]">
                <div>
                  <span className="text-gray-400">Permitted Model Endpoints: </span>
                  <span className="text-white font-mono">{tier.permittedModels.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Permitted Clouds / Enclaves: </span>
                  <span className="text-white font-mono">{tier.permittedClouds.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Encryption Standard: </span>
                  <span className="text-emerald-400 font-mono">{tier.encryptionRequired}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Boundary & Clearance Verification Console */}
      <div className="p-6 rounded-xl border border-arc-border bg-arc-card space-y-5">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>Interactive Clearance & Boundary Verification Console</span>
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Simulate a model call, agent execution, or artifact download to test policy guard evaluation and audit trail logging.
          </p>
        </div>

        <form onSubmit={handleVerify} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Caller Role:</label>
            <select
              value={testRole}
              onChange={(e) => setTestRole(e.target.value)}
              className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ROLE_APPLICATION_OPERATOR">ROLE_APPLICATION_OPERATOR</option>
              <option value="ROLE_AUDITOR_VIEWER">ROLE_AUDITOR_VIEWER</option>
              <option value="ROLE_TAX_LEAD">ROLE_TAX_LEAD</option>
              <option value="ROLE_SECURITY_OFFICER">ROLE_SECURITY_OFFICER</option>
              <option value="ROLE_PLATFORM_ADMIN">ROLE_PLATFORM_ADMIN</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Data Classification Tier:</label>
            <select
              value={testClassification}
              onChange={(e) => setTestClassification(e.target.value)}
              className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="RESTRICTED">RESTRICTED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Target Artifact / Model:</label>
            <input
              type="text"
              value={testResource}
              onChange={(e) => setTestResource(e.target.value)}
              className="w-full bg-arc-surface border border-arc-border rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 h-[38px] transition-colors"
          >
            <span>{verifying ? 'Evaluating Guard...' : 'Evaluate Boundary Guard'}</span>
          </button>
        </form>

        {/* Verification Result */}
        {verifyResult && (
          <div
            className={`p-4 rounded-lg border text-xs space-y-2 ${
              verifyResult.authorized
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {verifyResult.authorized ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{verifyResult.verdict}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>{verifyResult.verdict}</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed">{verifyResult.details}</p>
            {!verifyResult.authorized && (
              <p className="text-[11px] text-rose-400 italic">
                🛡️ Security Violation attempt recorded into tamper-evident Audit Log for CISO review.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
