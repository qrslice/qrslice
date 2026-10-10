'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  User,
  RefreshCw,
} from 'lucide-react';
import { AuditLogEntry } from '@/lib/audit-service';

export function AuditLogsClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('all');

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (resourceFilter !== 'all') params.set('resourceType', resourceFilter);

    fetch(`/api/super/audit-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setLogs(res.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [resourceFilter]);

  // GSAP animation for audit log cards
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.audit-card',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, resourceFilter]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">System Audit Trail & Security</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete cryptographic audit trail recording every price change, stock adjustment, workflow stage transition, and refund authorization.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-slate-700 hover:text-slate-900 transition flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200/80 shadow-xs p-1.5 rounded-2xl w-fit text-xs">
        {[
          { key: 'all', label: 'All Operations' },
          { key: 'order', label: 'Order Stages' },
          { key: 'inventory', label: 'Stock Adjustments' },
          { key: 'product', label: 'Catalogue Edits' },
          { key: 'refund', label: 'Refunds' },
          { key: 'customer', label: 'Customer CRM' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setResourceFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              resourceFilter === tab.key
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Logs Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            No audit records match the selected filter.
          </div>
        ) : (
          logs.map((log) => {
            const dateStr = new Date(log.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className="audit-card p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                      {log.action}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {log.resourceType.toUpperCase()}: {log.resourceId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <User className="w-3 h-3 text-purple-600" />
                      <span>{log.actorEmail}</span>
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-400">{dateStr}</span>
                  </div>
                </div>

                {/* Diff View (Before vs After) */}
                {(log.changesBefore || log.changesAfter) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    {log.changesBefore && Object.keys(log.changesBefore).length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                        <div className="text-[10px] text-rose-700 font-bold uppercase">Before State</div>
                        <pre className="text-slate-600 whitespace-pre-wrap break-all text-[11px]">
                          {JSON.stringify(log.changesBefore, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.changesAfter && Object.keys(log.changesAfter).length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">After State</div>
                        <pre className="text-emerald-800 whitespace-pre-wrap break-all text-[11px]">
                          {JSON.stringify(log.changesAfter, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata details (reasons, notes) */}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-900">Context:</span>
                    <span>
                      {Object.entries(log.metadata)
                        .map(([k, v]) => `${k}: "${v}"`)
                        .join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
