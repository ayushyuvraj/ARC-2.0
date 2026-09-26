import React, { useEffect, useState } from 'react';
import { Shield, Users, Check, X, Key, Lock, UserCheck, ShieldCheck } from 'lucide-react';

export const RbacMatrixViewer: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/governance/rbac/matrix')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading RBAC matrix...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-xs text-rose-400">Failed to load RBAC matrix.</div>;
  }

  const domains = [
    { key: 'applications', label: 'Applications' },
    { key: 'workflows', label: 'Workflows & DAGs' },
    { key: 'registries', label: 'Canonical Registries' },
    { key: 'deployments', label: 'Multi-Cloud Deployments' },
    { key: 'approvals', label: 'Human Approvals' },
    { key: 'dataClassification', label: 'Data Classification' }
  ];

  return (
    <div className="space-y-8">
      {/* Roles Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Enterprise Role Permission Matrix</span>
        </h3>
        <p className="text-xs text-gray-400">
          Strict principle-of-least-privilege boundaries governing human operators, agents, and API service accounts.
        </p>

        <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-arc-border bg-arc-surface/60 text-gray-300">
                <th className="py-3 px-4 font-semibold text-white">Role & Scope</th>
                {domains.map((d) => (
                  <th key={d.key} className="py-3 px-4 font-semibold text-gray-300 whitespace-nowrap">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-arc-border/60">
              {data.roles.map((role: any) => (
                <tr key={role.id} className="hover:bg-arc-surface/30 transition-colors">
                  <td className="py-4 px-4 align-top max-w-xs">
                    <div className="font-semibold text-white">{role.name}</div>
                    <div className="font-mono text-[10px] text-blue-400 mt-0.5">{role.id}</div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{role.description}</p>
                  </td>
                  {domains.map((d) => {
                    const perms = role.permissions[d.key] || [];
                    return (
                      <td key={d.key} className="py-4 px-4 align-top">
                        <div className="flex flex-wrap gap-1">
                          {perms.map((p: string) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/40 text-blue-300 border border-blue-900/60"
                            >
                              {p}
                            </span>
                          ))}
                          {perms.length === 0 && (
                            <span className="text-[11px] text-gray-600 italic">None</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Assignments Table */}
      <div className="space-y-4 pt-4 border-t border-arc-border">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Active Enterprise User Assignments</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-arc-border bg-arc-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-arc-border bg-arc-surface/60 text-gray-300">
                <th className="py-3 px-4 font-semibold text-white">User Email</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Assigned Role</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Enterprise Department</th>
                <th className="py-3 px-4 font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arc-border/60">
              {data.userAssignments.map((u: any, idx: number) => (
                <tr key={idx} className="hover:bg-arc-surface/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{u.department}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
