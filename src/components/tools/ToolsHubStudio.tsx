'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  formatUpiUri,
  formatWifiUri,
  formatVCardUri,
  formatGoogleReviewUri,
  generateQrDataUrl,
  generateQrSvgString,
} from '@/lib/qr-generator';
import {
  Globe,
  Star,
  CreditCard,
  Wifi,
  User,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Palette,
  LayoutTemplate,
  Sliders,
  Share2,
} from 'lucide-react';

type ToolTab = 'url' | 'review' | 'upi' | 'wifi' | 'vcard';

interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Pitch Black', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Midnight Violet', fg: '#0F0728', bg: '#FFFFFF' },
  { name: 'Royal Violet', fg: '#7C3AED', bg: '#FFFFFF' },
  { name: 'Emerald Retail', fg: '#064E3B', bg: '#FFFFFF' },
  { name: 'Navy Slate', fg: '#0F172A', bg: '#FFFFFF' },
];

// Helper to calculate contrast ratio for QR scannability score
function calculateContrast(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 21;
  }
}

export function ToolsHubStudio() {
  const [activeTab, setActiveTab] = useState<ToolTab>('url');

  // Input states
  // 1. URL
  const [urlInput, setUrlInput] = useState('https://qrslice.com');
  // 2. Google Review
  const [businessName, setBusinessName] = useState('Copper Chimney Bistro');
  const [reviewInput, setReviewInput] = useState('https://g.page/r/example-review/review');
  // 3. UPI
  const [upiVpa, setUpiVpa] = useState('merchant@okhdfcbank');
  const [upiName, setUpiName] = useState('Copper Chimney');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiNote, setUpiNote] = useState('Bill Payment');
  // 4. WiFi
  const [wifiSsid, setWifiSsid] = useState('Cafe_Guest_WiFi');
  const [wifiPass, setWifiPass] = useState('coffee123');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  // 5. vCard
  const [vcardFirst, setVcardFirst] = useState('Rohit');
  const [vcardLast, setVcardLast] = useState('Sharma');
  const [vcardOrg, setVcardOrg] = useState('Studio Design Co.');
  const [vcardTitle, setVcardTitle] = useState('Founder & Director');
  const [vcardPhone, setVcardPhone] = useState('+91 98765 43210');
  const [vcardEmail, setVcardEmail] = useState('rohit@studiodesign.in');
  const [vcardWeb, setVcardWeb] = useState('https://studiodesign.in');

  // Visual Customization Properties
  const [fgColor, setFgColor] = useState('#0F0728');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [frameStyle, setFrameStyle] = useState<'none' | 'bottom-bar' | 'top-ribbon' | 'card'>('bottom-bar');
  const [frameCaption, setFrameCaption] = useState('SCAN WITH CAMERA');
  const [includeCenterIcon, setIncludeCenterIcon] = useState(true);

  // Output states
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute final QR payload
  const currentPayload = useMemo(() => {
    switch (activeTab) {
      case 'url':
        return urlInput.trim() || 'https://qrslice.com';
      case 'review':
        return formatGoogleReviewUri(reviewInput.trim() || 'https://g.page/r/example-review/review');
      case 'upi':
        return formatUpiUri({
          vpa: upiVpa.trim() || 'merchant@upi',
          name: upiName.trim() || 'Merchant',
          amount: upiAmount.trim(),
          note: upiNote.trim(),
        });
      case 'wifi':
        return formatWifiUri({
          ssid: wifiSsid.trim() || 'WiFi_Network',
          password: wifiPass,
          encryption: wifiEnc,
          hidden: wifiHidden,
        });
      case 'vcard':
        return formatVCardUri({
          firstName: vcardFirst.trim() || 'Contact',
          lastName: vcardLast.trim(),
          organization: vcardOrg.trim(),
          title: vcardTitle.trim(),
          phone: vcardPhone.trim(),
          email: vcardEmail.trim(),
          url: vcardWeb.trim(),
        });
      default:
        return 'https://qrslice.com';
    }
  }, [
    activeTab,
    urlInput,
    reviewInput,
    upiVpa,
    upiName,
    upiAmount,
    upiNote,
    wifiSsid,
    wifiPass,
    wifiEnc,
    wifiHidden,
    vcardFirst,
    vcardLast,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardWeb,
  ]);

  // Update default frame caption whenever active tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'url':
        setFrameCaption('VISIT WEBSITE');
        break;
      case 'review':
        setFrameCaption('REVIEW US ON GOOGLE');
        break;
      case 'upi':
        setFrameCaption('SCAN & PAY VIA UPI');
        break;
      case 'wifi':
        setFrameCaption('CONNECT TO GUEST WIFI');
        break;
      case 'vcard':
        setFrameCaption('SAVE CONTACT CARD');
        break;
    }
  }, [activeTab]);

  // Generate QR code whenever payload or styling changes
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const generate = async () => {
      try {
        const [dataUrl, svg] = await Promise.all([
          generateQrDataUrl(currentPayload, {
            foregroundColor: fgColor,
            backgroundColor: bgColor,
            margin: 2,
            width: 800,
            errorCorrectionLevel: includeCenterIcon ? 'H' : 'M',
          }),
          generateQrSvgString(currentPayload, {
            foregroundColor: fgColor,
            backgroundColor: bgColor,
            margin: 2,
            width: 800,
            errorCorrectionLevel: includeCenterIcon ? 'H' : 'M',
          }),
        ]);

        if (isMounted) {
          setQrDataUrl(dataUrl);
          setQrSvgString(svg);
          setIsGenerating(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    const timeout = setTimeout(generate, 60);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [currentPayload, fgColor, bgColor, includeCenterIcon]);

  // Scannability score
  const contrastRatio = useMemo(() => calculateContrast(fgColor, bgColor), [fgColor, bgColor]);
  const isHighScannability = contrastRatio >= 7.0;
  const isMediumScannability = contrastRatio >= 4.0 && contrastRatio < 7.0;

  // Matching hardware pairing metadata
  const hardwarePairing = useMemo(() => {
    switch (activeTab) {
      case 'review':
        return {
          slug: 'acrylic-google-review-standee',
          title: 'Acrylic Google Review Standee',
          price: '₹699',
          image: '/products/google-review-standee.png',
          paramUrl: currentPayload,
          paramName: businessName,
          badge: 'NFC + QR Dual Tap',
        };
      case 'upi':
        return {
          slug: 'dual-qr-countertop-upi-standee',
          title: 'Dual-Action UPI + Review Standee',
          price: '₹799',
          image: '/products/dual-standee.png',
          paramUrl: currentPayload,
          paramName: upiName,
          badge: 'Zero Monthly Fees',
        };
      case 'vcard':
        return {
          slug: 'matte-black-metal-nfc-card',
          title: 'Matte Black Metal NFC Card',
          price: '₹999',
          image: '/products/metal-business-card.png',
          paramUrl: vcardWeb || currentPayload,
          paramName: `${vcardFirst} ${vcardLast}`.trim(),
          badge: 'Laser Engraved Steel',
        };
      case 'wifi':
        return {
          slug: 'bamboo-wood-nfc-review-standee',
          title: 'Solid Bamboo Tabletop Block',
          price: '₹749',
          image: '/products/bamboo-standee.png',
          paramUrl: currentPayload,
          paramName: wifiSsid,
          badge: 'Natural Oil Finish',
        };
      case 'url':
      default:
        return {
          slug: 'acrylic-google-review-standee',
          title: 'Optical Cast Acrylic QR Standee',
          price: '₹699',
          image: '/products/google-review-standee.png',
          paramUrl: currentPayload,
          paramName: 'My Store',
          badge: 'Shatterproof 4mm',
        };
    }
  }, [activeTab, currentPayload, businessName, upiName, vcardFirst, vcardLast, vcardWeb, wifiSsid]);

  // Download PNG Handler
  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrslice-${activeTab}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download SVG Handler
  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrslice-${activeTab}-qrcode.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy SVG Handler
  const handleCopySvg = async () => {
    if (!qrSvgString) return;
    try {
      await navigator.clipboard.writeText(qrSvgString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-violet-950/5 overflow-hidden">
      {/* Studio Header Bar */}
      <div className="bg-[#0F0728] text-white p-5 sm:p-6 border-b border-[#261447] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-violet-300">
              Interactive QR Studio · Live Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Generate, Style & Export Instant High-Res QR Codes
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-violet-950/80 border border-violet-800/80 text-xs text-violet-200 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Free · No Expiry</span>
          </div>
        </div>
      </div>

      {/* Tool Category Tabs */}
      <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 sm:px-6 pt-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'url', label: 'Website URL', icon: Globe },
          { id: 'review', label: 'Google Review', icon: Star },
          { id: 'upi', label: 'UPI Payment', icon: CreditCard },
          { id: 'wifi', label: 'WiFi Network', icon: Wifi },
          { id: 'vcard', label: 'Contact (vCard)', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ToolTab)}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border-t border-x -mb-[1px] ${
                isActive
                  ? 'bg-white text-violet-700 border-slate-200/90 shadow-2xs z-10'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Studio Workspace: 2-Column Split */}
      <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: CONFIGURATION INPUTS & STYLING ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Inputs Based on Active Tab */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Step 1: Enter QR Content</span>
              <span className="text-[10px] text-slate-400 font-normal">({activeTab.toUpperCase()})</span>
            </h3>

            {/* TAB: URL */}
            {activeTab === 'url' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Website or Landing Page URL *
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
                <p className="text-[11px] text-slate-500">
                  Universal link: works with websites, digital menus, link-in-bio trees, and PDF brochures.
                </p>
              </div>
            )}

            {/* TAB: GOOGLE REVIEW */}
            {activeTab === 'review' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Copper Chimney Bistro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Google Review URL or Place ID *
                  </label>
                  <input
                    type="text"
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                    placeholder="https://g.page/r/example-review/review or Place ID"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                  />
                  <p className="text-[11px] text-slate-500">
                    Paste your Google Review link from Google Business Profile or your Place ID.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: UPI PAYMENT */}
            {activeTab === 'upi' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      UPI Virtual Payment Address (VPA) *
                    </label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="merchant@okhdfcbank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Payee / Business Name *
                    </label>
                    <input
                      type="text"
                      value={upiName}
                      onChange={(e) => setUpiName(e.target.value)}
                      placeholder="Copper Chimney"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Fixed Amount (₹ Optional)
                    </label>
                    <input
                      type="number"
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(e.target.value)}
                      placeholder="Leave blank for customer input"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Transaction Note
                    </label>
                    <input
                      type="text"
                      value={upiNote}
                      onChange={(e) => setUpiNote(e.target.value)}
                      placeholder="Bill Payment"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  ✓ 100% NPCI Compliant · Works with Google Pay, PhonePe, Paytm, BHIM with zero MDR.
                </p>
              </div>
            )}

            {/* TAB: WIFI */}
            {activeTab === 'wifi' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      WiFi Network Name (SSID) *
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="Cafe_Guest_WiFi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      WiFi Password
                    </label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="text-xs font-bold text-slate-700">Security:</label>
                  {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                    <label key={enc} className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="wifiEnc"
                        checked={wifiEnc === enc}
                        onChange={() => setWifiEnc(enc)}
                        className="text-violet-600 focus:ring-violet-500"
                      />
                      <span>{enc === 'nopass' ? 'Open (No password)' : enc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: VCARD */}
            {activeTab === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">First Name *</label>
                    <input
                      type="text"
                      value={vcardFirst}
                      onChange={(e) => setVcardFirst(e.target.value)}
                      placeholder="Rohit"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">Last Name</label>
                    <input
                      type="text"
                      value={vcardLast}
                      onChange={(e) => setVcardLast(e.target.value)}
                      placeholder="Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">Company / Studio</label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      placeholder="Studio Design Co."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">Job Title</label>
                    <input
                      type="text"
                      value={vcardTitle}
                      onChange={(e) => setVcardTitle(e.target.value)}
                      placeholder="Director"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">Phone Number</label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">Email Address</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      placeholder="rohit@studiodesign.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Customization & Styling Section */}
          <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Step 2: Colors & Framing</span>
            </h3>

            {/* Color Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Brand Palette Presets
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                      fgColor === preset.fg
                        ? 'border-violet-600 bg-violet-50 text-violet-800 ring-1 ring-violet-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hex Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Frame Styles */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">Frame Style</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'bottom-bar', label: 'Bottom Bar' },
                  { id: 'top-ribbon', label: 'Top Banner' },
                  { id: 'card', label: 'Surround' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrameStyle(f.id as any)}
                    className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                      frameStyle === f.id
                        ? 'border-violet-600 bg-violet-50 text-violet-800 ring-1 ring-violet-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Caption */}
            {frameStyle !== 'none' && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-800 block">Frame Call-to-Action Text</label>
                <input
                  type="text"
                  value={frameCaption}
                  onChange={(e) => setFrameCaption(e.target.value.toUpperCase())}
                  maxLength={30}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-violet-600"
                />
              </div>
            )}

            {/* Center Icon Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Center Branding Icon</span>
                <span className="text-[11px] text-slate-400">Embed category symbol in center with High Error Correction</span>
              </div>
              <input
                type="checkbox"
                checked={includeCenterIcon}
                onChange={(e) => setIncludeCenterIcon(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LIVE CANVAS PREVIEW & EXPORT ================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 space-y-5 flex flex-col items-center">
            {/* Scannability Rating Meter */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Scannability Meter</span>
              <div className="flex items-center gap-1.5">
                {isHighScannability ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Guaranteed Scannable</span>
                  </span>
                ) : isMediumScannability ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Acceptable Contrast</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Low Contrast (Poor Scan)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Live Framed Canvas Container */}
            <div
              className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xl flex flex-col items-center justify-center max-w-[320px] w-full border ${
                frameStyle === 'card'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-white text-slate-900 border-slate-200/90'
              }`}
            >
              {/* Top Banner Frame */}
              {frameStyle === 'top-ribbon' && frameCaption && (
                <div className="w-full text-center pb-3 border-b border-slate-100 mb-2">
                  <span className="text-xs font-black tracking-wider uppercase text-violet-700">
                    {frameCaption}
                  </span>
                </div>
              )}

              {/* QR Image Graphic with Optional Center Icon */}
              <div className="relative w-56 h-56 rounded-2xl overflow-hidden flex items-center justify-center p-2 bg-white">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Generated QR Code for ${activeTab}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
                )}

                {/* Central Icon Overlay */}
                {includeCenterIcon && (
                  <div
                    className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center p-1.5"
                    style={{ pointerEvents: 'none' }}
                  >
                    {activeTab === 'url' && <Globe className="w-5 h-5 text-violet-600" />}
                    {activeTab === 'review' && <Star className="w-5 h-5 fill-amber-400 text-amber-500" />}
                    {activeTab === 'upi' && <span className="font-black text-sm text-emerald-600">₹</span>}
                    {activeTab === 'wifi' && <Wifi className="w-5 h-5 text-blue-600" />}
                    {activeTab === 'vcard' && <User className="w-5 h-5 text-purple-600" />}
                  </div>
                )}
              </div>

              {/* Bottom Bar Frame */}
              {frameStyle === 'bottom-bar' && frameCaption && (
                <div className="w-full mt-3 pt-2 text-center border-t border-slate-100">
                  <span className="text-xs font-black tracking-wider uppercase text-violet-800 block">
                    {frameCaption}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono tracking-tight">
                    POWERED BY QRSLICE
                  </span>
                </div>
              )}

              {frameStyle === 'card' && frameCaption && (
                <div className="w-full mt-3 text-center">
                  <span className="text-xs font-black tracking-wider uppercase text-white block">
                    {frameCaption}
                  </span>
                </div>
              )}
            </div>

            {/* Download & Copy Buttons */}
            <div className="w-full space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-violet-500/20 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Vector SVG</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopySvg}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">SVG Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Raw SVG Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Physical Hardware Handoff Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-950 to-[#0F0728] border border-violet-800/60 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-black text-violet-300 px-2.5 py-0.5 rounded-full bg-violet-900/60 border border-violet-700/60">
                {hardwarePairing.badge}
              </span>
              <span className="text-xs font-black text-violet-200">
                {hardwarePairing.price}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 p-1 border border-white/20 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={hardwarePairing.image}
                  alt={hardwarePairing.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {hardwarePairing.title}
                </h4>
                <p className="text-[11px] text-violet-300 leading-snug">
                  Precision laser-etched with your generated QR + embedded NTAG213 NFC chip.
                </p>
              </div>
            </div>

            <Link
              href={`/products/${hardwarePairing.slug}?destinationUrl=${encodeURIComponent(
                hardwarePairing.paramUrl
              )}&businessName=${encodeURIComponent(hardwarePairing.paramName)}`}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 active:scale-95"
            >
              <span>Order on Physical Hardware</span>
              <ArrowRight className="w-4 h-4 text-violet-200" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
