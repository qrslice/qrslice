'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { AdminOrderView, OrderWorkflowStage } from '@/lib/orders-store';
import { downloadGSTInvoice } from '@/lib/invoice-generator';
import {
  FileText,
  Truck,
  ShieldCheck,
  Printer,
  RotateCcw,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STAGES: { stage: OrderWorkflowStage; label: string; desc: string }[] = [
  { stage: 'order_received', label: '1. Received', desc: 'Payment verified' },
  { stage: 'design_pending', label: '2. Design Pending', desc: 'Logo & URL collection' },
  { stage: 'design_approved', label: '3. Approved', desc: 'Client confirmed' },
  { stage: 'ready_to_print', label: '4. Ready to Print', desc: 'Artwork prepped' },
  { stage: 'production', label: '5. Production', desc: 'Laser marking & QC' },
  { stage: 'shipped', label: '6. Shipped', desc: 'Courier in transit' },
  { stage: 'delivered', label: '7. Delivered', desc: 'Handed to merchant' },
];

import { useSearchParams } from 'next/navigation';

export function SuperOrdersClient() {
  const searchParams = useSearchParams();
  const initialStage = searchParams.get('stage') || searchParams.get('status') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const containerRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<AdminOrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [stageFilter, setStageFilter] = useState<string>(initialStage);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [createdBatches, setCreatedBatches] = useState<Record<string, string>>({});
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { carrier: string; trackingNumber: string }>>({});
  
  // Refund modal state
  const [refundModalOrder, setRefundModalOrder] = useState<AdminOrderView | null>(null);
  const [refundAmountRupees, setRefundAmountRupees] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  // Packing slip modal state
  const [packingSlipOrder, setPackingSlipOrder] = useState<AdminOrderView | null>(null);

  // Staff notes open state per order
  const [openNotesMap, setOpenNotesMap] = useState<Record<string, boolean>>({});
  const [newNoteTextMap, setNewNoteTextMap] = useState<Record<string, string>>({});
  const [isAddingNote, setIsAddingNote] = useState<Record<string, boolean>>({});

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/super/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // GSAP animation for orders entrance
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.order-card',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out', clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, stageFilter]);

  const handleStageChange = async (orderId: string, newStage: OrderWorkflowStage) => {
    try {
      const res = await fetch(`/api/super/orders/${orderId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          notes: `Stage manually advanced to ${newStage} via Super Admin Control Room.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStage: newStage } : o))
        );
      } else {
        alert(data.error || 'Failed to update order stage.');
      }
    } catch {
      alert('Error communicating with backend.');
    }
  };

  const handleConvertBatch = async (orderId: string) => {
    setConvertingId(orderId);
    try {
      const res = await fetch(`/api/super/orders/${orderId}/convert-batch`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setCreatedBatches((prev) => ({ ...prev, [orderId]: data.batchId }));
        alert(`Hardware Batch Created: ${data.batchId} (${data.assignedCards?.length || 0} cards minted with PINs)`);
        loadOrders();
      } else {
        alert(data.error || 'Failed to generate batch.');
      }
    } catch {
      alert('Error connecting to card generator.');
    } finally {
      setConvertingId(null);
    }
  };

  const handleMarkShipped = async (orderId: string) => {
    const tracking = trackingInputs[orderId] || { carrier: 'BlueDart Express', trackingNumber: '' };
    if (!tracking.trackingNumber.trim()) {
      alert('Please enter an AWB / Tracking number first.');
      return;
    }

    try {
      const res = await fetch(`/api/super/orders/${orderId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: tracking.carrier,
          trackingNumber: tracking.trackingNumber.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  orderStage: 'shipped',
                  trackingCarrier: tracking.carrier,
                  trackingNumber: tracking.trackingNumber.trim(),
                }
              : o
          )
        );
        alert('Order dispatched and tracking saved.');
      } else {
        alert(data.error || 'Failed to dispatch order.');
      }
    } catch {
      alert('Network error while saving dispatch.');
    }
  };

  const handleProcessRefund = async () => {
    if (!refundModalOrder) return;
    const amountRupees = parseFloat(refundAmountRupees);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      alert('Please enter a valid refund amount in Rupees.');
      return;
    }
    if (!refundReason.trim()) {
      alert('Please state a reason for this refund.');
      return;
    }

    setIsRefunding(true);
    try {
      const res = await fetch(`/api/super/orders/${refundModalOrder.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaise: Math.round(amountRupees * 100),
          reason: refundReason.trim(),
          authorizedBy: 'Super Admin Suraj',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === refundModalOrder.id ? (data.order as AdminOrderView) : o))
        );
        setRefundModalOrder(null);
        setRefundReason('');
        setRefundAmountRupees('');
        alert(`Refund of ₹${amountRupees.toLocaleString('en-IN')} authorized successfully.`);
      } else {
        alert(data.error || 'Refund failed to process.');
      }
    } catch {
      alert('Network error during refund authorization.');
    } finally {
      setIsRefunding(false);
    }
  };

  const handleAddNote = async (orderId: string) => {
    const noteText = newNoteTextMap[orderId]?.trim();
    if (!noteText) return;

    setIsAddingNote((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`/api/super/orders/${orderId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Super Admin Suraj',
          note: noteText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? (data.order as AdminOrderView) : o))
        );
        setNewNoteTextMap((prev) => ({ ...prev, [orderId]: '' }));
      }
    } catch {
      alert('Failed to save staff note.');
    } finally {
      setIsAddingNote((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesStage =
      stageFilter === 'all' ||
      o.orderStage === stageFilter ||
      (stageFilter === 'refunded' && (o.paymentStatus === 'refunded' || o.paymentStatus === 'partially_refunded'));

    return matchesSearch && matchesStage;
  });

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">7-Stage Order & Fulfilment Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              Live Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end hardware orders workflow: verify payment, approve designs, trigger laser production, dispatch via BlueDart/Delhivery, and audit refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-mono text-slate-700">
            Active Orders: <span className="font-bold text-slate-900">{orders.length}</span>
          </div>
          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-slate-600 hover:text-slate-900 transition"
            title="Refresh order database"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold mr-1">Stage:</span>
          {['all', 'order_received', 'design_pending', 'design_approved', 'ready_to_print', 'production', 'shipped', 'delivered', 'refunded'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  stageFilter === st
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
                }`}
              >
                {st === 'all' ? 'All' : st.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs font-mono">Syncing order ledger...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs text-slate-500 text-xs">
          No orders matching filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const batchId = createdBatches[order.id] || order.items[0]?.batchId;
            const tracking = trackingInputs[order.id] || { carrier: order.trackingCarrier || 'BlueDart Express', trackingNumber: order.trackingNumber || '' };
            const isNotesOpen = openNotesMap[order.id] || false;
            const currentStageIndex = STAGES.findIndex((s) => s.stage === order.orderStage);

            return (
              <div
                key={order.id}
                className="order-card p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 hover:shadow-sm transition"
              >
                {/* Header row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-black text-slate-900 font-mono">{order.orderNumber}</span>
                    
                    {/* Payment badge */}
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                        order.paymentStatus === 'refunded'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : order.paymentStatus === 'partially_refunded'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {order.paymentStatus.replace('_', ' ')}
                    </span>

                    {/* Stage badge */}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      Stage: {order.orderStage?.replace('_', ' ') || 'order received'}
                    </span>

                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {/* GST Invoice */}
                    <button
                      onClick={() =>
                        downloadGSTInvoice({
                          orderNumber: order.orderNumber,
                          createdAt: order.createdAt,
                          customerName: order.customerName,
                          customerEmail: order.customerEmail,
                          customerPhone: order.customerPhone,
                          shippingAddress: order.shippingAddress,
                          gstin: order.gstin,
                          businessLegalName: order.businessLegalName,
                          items: order.items,
                          subtotalPaise: order.subtotalPaise || order.totalPaise,
                          shippingPaise: order.shippingPaise || 0,
                          totalPaise: order.totalPaise,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Download Order Receipt / Invoice"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>Invoice / Receipt</span>
                    </button>

                    {/* Packing slip button */}
                    <button
                      onClick={() => setPackingSlipOrder(order)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Generate Packing Slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Packing Slip</span>
                    </button>

                    {/* Refund button */}
                    <button
                      onClick={() => {
                        setRefundModalOrder(order);
                        const remaining = (order.totalPaise - (order.refundedPaise || 0)) / 100;
                        setRefundAmountRupees(remaining > 0 ? remaining.toString() : '0');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-transparent hover:border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Issue Partial or Full Refund"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Refund</span>
                    </button>

                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                      <span className="text-xs text-slate-500">Total:</span>
                      <span className="text-sm font-black text-emerald-600">
                        ₹{(order.totalPaise / 100).toLocaleString('en-IN')}
                      </span>
                      {order.refundedPaise ? (
                        <span className="text-[11px] text-rose-600 font-bold">
                          (-₹{(order.refundedPaise / 100).toLocaleString('en-IN')})
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* 7-Stage Visual Fulfillment Progress Stepper */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Fulfilment Pipeline:
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Current: <strong className="text-purple-700">{order.orderStage?.replace('_', ' ').toUpperCase()}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                    {STAGES.map((s, idx) => {
                      const isPast = currentStageIndex > idx;
                      const isCurrent = currentStageIndex === idx || (!order.orderStage && idx === 0);

                      return (
                        <button
                          key={s.stage}
                          onClick={() => handleStageChange(order.id, s.stage)}
                          className={`px-2 py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 border text-xs font-semibold cursor-pointer ${
                            isCurrent
                              ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                              : isPast
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                          }`}
                          title={`Advance stage to: ${s.label}`}
                        >
                          {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                          <span className="text-[10px] truncate">{s.label.replace(/^\d+\.\s*/, '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer info */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">Customer & Shipping Address</h4>
                    <p className="text-slate-900 font-semibold">
                      {order.businessLegalName ? `${order.businessLegalName} (${order.customerName})` : order.customerName}
                    </p>
                    <p className="text-slate-600">{order.customerEmail} · +91 {order.customerPhone}</p>
                    <p className="text-slate-500 text-[11px] mt-1">{order.shippingAddress}</p>

                    {order.gstin && (
                      <div className="pt-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 font-mono font-bold text-[11px]">
                          Tax Ref: {order.gstin}
                        </span>
                      </div>
                    )}

                    {order.refundReason && (
                      <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                        <span className="font-bold">Refund Note: </span>{order.refundReason}
                        {order.refundAuthorizedBy && (
                          <span className="text-slate-500 font-mono block text-[10px] mt-0.5">
                            Authorized by: {order.refundAuthorizedBy}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Custom Hardware items */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">Custom Laser Marking & Provisioned Tokens</h4>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>{item.productTitle}</span>
                          <span className="text-emerald-700 font-bold">{item.quantity} unit(s)</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Laser Marking: <span className="text-slate-900 font-bold">&quot;{item.customBusinessName}&quot;</span> ({item.finish})
                        </p>
                        {item.destinationUrl && (
                          <p className="text-[11px] text-slate-600 truncate">
                            Pre-Routed: <span className="text-purple-700 font-mono">{item.destinationUrl}</span>
                          </p>
                        )}

                        {item.assignedCardIds && item.assignedCardIds.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            {item.assignedCardIds.map((cid, idx) => (
                              <span
                                key={cid}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[10px]"
                              >
                                ID: {cid} | PIN: {item.printedClaimTokens?.[idx] || '------'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispatch & Batch Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  {/* Courier input for marking shipped */}
                  <div className="flex items-center flex-wrap gap-2">
                    <select
                      value={tracking.carrier}
                      onChange={(e) =>
                        setTrackingInputs((prev) => ({
                          ...prev,
                          [order.id]: { ...tracking, carrier: e.target.value },
                        }))
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                    >
                      <option value="BlueDart Express">BlueDart Express</option>
                      <option value="Delhivery Air">Delhivery Air</option>
                      <option value="DTDC Plus">DTDC Plus</option>
                      <option value="Speed Post">Speed Post</option>
                    </select>
                    <input
                      type="text"
                      value={tracking.trackingNumber}
                      onChange={(e) =>
                        setTrackingInputs((prev) => ({
                          ...prev,
                          [order.id]: { ...tracking, trackingNumber: e.target.value },
                        }))
                      }
                      placeholder="AWB / Tracking #"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 w-36 font-mono focus:bg-white focus:outline-none focus:border-purple-600"
                    >
                    </input>
                    <button
                      onClick={() => handleMarkShipped(order.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{order.trackingNumber ? 'Update Tracking' : 'Dispatch & Notify'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tax Invoice & Packing Slip Download */}
                    <a
                      href={`/api/super/orders/${order.orderNumber}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>Order Receipt</span>
                    </a>

                    <a
                      href={`/api/super/orders/${order.orderNumber}/packing-slip`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Packing Slip</span>
                    </a>

                    {/* Toggle Staff Notes */}
                    <button
                      onClick={() =>
                        setOpenNotesMap((prev) => ({ ...prev, [order.id]: !prev[order.id] }))
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Staff Notes ({order.internalNotes?.length || 0})</span>
                      {isNotesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {batchId ? (
                      <Link
                        href={`/super/cards/${batchId}`}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>🏭 View Batch & Export SVGs</span>
                        <span>→</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleConvertBatch(order.id)}
                        disabled={convertingId === order.id}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition disabled:opacity-50 shadow-xs cursor-pointer"
                      >
                        {convertingId === order.id
                          ? 'Minting Batch & PINs...'
                          : '⚡ Generate Card Batch & PINs'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Staff Notes & Timeline */}
                {isNotesOpen && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                      Internal Staff Notes & Production Log
                    </h5>

                    {order.internalNotes && order.internalNotes.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {order.internalNotes.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                              <span className="font-semibold text-purple-700">{n.author}</span>
                              <span className="font-mono">{new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-800">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">No internal staff notes on this order yet.</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add internal note (e.g., logo resolution verified, custom foil finish approved)..."
                        value={newNoteTextMap[order.id] || ''}
                        onChange={(e) =>
                          setNewNoteTextMap((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNote(order.id);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                      />
                      <button
                        onClick={() => handleAddNote(order.id)}
                        disabled={isAddingNote[order.id]}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isAddingNote[order.id] ? 'Saving...' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                Issue Refund for {refundModalOrder.orderNumber}
              </h3>
              <button
                onClick={() => setRefundModalOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500">Customer: </span>
                <span className="text-slate-900 font-semibold">{refundModalOrder.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Order Value: </span>
                <span className="text-emerald-700 font-mono font-bold">
                  ₹{(refundModalOrder.totalPaise / 100).toLocaleString('en-IN')}
                </span>
                {refundModalOrder.refundedPaise ? (
                  <span className="text-rose-600 ml-2 font-mono">
                    (Already refunded: ₹{(refundModalOrder.refundedPaise / 100).toLocaleString('en-IN')})
                  </span>
                ) : null}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmountRupees}
                  onChange={(e) => setRefundAmountRupees(e.target.value)}
                  placeholder="e.g. 1398"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Refund Justification / Reason *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Merchant requested cancellation prior to laser etching."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-rose-600" />
                This will trigger an immutable cryptographic audit trail entry and adjust net revenue calculations across your finance dashboard.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setRefundModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={isRefunding}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isRefunding ? 'Recording Refund...' : 'Authorize Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Packing Slip Modal */}
      {packingSlipOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">QRSLICE DISPATCH PACKING SLIP</h2>
                <p className="text-xs text-slate-500 font-mono">ORDER #{packingSlipOrder.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-black"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setPackingSlipOrder(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Ship To</h4>
                <p className="font-bold text-sm text-slate-950 mt-1">{packingSlipOrder.customerName}</p>
                {packingSlipOrder.businessLegalName && (
                  <p className="font-medium text-slate-700">{packingSlipOrder.businessLegalName}</p>
                )}
                <p className="text-slate-600 mt-1 whitespace-pre-line">{packingSlipOrder.shippingAddress}</p>
                <p className="text-slate-600 mt-1">Phone: +91 {packingSlipOrder.customerPhone}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Logistics Details</h4>
                <p className="text-slate-700 mt-1">Carrier: <strong className="text-slate-950">{packingSlipOrder.trackingCarrier || 'BlueDart Express'}</strong></p>
                <p className="text-slate-700">Tracking: <strong className="font-mono text-slate-950">{packingSlipOrder.trackingNumber || 'Pending AWB'}</strong></p>
                <p className="text-slate-700">Fulfillment Stage: <strong className="uppercase text-purple-700">{packingSlipOrder.orderStage}</strong></p>
                <p className="text-slate-500 text-[10px] mt-2 font-mono">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Package Contents & Hardware QC</h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="p-2">Item / SKU</th>
                    <th className="p-2">Custom Engraving / URL</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-center">QC Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {packingSlipOrder.items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-2 font-medium">{it.productTitle} ({it.finish})</td>
                      <td className="p-2 text-slate-600 font-mono text-[11px]">
                        &quot;{it.customBusinessName}&quot;
                        {it.destinationUrl ? <div className="text-[10px] text-slate-500">{it.destinationUrl}</div> : null}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-900">{it.quantity}</td>
                      <td className="p-2 text-center text-slate-500">□ Passed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">QRslice Hardware Provisioning Guarantee</p>
                <p>NFC chip frequency tested. QR high-contrast optical scan verified at 100% readability.</p>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-500">
                QC Inspector: _____________
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
