'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { downloadGstInvoicePdf } from '@/lib/invoice-generator';

interface OrderMilestone {
  step: number;
  title: string;
  desc: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
}

export function TrackOrderClient() {
  const [orderQuery, setOrderQuery] = useState('QS-ORD-1001');
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(true);

  // Demo order details for tracking
  const orderData = {
    orderNumber: orderQuery.toUpperCase().trim() || 'QS-ORD-1001',
    customerName: 'Demo Merchant (Sample Order)',
    companyName: 'Acme Cafe Demo Pvt Ltd',
    orderDate: 'October 8, 2026',
    estimatedDelivery: 'October 12, 2026',
    courier: 'Express Courier Partner',
    trackingAwb: 'DEMO-8921-9921-IN',
    destinationCity: 'Mumbai, Maharashtra — 400001',
    totalPaise: 119800,
    items: [
      {
        id: '1',
        title: 'Countertop Acrylic Google Review Standee',
        qty: 1,
        finish: 'Ultra-Clear Gloss Acrylic',
        customText: 'Acme Cafe & Bistro (Demo)',
        destinationUrl: 'https://example.com/demo-review',
        pricePaise: 49900,
      },
      {
        id: '2',
        title: 'Matte Black Laser Metal NFC Business Card',
        qty: 1,
        finish: 'Anodized Steel Laser Engraved',
        customText: 'Sample Merchant - Partner',
        destinationUrl: 'https://example.com/demo-profile',
        pricePaise: 69900,
      },
    ],
    milestones: [
      {
        step: 1,
        title: 'Order Confirmed & Payment Verified',
        desc: 'Razorpay transaction captured. Order invoice & receipt generated.',
        timestamp: 'Oct 8, 2026 · 10:24 AM',
        status: 'completed' as const,
      },
      {
        step: 2,
        title: 'Vector Artwork & Laser Proof Generated',
        desc: 'QR payload converted to vector lines for 1200 DPI laser bed cutter.',
        timestamp: 'Oct 8, 2026 · 02:15 PM',
        status: 'completed' as const,
      },
      {
        step: 3,
        title: 'Precision Laser Etching & NFC Chip Encoding',
        desc: 'NTAG213 microchip written with dynamic short URL; hardware laser cut.',
        timestamp: 'Oct 9, 2026 · 11:30 AM',
        status: 'completed' as const,
      },
      {
        step: 4,
        title: 'Multi-Point Quality Control & Inspection',
        desc: 'Dual-sensor RF tap test verified on iOS & Android; protective film applied.',
        timestamp: 'Oct 9, 2026 · 04:45 PM',
        status: 'completed' as const,
      },
      {
        step: 5,
        title: 'Dispatched via Bluedart Priority Air',
        desc: 'Package handed over to carrier. En route to Mumbai distribution hub.',
        timestamp: 'Oct 9, 2026 · 08:10 PM',
        status: 'current' as const,
      },
    ],
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearched(true);
    }, 400);
  };

  const handleDownloadInvoice = () => {
    downloadGstInvoicePdf({
      orderNumber: orderData.orderNumber,
      invoiceNumber: `INV-${orderData.orderNumber}`,
      createdAt: '2026-10-08T10:24:00Z',
      customerName: orderData.customerName,
      customerEmail: 'aditya@copperchimney.in',
      customerPhone: '+91 98200 12345',
      shippingAddress: 'Copper Chimney Bistro, 14 Hill Road, Bandra West, Mumbai, Maharashtra - 400050',
      businessLegalName: orderData.companyName,
      items: orderData.items.map((it) => ({
        title: it.title,
        quantity: it.qty,
        unitPricePaise: it.pricePaise,
        finish: it.finish,
        customBusinessName: it.customText,
      })),
      subtotalPaise: orderData.totalPaise,
      shippingPaise: 0,
      totalPaise: orderData.totalPaise,
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Order Lookup Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black text-slate-900">Track Manufacturing & Courier Status</h2>
          <p className="text-xs text-slate-500">
            Enter your QrSlice Order ID (e.g. <span className="font-mono font-bold text-purple-700">QS-ORD-1001</span>) or 10-digit mobile number.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. QS-ORD-1001"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 uppercase placeholder:normal-case focus:bg-white focus:border-purple-600 focus:outline-hidden font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-purple-700 transition shadow-sm disabled:opacity-50 shrink-0"
          >
            {isSearching ? 'Searching...' : 'Track'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500">
          <span>Quick demo lookup:</span>
          <button
            type="button"
            onClick={() => {
              setOrderQuery('QS-ORD-1001');
              setSearched(true);
            }}
            className="font-mono text-purple-700 font-bold hover:underline"
          >
            QS-ORD-1001
          </button>
        </div>
      </div>

      {/* 2. Order Tracking Status Results */}
      {searched && (
        <div className="space-y-8 animate-in fade-in-50">
          {/* Status Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-slate-900 text-lg">
                  {orderData.orderNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider">
                  In Transit
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Placed on {orderData.orderDate} · {orderData.customerName} ({orderData.companyName})
              </p>
            </div>

            {/* Estimated Delivery & Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-left">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Estimated Delivery
                </span>
                <span className="text-xs font-black text-emerald-900">
                  {orderData.estimatedDelivery}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center gap-2 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                <span>Order Receipt / Invoice (PDF)</span>
              </button>
            </div>
          </div>

          {/* 3. Visual 5-Stage Timeline & Carrier Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Timeline */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-4">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Manufacturing & Courier Progress Timeline</span>
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {orderData.milestones.map((m) => {
                  const isDone = m.status === 'completed';
                  const isCurrent = m.status === 'current';
                  return (
                    <div key={m.step} className="relative group">
                      {/* Milestone Icon Node */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform ${
                          isDone
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : isCurrent
                            ? 'bg-white border-purple-600 text-purple-600 shadow-md ring-4 ring-purple-100 animate-pulse'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : m.step}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                          <span className="text-[11px] font-mono text-slate-400">{m.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Courier Tracking & Hardware Items */}
            <div className="lg:col-span-4 space-y-6">
              {/* Courier Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span>Logistics Carrier</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Courier Partner</span>
                    <span className="font-bold text-slate-800">{orderData.courier}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Airway Bill (AWB)</span>
                    <span className="font-mono font-bold text-purple-700">{orderData.trackingAwb}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Destination</span>
                    <span className="font-semibold text-slate-800 text-right">{orderData.destinationCity}</span>
                  </div>
                </div>

                <a
                  href={`https://www.bluedart.com/tracking?awb=${orderData.trackingAwb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Track on Bluedart.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Items in this Order */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span>Custom Hardware in this Shipment</span>
                </h4>

                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-purple-700 font-semibold truncate">
                        Laser Engraving: &ldquo;{item.customText}&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Finish: {item.finish}</span>
                        <span className="font-bold text-slate-700">Qty: {item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
