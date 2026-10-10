'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  Plus,
  Search,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { AdminProduct } from '@/lib/admin-catalog-store';

export function ProductsManagerClient() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as any) || 'all';

  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'low_stock' | 'inactive' | 'archived'>(initialStatus);

  // Modal states
  const [stockModalProduct, setStockModalProduct] = useState<AdminProduct | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [stockReason, setStockReason] = useState<'goods_received' | 'damaged' | 'audit_reconciliation'>('goods_received');
  const [stockNotes, setStockNotes] = useState('');
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  // New product modal state
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'standees' | 'cards' | 'plaques' | 'tags'>('standees');
  const [newPrice, setNewPrice] = useState(599);
  const [newCostPrice, setNewCostPrice] = useState(220);
  const [newStock, setNewStock] = useState(50);
  const [newMaterial, setNewMaterial] = useState<'Acrylic' | 'Wooden' | 'PVC' | 'Metal'>('Acrylic');
  const [newDescription, setNewDescription] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);

    fetch(`/api/super/products?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setProducts(res.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter]);

  // GSAP animation for table rows
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.product-row',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out', clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleStockAdjustment = async () => {
    if (!stockModalProduct) return;
    setIsSubmittingStock(true);

    try {
      const deltaNumber = stockReason === 'damaged' ? -Math.abs(stockDelta) : Math.abs(stockDelta);
      const res = await fetch(`/api/super/products/${stockModalProduct.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delta: deltaNumber,
          reason: stockReason,
          notes: stockNotes,
        }),
      });

      if (res.ok) {
        setStockModalProduct(null);
        setStockNotes('');
        fetchProducts();
      } else {
        alert('Failed to update stock');
      }
    } catch {
      alert('Error connecting to inventory backend');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const handleToggleActive = async (p: AdminProduct) => {
    try {
      const res = await fetch(`/api/super/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to toggle storefront visibility');
      }
    } catch {
      alert('Error connecting to catalog backend');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const categoryPrefix = newCategory.substring(0, 3).toUpperCase();
    const sku = `QS-${categoryPrefix}-${Date.now().toString().slice(-4)}`;

    try {
      const res = await fetch('/api/super/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug,
          sku,
          description: newDescription.trim() || `${newTitle} custom physical hardware display.`,
          shortDescription: `${newTitle} with NFC and QR`,
          category: newCategory,
          categorySlug: newCategory === 'standees' ? 'google-review' : 'business-cards',
          vertical: 'all',
          basePricePaise: newPrice * 100,
          costPricePaise: newCostPrice * 100,
          stockQuantity: newStock,
          lowStockThreshold: 10,
          rating: 5.0,
          reviewCount: 0,
          material: newMaterial,
          color: 'white',
          image: '/products/acrylic-google-review-standee.png',
          finishes: [
            { id: 'standard', name: 'Standard Finish', priceModifierPaise: 0, previewColor: '#ffffff' },
          ],
          features: ['Custom Laser Engraved', 'Embedded NTAG213 NFC Chip', 'High-Contrast QR Code'],
          isActive: true,
          isArchived: false,
          nfcSupport: true,
          qrSupport: true,
          isCustomizable: true,
        }),
      });

      if (res.ok) {
        setIsNewProductModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        fetchProducts();
      } else {
        alert('Failed to create product');
      }
    } catch {
      alert('Error creating product');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page Title & Add Product Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Physical Catalogue & Inventory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Live Storefront Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage SKUs, wholesale cost margins, stock levels, variants, and published availability across all physical hardware.
          </p>
        </div>

        <button
          onClick={() => setIsNewProductModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Hardware Product</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 shadow-xs"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center bg-white border border-slate-200/80 rounded-xl p-1 gap-1 text-xs shadow-xs">
            {(['all', 'active', 'low_stock', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Inventory Data Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading product catalogue...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No hardware products match filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-600 bg-slate-50/80 border-b border-slate-200/80 font-bold">
                <tr>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Selling Price</th>
                  <th className="py-3 px-3">Unit Cost</th>
                  <th className="py-3 px-3">Margin %</th>
                  <th className="py-3 px-3">Inventory Stock</th>
                  <th className="py-3 px-3">Storefront</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => {
                  const marginPercent = Math.round(
                    ((p.basePricePaise - p.costPricePaise) / p.basePricePaise) * 100
                  );
                  const isLow = p.stockQuantity <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="product-row hover:bg-slate-50/70 transition">
                      {/* Product Thumbnail & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate max-w-[220px]">{p.title}</div>
                            <div className="font-mono text-[10px] text-slate-500">{p.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 uppercase">
                          {p.category}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        ₹{(p.basePricePaise / 100).toLocaleString('en-IN')}
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        ₹{(p.costPricePaise / 100).toLocaleString('en-IN')}
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-emerald-700">
                          {marginPercent}%
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-black text-sm ${
                              isLow ? 'text-amber-700' : 'text-slate-900'
                            }`}
                          >
                            {p.stockQuantity}
                          </span>
                          {isLow && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Storefront Status Toggle */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {p.isActive ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setStockModalProduct(p);
                              setStockDelta(10);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition cursor-pointer"
                            title="Adjust inventory stock"
                          >
                            Stock ±
                          </button>
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition"
                            title="View public product page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Adjust Stock: {stockModalProduct.title}</h3>
                <p className="text-xs text-slate-500 font-mono">Current Stock: {stockModalProduct.stockQuantity} units</p>
              </div>
              <button
                onClick={() => setStockModalProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Adjustment Type</label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                >
                  <option value="goods_received">+ Goods Received from Fabricator</option>
                  <option value="damaged">- Damaged Stock / Scrapped Acrylic</option>
                  <option value="audit_reconciliation">Audit Reconciliation Count</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Internal Notes</label>
                <input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="e.g. Batch #402 delivered by courier"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setStockModalProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjustment}
                disabled={isSubmittingStock}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Stock Adjustment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Product Creator Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Create New Physical Hardware SKU</h3>
              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Brushed Brass NFC Review Standee"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                >
                  <option value="standees">Standees</option>
                  <option value="cards">Cards</option>
                  <option value="plaques">Plaques</option>
                  <option value="tags">Tags & Stickers</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Material *</label>
                <select
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                >
                  <option value="Acrylic">Cast Acrylic</option>
                  <option value="Wooden">Natural Beechwood</option>
                  <option value="PVC">Matte PVC</option>
                  <option value="Metal">Stainless Steel</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  min="99"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Unit Cost Price (₹) *</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Opening Stock Units *</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
              >
                Create Product SKU
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
