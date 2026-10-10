'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShopProduct, FinishOption } from '@/lib/shop-service';
import { useCart } from '@/lib/cart-context';

export function ProductCustomizerClient({ product }: { product: ShopProduct }) {
  const { addItem, openCart, itemCount } = useCart();

  const [businessName, setBusinessName] = useState('Urban Elegance');
  const [selectedFinish, setSelectedFinish] = useState<FinishOption>(product.finishes[0]);
  const [quantity, setQuantity] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  const unitPricePaise = product.basePricePaise + selectedFinish.priceModifierPaise;
  const totalPricePaise = unitPricePaise * quantity;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    if (!businessName.trim()) return;

    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      quantity,
      unitPricePaise,
      finish: selectedFinish,
      customBusinessName: businessName.trim(),
      customLogoUrl: logoPreview || undefined,
    });

    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 transition"
            >
              ← Back to Store
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-semibold text-white truncate max-w-[200px]">
              {product.title}
            </span>
          </div>

          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-white transition active:scale-95"
          >
            <span>🛒</span>
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-black text-[10px] font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left Column: Live Visual Mockup Preview */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start space-y-4">
          <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Artwork Preview
            </div>

            {/* Dynamic Interactive Render */}
            <DynamicProductRender
              category={product.category}
              finish={selectedFinish}
              businessName={businessName}
              logoUrl={logoPreview}
            />

            <div className="absolute bottom-4 text-center">
              <span className="text-[11px] text-zinc-500 font-mono">
                Laser-etched · 300 DPI · Factory precision
              </span>
            </div>
          </div>

          {/* Product Highlights */}
          <div className="w-full p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 space-y-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Specifications & Guarantee</h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> High-frequency NTAG213 contactless microchip
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Shipped with sealed scratch-off claim PIN
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Universal compatibility: all iPhones (XS+) & NFC Androids
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Free repointing in owner portal anytime
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Customization & Purchase Options */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                {product.category.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500">In Stock · Ships in 48h</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{product.title}</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-5">
            {/* Step 1: Business Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                1. Your Business or Brand Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                maxLength={40}
                placeholder="e.g. Bella Donna Salon / Apex Fitness"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-zinc-500">
                Appears printed directly on your hardware and sleeve packaging.
              </span>
            </div>

            {/* Step 2: Logo Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                2. Brand Logo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition">
                  Upload Logo (PNG/SVG)
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoPreview && (
                  <button
                    onClick={() => setLogoPreview(null)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>

            {/* Step 3: Material / Finish Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                3. Choose Material & Finish
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {product.finishes.map((fin) => (
                  <button
                    key={fin.id}
                    type="button"
                    onClick={() => setSelectedFinish(fin)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedFinish.id === fin.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: fin.previewColor }}
                      />
                      <span className="text-xs font-bold text-white truncate">{fin.name}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {fin.priceModifierPaise > 0
                        ? `+₹${(fin.priceModifierPaise / 100).toFixed(0)}`
                        : 'Included'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Quantity */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                4. Select Quantity
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 5, 10, 25].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      quantity === qty
                        ? 'bg-white text-zinc-950 shadow'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {qty} {qty === 1 ? 'unit' : 'units'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart Action */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 block">Total Price ({quantity} {quantity === 1 ? 'unit' : 'units'})</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  ₹{(totalPricePaise / 100).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {totalPricePaise >= 99900 ? 'Free Shipping Included' : '+ ₹79 Shipping'}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-xl transition shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              Add to Cart 🛒
            </button>
          </div>

          {isSuccessToast && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl text-center font-semibold animate-in fade-in">
              ✓ Added to cart! Check your cart drawer on the right.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DynamicProductRender({
  category,
  finish,
  businessName,
  logoUrl,
}: {
  category: string;
  finish: FinishOption;
  businessName: string;
  logoUrl: string | null;
}) {
  const isStandee = category === 'standees';
  const isCard = category === 'cards';
  const isPlaque = category === 'plaques';

  if (isStandee) {
    return (
      <div className="w-56 h-72 rounded-2xl border-4 border-zinc-700/80 bg-zinc-900/90 shadow-2xl p-5 flex flex-col items-center justify-between relative transform hover:scale-[1.02] transition">
        {/* Top brand */}
        <div className="w-full flex flex-col items-center text-center space-y-1">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-md" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black font-black flex items-center justify-center text-xs">
              {businessName.substring(0, 2).toUpperCase() || 'QS'}
            </div>
          )}
          <span className="text-xs font-black text-white tracking-wide truncate max-w-[180px]">
            {businessName || 'YOUR BUSINESS'}
          </span>
          <span className="text-[10px] text-zinc-400 tracking-wider">TAP OR SCAN TO REVIEW</span>
        </div>

        {/* Center QR & NFC Tap Zone */}
        <div className="w-24 h-24 rounded-xl bg-white p-2 shadow-inner flex flex-col items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded flex flex-col items-center justify-center text-white">
            <span className="text-lg">📶</span>
            <span className="text-[8px] font-mono font-bold tracking-tighter">NFC TAP</span>
          </div>
        </div>

        {/* Star Rating & Finish Badge */}
        <div className="w-full text-center space-y-1">
          <div className="text-amber-400 text-sm tracking-widest">★★★★★</div>
          <span className="text-[9px] text-zinc-500 font-mono uppercase">
            Finish: {finish.name}
          </span>
        </div>
      </div>
    );
  }

  if (isCard) {
    return (
      <div
        className="w-80 h-48 rounded-2xl border-2 p-6 flex flex-col justify-between shadow-2xl transform hover:scale-[1.02] transition"
        style={{
          backgroundColor: finish.previewColor,
          borderColor: finish.previewColor === '#ffffff' ? '#27272a' : '#52525b',
          color: finish.previewColor === '#ffffff' || finish.previewColor === '#d4b996' ? '#18181b' : '#f4f4f5',
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-black/20 backdrop-blur border border-white/20 flex items-center justify-center font-black text-xs">
                {businessName.substring(0, 2).toUpperCase() || 'QS'}
              </div>
            )}
            <span className="text-sm font-black tracking-tight truncate max-w-[170px]">
              {businessName || 'YOUR BRAND'}
            </span>
          </div>
          <span className="text-lg">📶</span>
        </div>

        <div className="flex justify-between items-end text-[10px] opacity-80 font-mono tracking-wider">
          <span>TAP TO CONNECT</span>
          <span>NTAG213 SMART CHIP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-52 rounded-xl bg-zinc-800 border-2 border-zinc-600 shadow-2xl p-4 flex flex-col items-center justify-between text-center">
      <div className="space-y-1">
        <span className="text-xs font-black text-white">{businessName}</span>
        <div className="text-[10px] text-emerald-400">COUNTER DISPLAY STAND</div>
      </div>
      <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center text-xl">
        📶
      </div>
      <span className="text-[10px] text-zinc-400 font-mono">FINISH: {finish.name}</span>
    </div>
  );
}
