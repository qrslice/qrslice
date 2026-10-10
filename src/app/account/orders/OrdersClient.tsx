'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { AdminOrderView } from '@/lib/orders-store';
import { downloadGstInvoicePdf } from '@/lib/invoice-generator';
import {
  Package,
  Truck,
  CheckCircle2,
  Download,
  RotateCcw,
  Zap,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function OrdersClient() {
  const [orders, setOrders] = useState<AdminOrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  const { addItem, openCart } = useCart();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/account/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching account orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleReorder = (order: AdminOrderView) => {
    order.items.forEach((item) => {
      addItem({
        productId: item.productId || 'custom-nfc-device',
        title: item.productTitle,
        slug: item.productSlug || 'custom-nfc-device',
        quantity: item.quantity,
        unitPricePaise: item.unitPricePaise || Math.round(order.totalPaise / order.items.length),
        finish: {
          id: 'finish-reorder',
          name: item.finish || 'Standard Matte',
          priceModifierPaise: 0,
          previewColor: '#000000',
        },
        customBusinessName: item.customBusinessName,
        customLogoUrl: item.customLogoUrl,
      });
    });

    setReorderSuccessMsg(`Reordered items from #${order.orderNumber} have been added to your cart!`);
    openCart();
    setTimeout(() => setReorderSuccessMsg(null), 5000);
  };

  const getMilestoneIndex = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 0;
      case 'manufacturing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const milestones = [
    { title: 'Payment Confirmed', desc: 'Order placed & hardware pre-routed' },
    { title: 'Laser Customization', desc: 'Precision UV print & chip encoding' },
    { title: 'Dispatched via Courier', desc: 'Express shipping with tracking' },
    { title: 'Delivered', desc: 'Ready for instant customer tap' },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium">Loading your hardware orders & dispatch statuses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Hardware Orders & Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track manufacturing progress, review courier tracking, and download official GST tax invoices.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm shadow-purple-600/20 w-fit"
        >
          <span>🛍️</span> Order More Devices
        </Link>
      </div>

      {reorderSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{reorderSuccessMsg}</span>
          <button onClick={() => setReorderSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No hardware orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t placed any NFC hardware orders yet. Explore our custom review standees, UPI displays, and smart business cards.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm"
          >
            Explore Product Catalog →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getMilestoneIndex(order.status);
            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6 hover:border-purple-200 transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-slate-900">
                      ₹{(order.totalPaise / 100).toLocaleString('en-IN')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Milestone Progress Tracker */}
                <div className="py-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {milestones.map((step, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div
                          key={step.title}
                          className={`p-3 rounded-2xl border transition ${
                            isCurrent
                              ? 'bg-purple-50/80 border-purple-300'
                              : isCompleted
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-slate-50/40 border-slate-100 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isCurrent
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {isCompleted && !isCurrent ? '✓' : idx + 1}
                            </span>
                            <span className={`text-xs font-bold ${isCurrent ? 'text-purple-900' : 'text-slate-800'}`}>
                              {step.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{step.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking & Courier Info */}
                {order.trackingNumber && (
                  <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <span className="text-slate-500 font-medium">Carrier:</span>
                      <span className="font-bold text-slate-900">{order.trackingCarrier || 'BlueDart Express'}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-medium">AWB:</span>
                      <span className="font-mono text-purple-800 font-bold">{order.trackingNumber}</span>
                    </div>
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 transition flex items-center gap-1"
                      >
                        <span>Track Delivery</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Items in this order */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hardware Included</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.productTitle}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Finish: {item.finish}</p>
                          <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                            Custom: &quot;{item.customBusinessName}&quot;
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">Quantity: {item.quantity}</p>
                        </div>
                        {item.unitPricePaise && (
                          <span className="text-xs font-bold text-slate-900">
                            ₹{((item.unitPricePaise * item.quantity) / 100).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping destination & actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 max-w-md">
                    <span className="font-semibold text-slate-700">Shipped to:</span> {order.customerName} · {order.shippingAddress}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        downloadGstInvoicePdf({
                          ...order,
                          subtotalPaise: order.subtotalPaise || order.totalPaise,
                          shippingPaise: order.shippingPaise || 0,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>GST Tax Invoice</span>
                    </button>
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Reorder</span>
                    </button>
                    {(order.status === 'delivered' || order.status === 'shipped') && (
                      <Link
                        href="/activate"
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Activate Card</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
