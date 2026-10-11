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
import { HardwareSpecsTable } from '@/components/shop/HardwareSpecsTable';
import { CompetitorComparison } from '@/components/shop/CompetitorComparison';
import { FulfillmentTimeline } from '@/components/shop/FulfillmentTimeline';
import { ProductPreview } from '@/components/shop/ProductPreview';
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
  const [showStickyBar, setShowStickyBar] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 420);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Frequently Bought Together Partner Product (Smart Pairing)
  const comboPartner = React.useMemo(() => {
    if (product.categorySlug === 'cards' || product.categorySlug === 'business-cards') {
      return (
        INITIAL_PRODUCTS.find((p) => p.slug === 'premium-acrylic-google-review-standee') ||
        INITIAL_PRODUCTS.find((p) => p.categorySlug === 'google-review') ||
        INITIAL_PRODUCTS[0]
      );
    }
    return (
      INITIAL_PRODUCTS.find((p) => p.slug === 'nfc-google-review-card') ||
      INITIAL_PRODUCTS.find((p) => p.slug === 'matte-black-nfc-business-card') ||
      INITIAL_PRODUCTS.find((p) => p.id !== product.id && p.categorySlug === 'cards') ||
      INITIAL_PRODUCTS[1]
    );
  }, [product]);

  const [includeMainInBundle, setIncludeMainInBundle] = useState(true);
  const [includePartnerInBundle, setIncludePartnerInBundle] = useState(true);

  const bothSelected = includeMainInBundle && includePartnerInBundle;
  const bundleRawPaise =
    (includeMainInBundle ? unitPricePaise : 0) +
    (includePartnerInBundle ? comboPartner.basePricePaise : 0);
  const bundleSavingsPaise = bothSelected ? Math.round(bundleRawPaise * 0.15) : 0;
  const bundleTotalPaise = bundleRawPaise - bundleSavingsPaise;

  const handleAddBundleToCart = () => {
    if (!includeMainInBundle && !includePartnerInBundle) return;

    if (includeMainInBundle) {
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
        qrUrl: resolvedQrUrl,
      });
    }

    if (includePartnerInBundle) {
      const partnerDiscount = bothSelected ? bundleSavingsPaise : 0;
      addItem({
        productId: comboPartner.id,
        title: comboPartner.title,
        slug: comboPartner.slug,
        image: comboPartner.image,
        quantity: 1,
        unitPricePaise: comboPartner.basePricePaise - partnerDiscount,
        finish: comboPartner.finishes[0] || {
          id: 'standard',
          name: 'Standard Finish',
          priceModifierPaise: 0,
          previewColor: '#ffffff',
        },
        customBusinessName: businessName.trim(),
      });
    }

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

  const getBadgeStyle = (badge?: string) => {
    const b = badge?.toLowerCase() || '';
    if (b === 'new') return 'bg-violet-600 text-white font-black';
    if (b.includes('dual') || b.includes('multi') || b.includes('combo')) return 'bg-[#180C38] text-violet-200 border border-violet-500/40';
    if (b.includes('pack') || b.includes('kit')) return 'bg-slate-900 text-slate-100';
    if (b.includes('steel') || b.includes('metal')) return 'bg-slate-800 text-slate-100';
    if (b.includes('bamboo') || b.includes('wood')) return 'bg-[#78350F] text-amber-50';
    return 'bg-violet-100 text-violet-800 border border-violet-200/80';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto">
          <Link href="/" className="hover:text-[#1E0E38] transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link href="/products" className="hover:text-[#1E0E38] transition">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link
            href={`/products?category=${product.categorySlug}`}
            className="hover:text-[#1E0E38] transition capitalize"
          >
            {product.categorySlug.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[200px]">
            {product.title}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
        {/* Main Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ================= LEFT COLUMN: IMAGES & ARTWORK ================= */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Interactive Hardware Preview Studio */}
            <ProductPreview
              product={product}
              businessName={businessName}
              selectedFinish={selectedFinish}
              logoUrl={logoPreview}
              destinationUrl={destinationUrl}
              instagramHandle={instagramHandle}
              upiVpa={upiVpa}
              isWishlisted={isWishlisted}
              onToggleWishlist={() => toggleWishlist(product.id)}
              badgeStyle={getBadgeStyle(product.badge)}
            />

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-violet-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">1-Year Warranty</h4>
                <p className="text-[11px] text-slate-500">Free replacement</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
                <Truck className="w-5 h-5 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">Pan-India Express</h4>
                <p className="text-[11px] text-slate-500">Dispatched in 24-48 hrs</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-5 h-5 text-violet-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No App Required</h4>
                <p className="text-[11px] text-slate-500">Instant native popup</p>
              </div>
            </div>

            {/* Interactive Feature Helpers */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                href="/demo/tap-simulator"
                className="flex-1 py-2.5 px-3 rounded-2xl bg-violet-50 hover:bg-violet-100 border border-violet-200/80 text-violet-800 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-violet-600" />
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
                <span className="text-3xl font-black text-[#1E0E38]">
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
                  <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                </h3>
                <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                />
              </div>

              {/* Brand Logo Upload Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Brand Logo for Laser Etching (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG / SVG / JPG</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-violet-500 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-violet-600" />
                    <span>{logoPreview ? 'Change Logo File' : 'Upload Vector / PNG Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => setLogoPreview(null)}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Destination Inputs based on Product Type */}
              {isTripleCombo ? (
                <div className="space-y-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>⭐ 1. Google Review URL *</span>
                      <span className="text-[10px] text-[#1E0E38] font-semibold">NFC + QR</span>
                    </label>
                    <input
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="e.g. https://g.page/r/your-place-id/review"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1E0E38]"
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1E0E38]"
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1E0E38]"
                    />
                  </div>
                </div>
              ) : isDualCombo ? (
                <div className="space-y-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>⭐ 1. Google Review URL *</span>
                      <span className="text-[10px] text-[#1E0E38] font-semibold">NFC + QR</span>
                    </label>
                    <input
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="e.g. https://g.page/r/your-place-id/review"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1E0E38]"
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
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1E0E38]"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
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
                            ? 'border-violet-600 bg-violet-50/70 shadow-xs ring-1 ring-violet-600'
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
                        <div className="text-[11px] font-semibold text-violet-700">
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

              {/* Volume Discount Table */}
              <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#F3E5AB] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Volume Discounts</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3E5AB] text-[#78350F] font-black">
                      Direct Savings
                    </span>
                  </span>
                  <Link href="/bulk-orders" className="text-[11px] font-bold text-violet-800 hover:underline">
                    Need 25+? Contact B2B →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className={`p-2 rounded-xl border transition-all ${quantity < 5 ? 'bg-white border-violet-600 shadow-2xs font-bold text-slate-900' : 'bg-transparent border-[#EADBCE] text-slate-600'}`}>
                    <p className="text-[11px] font-medium text-slate-500">1–4 Units</p>
                    <p className="text-xs font-black text-slate-900">Standard Price</p>
                  </div>
                  <div className={`p-2 rounded-xl border transition-all ${quantity >= 5 && quantity < 10 ? 'bg-white border-violet-600 shadow-2xs font-bold text-slate-900' : 'bg-transparent border-[#EADBCE] text-slate-600'}`}>
                    <p className="text-[11px] font-medium text-slate-500">5–9 Units</p>
                    <p className="text-xs font-black text-emerald-700">10% OFF</p>
                    <span className="text-[9px] font-mono text-slate-500 block">Use WELCOME10</span>
                  </div>
                  <div className={`p-2 rounded-xl border transition-all ${quantity >= 10 ? 'bg-white border-violet-600 shadow-2xs font-bold text-slate-900' : 'bg-transparent border-[#EADBCE] text-slate-600'}`}>
                    <p className="text-[11px] font-medium text-slate-500">10+ Units</p>
                    <p className="text-xs font-black text-emerald-700">20% OFF</p>
                    <span className="text-[9px] font-mono text-slate-500 block">Use BULK20</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 active:scale-98"
                  >
                    <Zap className="w-4 h-4 fill-violet-200 text-violet-200" />
                    <span>Buy Now · ₹{(totalPricePaise / 100).toLocaleString('en-IN')}</span>
                  </button>
                </div>

                {/* Reassurance Strip */}
                <div className="pt-3 grid grid-cols-3 gap-2 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <ShieldCheck className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-900 block leading-tight">1-Yr Warranty</span>
                    <span className="text-[9px] text-slate-500">Free replacement</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <Truck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-900 block leading-tight">Pan-India Express</span>
                    <span className="text-[9px] text-slate-500">Dispatched in 24–48h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <Sparkles className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-900 block leading-tight">Zero Reprinting</span>
                    <span className="text-[9px] text-slate-500">Change URL anytime</span>
                  </div>
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
                    <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
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
                {bothSelected && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">
                    Save 15% Bundle Discount
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">Pair your counter display with a portable executive card for meetings and events.</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Product 1 */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 w-full sm:w-80 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={includeMainInBundle}
                  onChange={(e) => setIncludeMainInBundle(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                />
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/60 p-1 flex items-center justify-center shrink-0">
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">This Item</span>
                  <p className="text-xs font-bold text-slate-900 truncate">{product.title}</p>
                  <p className="text-xs font-extrabold text-violet-700 mt-0.5">₹{(unitPricePaise / 100).toLocaleString('en-IN')}</p>
                </div>
              </label>

              <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 font-black text-sm">
                +
              </div>

              {/* Product 2 (Partner) */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 w-full sm:w-80 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={includePartnerInBundle}
                  onChange={(e) => setIncludePartnerInBundle(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                />
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/60 p-1 flex items-center justify-center shrink-0">
                  <img src={comboPartner.image} alt={comboPartner.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-violet-600 block">Recommended Pair</span>
                  <p className="text-xs font-bold text-slate-900 truncate">{comboPartner.title}</p>
                  <p className="text-xs font-extrabold text-violet-700 mt-0.5">₹{(comboPartner.basePricePaise / 100).toLocaleString('en-IN')}</p>
                </div>
              </label>
            </div>

            {/* Bundle Pricing & Add Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-center sm:text-right">
                <div className="flex items-baseline gap-2 justify-center sm:justify-end">
                  <span className="text-xl font-black text-violet-900">₹{(bundleTotalPaise / 100).toLocaleString('en-IN')}</span>
                  {bothSelected && (
                    <span className="text-xs text-slate-400 line-through">₹{(bundleRawPaise / 100).toLocaleString('en-IN')}</span>
                  )}
                </div>
                {bothSelected ? (
                  <p className="text-[11px] text-emerald-600 font-bold">Bundle Savings: ₹{(bundleSavingsPaise / 100).toLocaleString('en-IN')}</p>
                ) : (
                  <p className="text-[11px] text-slate-500">Select both to unlock 15% savings</p>
                )}
              </div>

              <button
                disabled={!includeMainInBundle && !includePartnerInBundle}
                onClick={handleAddBundleToCart}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {bothSelected
                    ? `Add Both to Cart · Save ₹${(bundleSavingsPaise / 100).toLocaleString('en-IN')}`
                    : 'Add Selected to Cart'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= HARDWARE SPECIFICATIONS ================= */}
        <HardwareSpecsTable product={product} />

        {/* ================= COMPETITOR CLARITY & PARITY ================= */}
        <CompetitorComparison />

        {/* ================= FULFILLMENT & CRAFTSMANSHIP ================= */}
        <FulfillmentTimeline />

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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition w-fit border border-slate-200"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#1E0E38] focus:outline-hidden"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#1E0E38] focus:outline-hidden"
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
                    className="px-4 py-2 rounded-xl bg-[#1E0E38] hover:bg-[#2B1550] text-[#FFF9F0] text-xs font-bold transition shadow-xs"
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

      {/* Sticky Bottom Add to Cart Bar */}
      {showStickyBar && (
        <aside
          aria-label="Sticky Add to Cart Bar"
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-xl transition-all animate-in slide-in-from-bottom duration-200"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0 hidden sm:flex items-center justify-center">
                <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{product.title}</h4>
                <p className="text-xs text-slate-500 truncate">
                  {selectedFinish.name} · <span className="font-black text-violet-700">₹{(unitPricePaise / 100).toLocaleString('en-IN')}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAddToCart}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition border border-slate-200"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs transition shadow-md shadow-violet-600/20 active:scale-98"
              >
                Buy Now · ₹{(totalPricePaise / 100).toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </aside>
      )}

      <Footer />
    </div>
  );
}
