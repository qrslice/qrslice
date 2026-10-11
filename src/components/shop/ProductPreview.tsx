import React from 'react';
import { ShopProduct, FinishOption, getProductCustomizationZones } from '@/lib/shop-service';
import { Heart, Sparkles, QrCode, Star, Smartphone, ShieldCheck } from 'lucide-react';

interface ProductPreviewProps {
  product: ShopProduct;
  businessName: string;
  selectedFinish: FinishOption;
  logoUrl?: string | null;
  destinationUrl?: string;
  instagramHandle?: string;
  upiVpa?: string;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  badgeStyle?: string;
  className?: string;
}

export function ProductPreview({
  product,
  businessName,
  selectedFinish,
  logoUrl,
  destinationUrl = 'https://g.page/r/your-google-place-id/review',
  instagramHandle = '@yourbusiness',
  upiVpa = 'business@okhdfcbank',
  isWishlisted,
  onToggleWishlist,
  badgeStyle = 'bg-violet-600 text-white',
  className = '',
}: ProductPreviewProps) {
  const zones = getProductCustomizationZones(product);
  const isDualCombo = product.slug === 'combo-review-instagram-standee';
  const isTripleCombo = product.slug === 'combo-review-upi-instagram-standee';
  const isWallPlate = product.slug === 'wall-mirror-nfc-review-plate';

  const cleanBusinessName = businessName.trim() || 'Your Business Name';

  // Dynamic font sizing based on character length
  const getDynamicFontSize = (text: string) => {
    if (text.length > 30) return 'text-[10px] sm:text-[11px] leading-tight';
    if (text.length > 20) return 'text-xs sm:text-sm leading-tight';
    return 'text-sm sm:text-base leading-snug';
  };

  // Finish tint styling
  const isDarkFinish =
    selectedFinish.id.includes('black') ||
    selectedFinish.previewColor.toLowerCase() === '#18181b';
  const isFrostedFinish =
    selectedFinish.id.includes('frosted') ||
    selectedFinish.name.toLowerCase().includes('frosted');

  return (
    <div
      className={`relative rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-xs flex flex-col items-center justify-between min-h-[420px] sm:min-h-[500px] overflow-hidden transition-all ${className}`}
    >
      {/* Top Bar: Badge & Live Indicator & Wishlist */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {product.badge && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${badgeStyle}`}
            >
              {product.badge}
            </span>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200/80 text-[10px] font-bold text-violet-800">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
            <span>Interactive Studio</span>
          </span>
        </div>

        {onToggleWishlist && (
          <button
            onClick={onToggleWishlist}
            className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs border shadow-xs flex items-center justify-center transition-all ${
              isWishlisted
                ? 'border-rose-200 text-rose-500'
                : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
            }`}
            title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
            aria-label="Wishlist toggle"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full max-w-md aspect-4/3 my-auto flex items-center justify-center">
        {/* Base Product Photography */}
        <img
          src={product.image}
          alt={product.title}
          className={`max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300 ${
            isDarkFinish ? 'brightness-95 contrast-105' : ''
          } ${isFrostedFinish ? 'opacity-95' : ''}`}
        />

        {/* Finish Sheen Indicator overlay */}
        {isDarkFinish && (
          <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/25 pointer-events-none rounded-2xl" />
        )}
        {isFrostedFinish && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] pointer-events-none rounded-2xl" />
        )}

        {/* Live Laser Customization Overlay Card */}
        <div className="absolute bottom-1 inset-x-2 sm:inset-x-4 p-3.5 rounded-2xl bg-[#0F0728]/95 backdrop-blur-md border border-[#261447] text-white shadow-xl text-center space-y-2 transition-all">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-violet-300 border-b border-[#261447]/80 pb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Laser Engraving Preview</span>
            </span>
            <span className="text-[9px] text-violet-300/80 font-normal">
              {selectedFinish.name}
            </span>
          </div>

          {/* Logo & Business Name in Laser Inset Style */}
          <div className="space-y-1.5 py-0.5">
            {logoUrl && (
              <div className="flex items-center justify-center">
                <div className="max-h-9 max-w-28 p-1 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Custom Brand Logo"
                    className="max-h-7 max-w-full object-contain filter brightness-110 drop-shadow-xs"
                  />
                </div>
              </div>
            )}

            <div
              className={`font-black uppercase tracking-wider text-violet-200 drop-shadow-sm ${getDynamicFontSize(
                cleanBusinessName
              )}`}
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {cleanBusinessName}
            </div>
          </div>

          {/* Action Modules */}
          {isTripleCombo ? (
            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#261447]/80">
              <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-800/60 flex flex-col items-center">
                <span className="text-[9px] font-bold text-amber-300">⭐ Review</span>
                <span className="text-[7.5px] text-violet-200/80">NFC + QR</span>
              </div>
              <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-800/60 flex flex-col items-center">
                <span className="text-[9px] font-bold text-emerald-300">💸 UPI</span>
                <span className="text-[7.5px] text-violet-200/80 truncate max-w-[65px]">
                  {upiVpa || 'UPI VPA'}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-800/60 flex flex-col items-center">
                <span className="text-[9px] font-bold text-pink-300">📸 Social</span>
                <span className="text-[7.5px] text-violet-200/80 truncate max-w-[65px]">
                  {instagramHandle || '@handle'}
                </span>
              </div>
            </div>
          ) : isDualCombo ? (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#261447]/80">
              <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-800/60 flex flex-col items-center">
                <span className="text-[10px] font-bold text-amber-300">⭐ Review</span>
                <span className="text-[8px] text-violet-200/80">Contactless Tap / Scan</span>
              </div>
              <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-800/60 flex flex-col items-center">
                <span className="text-[10px] font-bold text-pink-300">📸 Follow</span>
                <span className="text-[8px] text-violet-200/80 truncate max-w-[90px]">
                  {instagramHandle || '@handle'}
                </span>
              </div>
            </div>
          ) : isWallPlate ? (
            <div className="p-1 rounded-lg bg-violet-950/70 border border-violet-800/60 text-[9px] text-violet-200">
              High-Bond 3M VHB Foam Tape Pre-applied for Salon Mirror / Glass Partition Mount
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 pt-1 border-t border-[#261447]/80 text-[9px] text-violet-200/80">
              <span className="flex items-center gap-1 font-semibold">
                <Smartphone className="w-3 h-3 text-violet-400" />
                <span>NFC Contactless Tap</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold">
                <QrCode className="w-3 h-3 text-violet-400" />
                <span>300+ DPI Laser QR</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Verified Hardware Chips Footer Pill */}
      <div className="w-full mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>NXP NTAG213 High-Frequency NFC Core</span>
        </span>
        <span className="text-[10px] text-slate-400 italic">
          Engraving simulation only
        </span>
      </div>
    </div>
  );
}
