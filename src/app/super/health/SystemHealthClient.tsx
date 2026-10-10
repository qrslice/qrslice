'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { SystemHealthReport, StaffMember, StaffRole } from '@/lib/system-health-store';
import {
  Server,
  Database,
  Users,
  Plus,
  Lock,
  RefreshCw,
} from 'lucide-react';

const ROLE_LABELS: Record<StaffRole, { title: string; color: string; desc: string }> = {
  super_admin: {
    title: 'Super Admin',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    desc: 'Unrestricted control: roles, prices, refunds, DB telemetry, and settings.',
  },
  operations: {
    title: 'Operations & QC',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: '7-stage order processing, BlueDart courier dispatch, and packing slips.',
  },
  catalogue_manager: {
    title: 'Catalogue Manager',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    desc: 'Hardware products, stock adjustments, wholesale unit costs, and variants.',
  },
  finance: {
    title: 'Finance & Gateway',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Razorpay settlements, revenue tracking, and refunds.',
  },
  support: {
    title: 'Merchant Support',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    desc: 'Customer CRM, merchant notes, and QR destination routing audits.',
  },
};

export function SystemHealthClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRole>('operations');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role Edit Modal
  const [editRoleMember, setEditRoleMember] = useState<StaffMember | null>(null);
  const [newRole, setNewRole] = useState<StaffRole>('operations');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const loadHealthData = async () => {
    try {
      const res = await fetch('/api/super/health');
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to load health report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  // GSAP animation for subsystem cards & staff rows
  useEffect(() => {
    if (!loading && report && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.sys-card',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
        gsap.fromTo(
          '.staff-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out', delay: 0.1, clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, report]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      alert('Name and email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/super/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffName.trim(),
          email: staffEmail.trim(),
          phone: staffPhone.trim() || undefined,
          role: staffRole,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setReport((prev) => (prev ? { ...prev, staffMembers: [data.member, ...prev.staffMembers] } : prev));
        setShowAddStaffModal(false);
        setStaffName('');
        setStaffEmail('');
        setStaffPhone('');
        alert(`Staff account provisioned for ${data.member.name}!`);
      } else {
        alert(data.error || 'Failed to provision staff account');
      }
    } catch {
      alert('Error creating staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editRoleMember) return;
    setIsUpdatingRole(true);
    try {
      const res = await fetch(`/api/super/staff/${editRoleMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setReport((prev) =>
          prev
            ? {
                ...prev,
                staffMembers: prev.staffMembers.map((m) => (m.id === editRoleMember.id ? data.member : m)),
              }
            : prev
        );
        setEditRoleMember(null);
        alert(`Role updated for ${editRoleMember.name}!`);
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch {
      alert('Error updating role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleToggleStaffActive = async (member: StaffMember) => {
    try {
      const res = await fetch(`/api/super/staff/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setReport((prev) =>
          prev
            ? {
                ...prev,
                staffMembers: prev.staffMembers.map((m) => (m.id === member.id ? data.member : m)),
              }
            : prev
        );
      }
    } catch {
      alert('Failed to update status');
    }
  };

  if (loading || !report) {
    return <div className="p-16 text-center text-slate-400 text-xs font-mono">Running system telemetry scan...</div>;
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">System Diagnostics & Access Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Zero Trust RBAC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time infrastructure health, database WAL archive status, Razorpay webhook telemetry, and Role-Based Access Control (RBAC).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadHealthData}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Poll Health</span>
          </button>
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Staff Member</span>
          </button>
        </div>
      </div>

      {/* Subsystem Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {report.subsystems.map((sub) => (
          <div key={sub.name} className="sys-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" />
                {sub.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {sub.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{sub.details}</p>
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-500 font-mono">
              <span>Latency: <strong className="text-slate-800">{sub.latencyMs}ms</strong></span>
              <span>Uptime: <strong className="text-emerald-700">{sub.uptimePercent}%</strong></span>
            </div>
          </div>
        ))}

        {/* Database WAL Backup Status Card */}
        <div className="sys-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Automated Postgres WAL Archive
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {report.databaseBackup.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{report.databaseBackup.provider}</p>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[10px] text-slate-500 font-mono">
            <span>Retention: <strong className="text-slate-800">{report.databaseBackup.retentionDays} Days</strong></span>
            <span>Last Snapshot: <strong className="text-slate-800">3h ago</strong></span>
          </div>
        </div>
      </div>

      {/* Staff Directory & Role-Based Access Control (RBAC) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">Staff Directory & Role-Based Permissions (RBAC)</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {report.staffMembers.length} active staff accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Permissions Scope</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {report.staffMembers.map((member) => {
                const roleMeta = ROLE_LABELS[member.role] || ROLE_LABELS.operations;

                return (
                  <tr key={member.id} className="staff-row hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {member.id}</div>
                    </td>

                    <td className="py-4 px-4 space-y-0.5">
                      <div className="text-slate-800 text-xs">{member.email}</div>
                      {member.phone && <div className="text-slate-500 text-[10px] font-mono">+91 {member.phone}</div>}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${roleMeta.color}`}>
                        {roleMeta.title}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs text-slate-500 text-[11px]">
                      {roleMeta.desc}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          member.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditRoleMember(member);
                            setNewRole(member.role);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Change Role
                        </button>
                        {member.role !== 'super_admin' && (
                          <button
                            onClick={() => handleToggleStaffActive(member)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              member.isActive
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-transparent hover:border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {member.isActive ? 'Suspend' : 'Restore'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Provision Staff Account
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@qrslice.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Phone</label>
                <input
                  type="text"
                  placeholder="9811223344"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role & Permissions *</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                >
                  <option value="operations">Operations & QC (Orders, BlueDart, Packing Slips)</option>
                  <option value="catalogue_manager">Catalogue Manager (Products, SKUs, Stock)</option>
                  <option value="finance">Finance & Gateway (Razorpay, Taxes, Refunds)</option>
                  <option value="support">Merchant Support (CRM, Notes, QR Audits)</option>
                  <option value="super_admin">Super Admin (Full Root Access)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-800">
                Staff creation triggers a cryptographic audit log record with the actor&apos;s verified credentials.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Provisioning...' : 'Provision Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Role Modal */}
      {editRoleMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                Change Role for {editRoleMember.name}
              </h3>
              <button
                onClick={() => setEditRoleMember(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Role Assignment</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                >
                  <option value="operations">Operations & QC</option>
                  <option value="catalogue_manager">Catalogue Manager</option>
                  <option value="finance">Finance & Gateway</option>
                  <option value="support">Merchant Support</option>
                  <option value="super_admin">Super Admin (Full Root Access)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                Permission modifications are logged with before and after state diffs in the audit ledger.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setEditRoleMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={isUpdatingRole}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isUpdatingRole ? 'Updating...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
