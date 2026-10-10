'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ShopProduct, FinishOption, INITIAL_PRODUCTS, ProductReview } from '@/lib/shop-service';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import {
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ShoppingCart,
  Zap,
  ChevronRight,
  Upload,
  Globe,
  Sparkles,
  Heart,
  Plus,
  MessageSquare,
  ThumbsUp,
  X,
  Layers,
} from 'lucide-react';

export function ProductDetailClient({ product }: { product: ShopProduct }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const isDualCombo = product.slug === 'combo-review-instagram-standee';
  const isTripleCombo = product.slug === 'combo-review-upi-instagram-standee';
  const isWallPlate = product.slug === 'wall-mirror-nfc-review-plate';

  const [businessName, setBusinessName] = useState(
    searchParams.get('businessName') || 'My Business'
  );
  const [destinationUrl, setDestinationUrl] = useState(
    searchParams.get('destinationUrl') || 'https://g.page/r/your-google-place-id/review'
  );
  const [instagramHandle, setInstagramHandle] = useState(
    searchParams.get('instagram') || '@yourbusiness'
  );
  const [upiVpa, setUpiVpa] = useState(
    searchParams.get('upi') || 'business@okhdfcbank'
  );
  const [selectedFinish, setSelectedFinish] = useState<FinishOption>(
    product.finishes[0] || {
      id: 'standard',
      name: 'Standard Finish',
      priceModifierPaise: 0,
      previewColor: '#ffffff',
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Review states
  const initialReviews: ProductReview[] = product.reviews || [];

  const [reviewsList, setReviewsList] = useState<ProductReview[]>(initialReviews);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const unitPricePaise = product.basePricePaise + selectedFinish.priceModifierPaise;
  const totalPricePaise = unitPricePaise * quantity;

  // Handle Logo Upload
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

  const resolvedQrUrl = isTripleCombo
    ? `Google: ${destinationUrl.trim()} | UPI: ${upiVpa.trim()} | Instagram: ${instagramHandle.trim()}`
    : isDualCombo
    ? `Google: ${destinationUrl.trim()} | Instagram: ${instagramHandle.trim()}`
    : destinationUrl.trim();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: product.image,
      quantity,
      unitPricePaise,
      finish: selectedFinish,
      customBusinessName: businessName.trim(),
      customLogoUrl: logoPreview || undefined,
      qrUrl: resolvedQrUrl,
    });
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  // Frequently Bought Together Partner Product
  const comboPartner = INITIAL_PRODUCTS.find(
    (p) => p.id !== product.id && (p.categorySlug === 'business-cards' || p.categorySlug === 'google-review')
  ) || INITIAL_PRODUCTS[1];

  const comboTotalPaise = unitPricePaise + comboPartner.basePricePaise;
  const comboDiscountPaise = Math.round(comboTotalPaise * 0.15); // 15% bundle discount
  const comboFinalPaise = comboTotalPaise - comboDiscountPaise;

  const handleAddBundleToCart = () => {
    // Add main item
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: product.image,
      quantity: 1,
      unitPricePaise,
      finish: selectedFinish,
      customBusinessName: businessName.trim(),
      customLogoUrl: logoPreview || undefined,
      qrUrl: destinationUrl.trim(),
    });
    // Add combo partner
    addItem({
      productId: comboPartner.id,
      title: comboPartner.title,
      slug: comboPartner.slug,
      image: comboPartner.image,
      quantity: 1,
      unitPricePaise: comboPartner.basePricePaise - comboDiscountPaise,
      finish: comboPartner.finishes[0] || {
        id: 'standard',
        name: 'Standard Finish',
        priceModifierPaise: 0,
        previewColor: '#ffffff',
      },
      customBusinessName: businessName.trim(),
    });
    openCart();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Just now',
      comment: newReviewComment.trim(),
      verifiedPurchase: true,
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setIsReviewModalOpen(false);
  };

  // Related products from same category or featured
  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto">
          <Link href="/" className="hover:text-purple-600 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link href="/products" className="hover:text-purple-600 transition">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link
            href={`/products?category=${product.categorySlug}`}
            className="hover:text-purple-600 transition capitalize"
          >
            {product.categorySlug.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[200px]">
            {product.title}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Main Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ================= LEFT COLUMN: IMAGES & ARTWORK ================= */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] overflow-hidden">
              {/* Product Badge */}
              {product.badge && (
                <div className="absolute top-5 left-5 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs border shadow-xs flex items-center justify-center transition-all ${
                  isWishlisted
                    ? 'border-rose-200 text-rose-500'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                }`}
                title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Main Product Photography */}
              <div className="relative w-full max-w-md aspect-4/3 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105"
                />

                {/* Live Hardware Customization Overlay Card */}
                {isDualCombo && (
                  <div className="absolute bottom-2 inset-x-4 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-center space-y-1.5 transition-all">
                    <div className="flex items-center justify-between text-[10px] text-purple-300 font-extrabold uppercase tracking-wider">
                      <span>Laser Preview</span>
                      <span className="text-emerald-400">2-in-1 Dual QR</span>
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {businessName || 'Your Business Name'}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-amber-300">⭐ Review</span>
                        <span className="text-[8px] text-slate-300">Tap / Scan</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-pink-300">📸 Follow</span>
                        <span className="text-[8px] text-slate-300 truncate max-w-[90px]">{instagramHandle || '@handle'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {isTripleCombo && (
                  <div className="absolute bottom-2 inset-x-4 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-center space-y-1.5 transition-all">
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">
                      <span>Laser Preview</span>
                      <span className="text-cyan-400">3-in-1 Triple Action</span>
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {businessName || 'Your Business Name'}
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <div className="p-1 rounded-lg bg-white/10 border border-white/10 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-amber-300">⭐ Review</span>
                        <span className="text-[7.5px] text-slate-300">NFC+QR</span>
                      </div>
                      <div className="p-1 rounded-lg bg-white/10 border border-white/10 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-emerald-300">💸 UPI</span>
                        <span className="text-[7.5px] text-slate-300 truncate max-w-[65px]">{upiVpa}</span>
                      </div>
                      <div className="p-1 rounded-lg bg-white/10 border border-white/10 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-pink-300">📸 Social</span>
                        <span className="text-[7.5px] text-slate-300 truncate max-w-[65px]">{instagramHandle}</span>
                      </div>
                    </div>
                  </div>
                )}

                {isWallPlate && (
                  <div className="absolute bottom-2 inset-x-4 p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-800/80 text-white shadow-xl text-center space-y-1 transition-all">
                    <div className="flex items-center justify-between text-[10px] text-cyan-300 font-extrabold uppercase tracking-wider">
                      <span>Mirror & Wall Plate</span>
                      <span className="text-emerald-400">3M VHB Tape</span>
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {businessName || 'Your Business Name'}
                    </div>
                    <div className="text-[9px] text-cyan-200">
                      Sticks securely to salon mirrors, glass doors & tiles
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Hardware Chips indicator */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NTAG213 High-Frequency NFC + Laser QR Code</span>
              </div>
            </div>

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-purple-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">1-Year Warranty</h4>
                <p className="text-[11px] text-slate-500">Free replacement</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
                <Truck className="w-5 h-5 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">Pan-India Express</h4>
                <p className="text-[11px] text-slate-500">Dispatched in 24-48 hrs</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No App Required</h4>
                <p className="text-[11px] text-slate-500">Instant native popup</p>
              </div>
            </div>

            {/* Interactive Feature Helpers */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                href="/demo/tap-simulator"
                className="flex-1 py-2.5 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Try Virtual NFC Tap</span>
              </Link>
              <Link
                href="/compare"
                className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare Materials</span>
              </Link>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT INFO & CUSTOMIZER ================= */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 pt-1">
                {product.reviewCount > 0 ? (
                  <>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {product.rating} ({product.reviewCount} customer reviews)
                    </span>
                    <span className="text-slate-300">·</span>
                  </>
                ) : null}
                <span className="text-xs font-semibold text-emerald-600">In Stock</span>
              </div>

              {/* Pricing Display */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-purple-700">
                  ₹{(unitPricePaise / 100).toLocaleString('en-IN')}
                </span>
                {product.originalPricePaise && (
                  <span className="text-base text-slate-400 line-through font-medium">
                    ₹{(product.originalPricePaise / 100).toLocaleString('en-IN')}
                  </span>
                )}
                {product.originalPricePaise && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Save {Math.round(((product.originalPricePaise - unitPricePaise) / product.originalPricePaise) * 100)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Inclusive of custom laser engraving setup &amp; QC check. (No GST charged · Unregistered entity).</p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Customizer Interactive Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Customization Studio</span>
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                </h3>
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                  Live Hardware Preview
                </span>
              </div>

              {/* 1. Custom Business Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Business / Brand Name to Engrave *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Copper Chimney Bistro"
                  maxLength={40}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* 2. Destination Inputs based on Product Type */}
              {isTripleCombo ? (
                <div className="space-y-3.5 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>⭐ 1. Google Review URL *</span>
                      <span className="text-[10px] text-purple-700 font-semibold">NFC + QR</span>
                    </label>
                    <input
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="e.g. https://g.page/r/your-place-id/review"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>💸 2. UPI Payment VPA *</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">All UPI Apps</span>
                    </label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="e.g. shopname@okhdfcbank or merchant@paytm"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                    <p className="text-[10px] text-slate-500">
                      Works directly with Google Pay, PhonePe, Paytm, BHIM with zero transaction fees.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>📸 3. Instagram Handle *</span>
                      <span className="text-[10px] text-pink-700 font-semibold">Follow QR</span>
                    </label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="e.g. @yourbrandname"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              ) : isDualCombo ? (
                <div className="space-y-3.5 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>⭐ 1. Google Review URL *</span>
                      <span className="text-[10px] text-purple-700 font-semibold">NFC + QR</span>
                    </label>
                    <input
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="e.g. https://g.page/r/your-place-id/review"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>📸 2. Instagram Handle or URL *</span>
                      <span className="text-[10px] text-pink-700 font-semibold">Profile Follow</span>
                    </label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="e.g. @yourbrandname"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    NFC Tap / QR Destination URL *
                  </label>
                  <input
                    type="url"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="e.g. https://g.page/r/your-google-place-id/review"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                  {isWallPlate ? (
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-800 space-y-0.5">
                      <span className="font-bold block">✨ Mirror & Wall Mount Included</span>
                      <span>Pre-applied heavy-duty 3M VHB foam tape adheres firmly to salon mirrors, consulting doors, and glass partitions.</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      You can also repoint this URL anytime later from your owner dashboard.
                    </p>
                  )}
                </div>
              )}

              {/* 3. Finish / Material Options */}
              {product.finishes.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">
                    Select Material Finish
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {product.finishes.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFinish(f)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedFinish.id === f.id
                            ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: f.previewColor }}
                          />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {f.name}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-purple-700">
                          {f.priceModifierPaise > 0
                            ? `+₹${f.priceModifierPaise / 100}`
                            : 'Standard'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-800">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-950 text-sm font-black"
                  >
                    −
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-950 text-sm font-black"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-sm border border-purple-200 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-98"
                  >
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Buy Now · ₹{(totalPricePaise / 100).toLocaleString('en-IN')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Key Features List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Key Hardware Features
              </h3>
              <ul className="space-y-2">
                {product.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ================= FREQUENTLY BOUGHT TOGETHER BUNDLE ================= */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Frequently Bought Together</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">
                  Save 15%
                </span>
              </h2>
              <p className="text-xs text-slate-500">Pair your counter standee with a portable executive NFC card.</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Product 1 */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 w-full sm:w-72">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/60 p-1 flex items-center justify-center shrink-0">
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{product.title}</p>
                  <p className="text-xs font-extrabold text-purple-700 mt-0.5">₹{(unitPricePaise / 100).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-black text-sm">
                +
              </div>

              {/* Product 2 (Partner) */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 w-full sm:w-72">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/60 p-1 flex items-center justify-center shrink-0">
                  <img src={comboPartner.image} alt={comboPartner.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{comboPartner.title}</p>
                  <p className="text-xs font-extrabold text-purple-700 mt-0.5">₹{(comboPartner.basePricePaise / 100).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Bundle Pricing & Add Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-center sm:text-right">
                <div className="flex items-baseline gap-2 justify-center sm:justify-end">
                  <span className="text-xl font-black text-purple-700">₹{(comboFinalPaise / 100).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 line-through">₹{(comboTotalPaise / 100).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-bold">Bundle Savings: ₹{(comboDiscountPaise / 100).toLocaleString('en-IN')}</p>
              </div>

              <button
                onClick={handleAddBundleToCart}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Both to Cart</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= CUSTOMER REVIEWS SECTION ================= */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Customer Reviews</span>
                <span className="text-xs font-bold text-slate-400">({reviewsList.length})</span>
              </h2>
              {reviewsList.length > 0 ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {(reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)} out of 5
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">Verified Business Buyers</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">No reviews yet for this SKU.</p>
              )}
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition w-fit border border-purple-200"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Reviews List */}
          {reviewsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">&quot;{rev.comment}&quot;</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="font-bold text-slate-900">{rev.author}</span>
                    {rev.verifiedPurchase && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No customer reviews submitted yet. Have you purchased this product? Click &quot;Write a Review&quot; above to submit your feedback.
            </div>
          )}
        </section>

        {/* Review Modal Dialog */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Write a Review for {product.title}</h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 text-amber-400 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newReviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Review Comments *</label>
                  <textarea
                    required
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Describe how the NFC hardware or review standee performed at your store..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Related Hardware
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
