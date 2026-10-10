'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Search,
  X,
  Send,
} from 'lucide-react';
import { AdminCustomerProfile } from '@/lib/admin-customer-store';

export function CustomersClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<AdminCustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerProfile | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    fetch(`/api/super/customers?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setCustomers(res.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // GSAP animation for customer rows
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.cust-row',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleAddNote = async () => {
    if (!selectedCustomer || !newNote.trim()) return;
    setIsAddingNote(true);

    try {
      const res = await fetch(`/api/super/customers/${encodeURIComponent(selectedCustomer.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim(), author: 'suraj@qrslice.com' }),
      });

      if (res.ok) {
        const data = await res.json();
        selectedCustomer.supportNotes.unshift(data.note);
        setNewNote('');
        fetchCustomers();
      } else {
        alert('Failed to add note');
      }
    } catch {
      alert('Error connecting to customer backend');
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Merchant & Customer Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              Live Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search café owners, review lifetime spend (LTV), subscription status, order history, and maintain audit-logged internal notes.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-mono text-slate-700">
          Total Merchants: <span className="font-bold text-slate-900">{customers.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, email, phone, or business..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 shadow-xs"
        />
      </form>

      {/* Customers Data Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading customer directory...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No customer accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-600 bg-slate-50/80 border-b border-slate-200/80 font-bold">
                <tr>
                  <th className="py-3 px-4">Customer & Merchant</th>
                  <th className="py-3 px-3">Contact Details</th>
                  <th className="py-3 px-3">Orders</th>
                  <th className="py-3 px-3">Lifetime Value</th>
                  <th className="py-3 px-3">Software Tier</th>
                  <th className="py-3 px-3">Last Active</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="cust-row hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-purple-700 font-semibold">{c.businessName}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-800">{c.email}</div>
                      <div className="font-mono text-[11px] text-slate-500">+91 {c.phone}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {c.ordersCount} orders
                    </td>

                    <td className="py-3.5 px-3 font-mono font-black text-emerald-700">
                      ₹{(c.totalSpentPaise / 100).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                        {c.subscriptionPlan}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Details & Notes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-purple-700 font-semibold">{selectedCustomer.businessName}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Lifetime Spend</div>
                <div className="text-base font-black text-emerald-700 font-mono mt-0.5">
                  ₹{(selectedCustomer.totalSpentPaise / 100).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Total Orders</div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {selectedCustomer.ordersCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Software Plan</div>
                <div className="text-xs font-black text-purple-700 mt-1">
                  {selectedCustomer.subscriptionPlan}
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Purchase History</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedCustomer.orders.map((o) => (
                  <div key={o.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                      <span className="text-slate-500 ml-2">({o.items[0]?.productTitle || 'Hardware Custom'})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-700">₹{(o.totalPaise / 100).toLocaleString('en-IN')}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700 uppercase">
                        {o.orderStage || o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Internal Staff Notes</h4>

              {/* Note input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal note about this customer..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>

              {/* Notes list */}
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedCustomer.supportNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No staff notes recorded yet.</p>
                ) : (
                  selectedCustomer.supportNotes.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <p className="text-slate-800">{n.note}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
