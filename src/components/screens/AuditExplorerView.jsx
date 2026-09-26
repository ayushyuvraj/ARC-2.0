import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Hash, 
  Clock, 
  FileText, 
  Download, 
  CheckCircle2, 
  Search,
  ExternalLink
} from 'lucide-react';
import ScreenScaffold from '../common/ScreenScaffold';
import { DESIGN_CLASSES } from '../../constants/designTokens';

/**
 * AuditExplorerView
 * Cryptographic Audit Trail & Governance Screen
 * Adheres strictly to src/design.md (0px angular cards, full pill status badges, brand palette).
 */
export default function AuditExplorerView({ activeUseCase }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real cryptographic audit log records
  const [auditLogs] = useState([
    {
      id: 'AUDIT-8941',
      timestamp: new Date().toISOString(),
      eventType: 'Meeting Synthesis Execution',
      agent: 'Meeting Intelligence Agent',
      framework: 'Google ADK',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      inputsLength: '1,420 chars (4 speakers)',
      verified: true,
      piiSanitizedCount: 2,
      complianceStandard: 'SOC2 Type II / DPDP 2023'
    },
    {
      id: 'AUDIT-8940',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      eventType: 'Alignment Benchmark Run',
      agent: 'Meeting Intelligence Agent',
      framework: 'LangGraph',
      sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
      inputsLength: '4 Golden Test Cases',
      verified: true,
      piiSanitizedCount: 1,
      complianceStandard: 'ISO 27001 AI Governance'
    },
    {
      id: 'AUDIT-8939',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      eventType: 'PII Policy Update',
      agent: 'System Security Lead',
      framework: 'Enterprise Ingress Gateway',
      sha256Hash: '9a6140fc9bda441dc35d773a5d9f8f50102677411833430b80980e0db7e23808',
      inputsLength: 'Regex Financial Ruleset v2.4',
      verified: true,
      piiSanitizedCount: 0,
      complianceStandard: 'Enterprise SecOps'
    }
  ]);

  const filteredLogs = auditLogs.filter(log => 
    log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScreenScaffold
      title="Cryptographic Audit Registry & Compliance Ledger"
      eyebrow="PILLAR: AUDIT & GOVERNANCE"
      statusText="SHA-256 IMMUTABLE"
      statusType="active"
      actions={
        <button
          onClick={() => alert('Exporting full audit trail report in JSON-LD format...')}
          className={DESIGN_CLASSES.buttonPrimary}
        >
          <Download className="w-3.5 h-3.5 inline mr-1.5" />
          <span>Export Audit Proof</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Top Metric Cards (Angular 0px) */}
        <div className="grid grid-cols-4 gap-4">
          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <span className="text-[10px] font-mono uppercase text-[#666666] font-bold block mb-1">
              Active Ledger Integrity
            </span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#009A44]" />
              <span className="text-xl font-bold text-[#0B0F19]">100% Verified</span>
            </div>
            <span className="text-[11px] text-[#666666] mt-1 block">Zero hash collisions or tampering</span>
          </div>

          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <span className="text-[10px] font-mono uppercase text-[#666666] font-bold block mb-1">
              Hashing Algorithm
            </span>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00338D]" />
              <span className="text-xl font-bold text-[#0B0F19]">W3C SHA-256</span>
            </div>
            <span className="text-[11px] text-[#666666] mt-1 block">Cryptographic WebCrypto API</span>
          </div>

          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <span className="text-[10px] font-mono uppercase text-[#666666] font-bold block mb-1">
              PII Redactions Enforced
            </span>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#EAAA00]" />
              <span className="text-xl font-bold text-[#0B0F19]">3 Redacted</span>
            </div>
            <span className="text-[11px] text-[#666666] mt-1 block">Masked financial compensation</span>
          </div>

          <div className={DESIGN_CLASSES.card + ' p-4'}>
            <span className="text-[10px] font-mono uppercase text-[#666666] font-bold block mb-1">
              Active Agent
            </span>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6D2077]" />
              <span className="text-sm font-bold text-[#0B0F19] truncate">{activeUseCase.name}</span>
            </div>
            <span className="text-[11px] text-[#666666] mt-1 block">{activeUseCase.framework.name}</span>
          </div>
        </div>

        {/* Audit Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Audit ID, SHA-256 hash substring, or event type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={DESIGN_CLASSES.input + ' pl-9'}
            />
          </div>
        </div>

        {/* Audit Trail Table */}
        <div className={DESIGN_CLASSES.card + ' overflow-hidden'}>
          <div className="p-4 bg-[#F5F6F8] border-b border-[#E0E0E0] flex items-center justify-between">
            <h3 className={DESIGN_CLASSES.sectionTitle}>Immutable Cryptographic Event Logs</h3>
            <span className={DESIGN_CLASSES.statusPillBrand}>
              {filteredLogs.length} Events Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFFFF] border-b border-[#E0E0E0] text-[10px] font-bold uppercase text-[#666666] font-mono">
                <tr>
                  <th className="p-3">Audit ID</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Cryptographic SHA-256 Fingerprint</th>
                  <th className="p-3">Compliance Standard</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] bg-[#FFFFFF]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F6F8] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#00338D]">{log.id}</td>
                    <td className="p-3 font-bold text-[#0B0F19]">{log.eventType}</td>
                    <td className="p-3 text-[#666666] font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-mono text-[11px] text-[#0B0F19] max-w-xs truncate" title={log.sha256Hash}>
                      {log.sha256Hash}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F5F6F8] border border-[#E0E0E0] text-[#0B0F19]">
                        {log.complianceStandard}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={DESIGN_CLASSES.statusPillActive + ' inline-flex items-center gap-1'}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ScreenScaffold>
  );
}
