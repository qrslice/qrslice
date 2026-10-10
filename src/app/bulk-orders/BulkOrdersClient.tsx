'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import {
  Boxes,
  Upload,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Building2,
  Users,
  CreditCard,
  Check,
} from 'lucide-react';

interface BatchRow {
  id: string;
  name: string;
  role: string;
  destinationUrl: string;
}

const BULK_PRODUCTS = [
  {
    id: 'nfc-business-card-metal-black',
    title: 'Matte Black Laser Metal NFC Card',
    basePricePaise: 79900,
    image: '/products/nfc-business-card.png',
    slug: 'nfc-business-card-metal-black',
  },
  {
    id: 'nfc-business-card-pvc-matte',
    title: 'Frost White Smart PVC Card',
    basePricePaise: 29900,
    image: '/products/nfc-card-pvc.png',
    slug: 'nfc-business-card-pvc-matte',
  },
  {
    id: 'acrylic-google-review-standee',
    title: 'Acrylic Google Review Standee',
    basePricePaise: 49900,
    image: '/products/google-review-standee.png',
    slug: 'acrylic-google-review-standee',
  },
  {
    id: 'dual-qr-upi-payment-standee',
    title: 'Countertop UPI Payment Standee',
    basePricePaise: 39900,
    image: '/products/upi-payment-standee.png',
    slug: 'dual-qr-upi-payment-standee',
  },
];

export function BulkOrdersClient() {
  const { addItem, openCart } = useCart();
  const [selectedProductId, setSelectedProductId] = useState(BULK_PRODUCTS[0].id);

  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [rows, setRows] = useState<BatchRow[]>([
    { id: '1', name: 'Arjun Mehta', role: 'Managing Director', destinationUrl: 'https://qrslice.com/p/arjun' },
    { id: '2', name: 'Priya Sharma', role: 'VP of Engineering', destinationUrl: 'https://qrslice.com/p/priya' },
    { id: '3', name: 'Vikram Rao', role: 'Head of Sales', destinationUrl: 'https://qrslice.com/p/vikram' },
    { id: '4', name: 'Sneha Patel', role: 'Senior Product Manager', destinationUrl: 'https://qrslice.com/p/sneha' },
    { id: '5', name: 'Rohan Gupta', role: 'Lead Architect', destinationUrl: 'https://qrslice.com/p/rohan' },
  ]);

  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const currentProduct = BULK_PRODUCTS.find((p) => p.id === selectedProductId) || BULK_PRODUCTS[0];
  const count = rows.length;

  // Calculate bulk discount tier
  const getDiscountPercent = (qty: number) => {
    if (qty >= 50) return 35;
    if (qty >= 25) return 25;
    if (qty >= 10) return 15;
    return 0;
  };

  const discountPercent = getDiscountPercent(count);
  const baseTotalPaise = currentProduct.basePricePaise * count;
  const discountedTotalPaise = Math.round(baseTotalPaise * (1 - discountPercent / 100));

  const handleAddRow = () => {
    const newId = String(Date.now());
    setRows([
      ...rows,
      {
        id: newId,
        name: `Member ${rows.length + 1}`,
        role: 'Team Associate',
        destinationUrl: 'https://qrslice.com/profile',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof BatchRow, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // CSV download template
  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Full Name,Job Title / Branch,Destination URL\n' +
      rows.map((r) => `"${r.name}","${r.role}","${r.destinationUrl}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QrSlice_Bulk_Batch_${companyName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV file upload parser
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const newRows: BatchRow[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts[0]) {
          newRows.push({
            id: `csv-${i}`,
            name: parts[0],
            role: parts[1] || 'Team Member',
            destinationUrl: parts[2] || 'https://qrslice.com',
          });
        }
      }

      if (newRows.length > 0) {
        setRows(newRows);
      }
    };
    reader.readAsText(file);
  };

  // 1-Click Batch Add to Cart
  const handleAddBatchToCart = () => {
    rows.forEach((row, idx) => {
      const unitPrice = Math.round(currentProduct.basePricePaise * (1 - discountPercent / 100));
      addItem({
        productId: currentProduct.id,
        title: `${currentProduct.title} (${row.name})`,
        slug: currentProduct.slug,
        image: currentProduct.image,
        quantity: 1,
        unitPricePaise: unitPrice,
        finish: {
          id: 'bulk-batch',
          name: `${companyName} Laser Setup`,
          priceModifierPaise: 0,
          previewColor: '#0F172A',
        },
        customBusinessName: `${row.name} - ${row.role}`,
      });
    });

    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
    openCart();
  };

  return (
    <div className="space-y-8">
      {/* 1. Configuration Controls & Product Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Selection & Company Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span>1. Select Hardware Product & Organization</span>
            </h2>

            {/* Hardware Product Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BULK_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3.5 ${
                    selectedProductId === prod.id
                      ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0">
                    <img src={prod.image} alt={prod.title} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{prod.title}</p>
                    <p className="text-xs text-purple-700 font-extrabold mt-0.5">
                      ₹{(prod.basePricePaise / 100).toLocaleString('en-IN')} / unit
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Company / Brand Name */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Company / Organization Name (to be laser engraved on back)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Copper Chimney Hospitality, Razorpay, TechLabs"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 2. Employee / Branch Data Grid */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>2. Team Members & Custom Laser Names ({count} Units)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter individual member details or upload a spreadsheet.
                </p>
              </div>

              {/* CSV Upload & Template Buttons */}
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold cursor-pointer transition flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload CSV</span>
                  <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Editable Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Role / Branch</th>
                    <th className="py-2.5 px-3">Destination URL / vCard Link</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{index + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.role}
                          onChange={(e) => handleUpdateRow(row.id, 'role', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.destinationUrl}
                          onChange={(e) => handleUpdateRow(row.id, 'destinationUrl', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-purple-700 focus:border-purple-600 focus:outline-hidden"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={rows.length <= 1}
                          className="text-slate-400 hover:text-rose-600 p-1 transition disabled:opacity-30"
                          title="Remove row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Row Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member Row</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Breakdown & Batch Checkout Card */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-600" />
              <span>Volume Discount Summary</span>
            </h3>

            {/* Quantity Tier Indicator */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Total Units</span>
                <span className="font-mono font-black text-slate-900">{count} Custom Items</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Applied Discount</span>
                <span className="font-bold text-emerald-600">{discountPercent}% OFF</span>
              </div>
            </div>

            {/* Volume Tiers Bar */}
            <div className="space-y-1.5 text-[11px]">
              <span className="font-bold text-slate-500 uppercase">Discount Tiers</span>
              <div className="grid grid-cols-3 gap-1.5 text-center font-bold">
                <div className={`p-1.5 rounded-lg border ${count >= 10 && count < 25 ? 'bg-purple-100 border-purple-400 text-purple-900' : 'bg-slate-50 text-slate-500'}`}>
                  10+ : 15% OFF
                </div>
                <div className={`p-1.5 rounded-lg border ${count >= 25 && count < 50 ? 'bg-purple-100 border-purple-400 text-purple-900' : 'bg-slate-50 text-slate-500'}`}>
                  25+ : 25% OFF
                </div>
                <div className={`p-1.5 rounded-lg border ${count >= 50 ? 'bg-purple-100 border-purple-400 text-purple-900' : 'bg-slate-50 text-slate-500'}`}>
                  50+ : 35% OFF
                </div>
              </div>
            </div>

            {/* Pricing Total Calculation */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Total ({count} × ₹{(currentProduct.basePricePaise / 100).toFixed(0)})</span>
                <span className="font-mono">₹{(baseTotalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Volume Savings ({discountPercent}%)</span>
                  <span className="font-mono">-₹{((baseTotalPaise - discountedTotalPaise) / 100).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Pan-India Priority Express Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Invoice Amount</span>
                <span className="text-purple-700 font-mono">
                  ₹{(discountedTotalPaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Unregistered entity under GST law (0% GST, no input tax credit).</p>
            </div>

            {/* Batch Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddBatchToCart}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-md group"
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Added {count} Custom Items to Cart!</span>
                </>
              ) : (
                <>
                  <span>Add Batch of {count} Items to Cart</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* B2B Trust Guarantee */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Corporate Production SLA</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every unit is digitally verified, chip-encoded, laser-inspected, and delivered with individual presentation sleeves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
