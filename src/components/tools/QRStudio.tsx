'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { generateQrDataUrl, generateQrSvgString } from '@/lib/qr-generator';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Zap,
  Eye,
  Sliders,
  Layers,
  LayoutTemplate,
  Monitor,
  Maximize2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Undo2,
  Redo2,
  Grid,
  CheckCircle2,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  Wand2,
  Type,
  Square,
  Circle,
  Award,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface QRStudioProps {
  initialPayload: string;
  defaultFrameText?: string;
  suggestedProductSlug: string;
  suggestedProductTitle: string;
  suggestedProductPricePaise: number;
  suggestedProductImage: string;
  businessName?: string;
  children?: React.ReactNode;
}

// Helper to calculate contrast ratio for QR scannability score
function calculateContrast(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
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

export function QRStudio({
  initialPayload,
  defaultFrameText = 'SCAN WITH ANY CAMERA',
  suggestedProductSlug,
  suggestedProductTitle,
  suggestedProductPricePaise,
  suggestedProductImage,
  businessName = 'My Business',
  children,
}: QRStudioProps) {
  // State
  const [payload, setPayload] = useState(initialPayload);
  const [activeTab, setActiveTab] = useState<'templates' | 'content' | 'frame' | 'colors' | 'eye' | 'logo'>('content');
  const [mockupView, setMockupView] = useState<'canvas' | 'standee' | 'metal-card' | 'pvc-card' | 'wood-block'>('canvas');
  const [designTitle, setDesignTitle] = useState('Untitled QR Artwork');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showPrintGuides, setShowPrintGuides] = useState<boolean>(false);
  const [showSpecSheet, setShowSpecSheet] = useState<boolean>(false);
  const [tilt3DEnabled, setTilt3DEnabled] = useState<boolean>(true);
  const [tiltRotation, setTiltRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Visual Customization Properties
  const [fgColor, setFgColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [frameText, setFrameText] = useState(defaultFrameText);
  const [frameSubtext, setFrameSubtext] = useState('Camera scan or NFC tap · Instant');
  const [frameStyle, setFrameStyle] = useState<'badge-top' | 'bar-bottom' | 'speech' | 'polaroid' | 'plaque' | 'none'>('badge-top');
  const [fontFamily, setFontFamily] = useState<'sans' | 'display' | 'serif' | 'mono'>('sans');
  const [cornerStyle, setCornerStyle] = useState<'square' | 'rounded' | 'circle'>('rounded');
  const [selectedIcon, setSelectedIcon] = useState<'none' | 'google' | 'upi' | 'wifi' | 'instagram' | 'youtube' | 'x' | 'star' | 'custom'>('none');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [logoBadgeShape, setLogoBadgeShape] = useState<'square' | 'circle' | 'none'>('square');
  const [logoSize, setLogoSize] = useState<number>(36);

  // Generated QR output & async state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stage container reference for 3D tilt tracking
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPayload(initialPayload);
  }, [initialPayload]);

  // GSAP animation on mockup stage switch
  useGSAP(() => {
    gsap.fromTo(
      '.stage-mockup-wrapper',
      { opacity: 0, scale: 0.94, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.5)' }
    );
  }, [mockupView]);

  // GSAP animation on inspector tab switch
  useGSAP(() => {
    gsap.fromTo(
      '.inspector-tab-panel',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, [activeTab]);

  // Generate high-resolution QR output
  useEffect(() => {
    if (!payload) return;
    let isCancelled = false;
    setIsGenerating(true);

    generateQrDataUrl(payload, {
      foregroundColor: fgColor,
      backgroundColor: bgColor,
      errorCorrectionLevel: selectedIcon !== 'none' || customLogo ? 'H' : 'M',
      width: 1200,
      margin: 2,
    })
      .then((url) => {
        if (!isCancelled) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating QR:', err);
        setIsGenerating(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [payload, fgColor, bgColor, selectedIcon, customLogo]);

  // Handle 3D Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt3DEnabled || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;
    setTiltRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setTiltRotation({ x: 0, y: 0 });
  };

  // Contrast & ISO scan score
  const contrastRatio = calculateContrast(fgColor, bgColor);
  const isHighContrast = contrastRatio >= 4.5;

  // Curated Pro Design Templates
  const proTemplates = [
    {
      id: 'onyx-executive',
      name: 'Onyx Executive',
      desc: 'Deep slate minimal',
      fg: '#0F172A',
      bg: '#FFFFFF',
      frame: 'badge-top',
      corner: 'rounded',
      font: 'sans',
    },
    {
      id: 'qrslice-violet',
      name: 'QrSlice Royal',
      desc: 'Signature electric violet',
      fg: '#7C3AED',
      bg: '#FAF5FF',
      frame: 'bar-bottom',
      corner: 'rounded',
      font: 'display',
    },
    {
      id: 'google-champion',
      name: 'Google Local',
      desc: 'High-trust Maps blue',
      fg: '#1A73E8',
      bg: '#FFFFFF',
      frame: 'badge-top',
      corner: 'square',
      icon: 'google',
      font: 'sans',
    },
    {
      id: 'upi-merchant',
      name: 'UPI Merchant Pro',
      desc: 'NPCI payment emerald',
      fg: '#059669',
      bg: '#FFFFFF',
      frame: 'badge-top',
      corner: 'rounded',
      icon: 'upi',
      font: 'display',
    },
    {
      id: 'luxury-amber',
      name: 'Luxury Amber Gold',
      desc: 'Warm ivory & bronze',
      fg: '#B45309',
      bg: '#FFFDF7',
      frame: 'polaroid',
      corner: 'circle',
      font: 'serif',
    },
    {
      id: 'cyber-dark',
      name: 'Cyber Obsidian',
      desc: 'Neon dark mode',
      fg: '#A855F7',
      bg: '#09090B',
      frame: 'plaque',
      corner: 'circle',
      font: 'mono',
    },
    {
      id: 'speech-crimson',
      name: 'Crimson Alert',
      desc: 'High visibility callout',
      fg: '#DC2626',
      bg: '#FFFFFF',
      frame: 'speech',
      corner: 'rounded',
      font: 'display',
    },
    {
      id: 'minimal-chic',
      name: 'Minimal Clean',
      desc: 'Frameless pure QR',
      fg: '#18181B',
      bg: '#FFFFFF',
      frame: 'none',
      corner: 'rounded',
      font: 'sans',
    },
  ];

  const applyTemplate = (tpl: (typeof proTemplates)[0]) => {
    setFgColor(tpl.fg);
    setBgColor(tpl.bg);
    setFrameStyle(tpl.frame as any);
    setCornerStyle(tpl.corner as any);
    setFontFamily(tpl.font as any);
    if (tpl.icon) setSelectedIcon(tpl.icon as any);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QRslice_${(designTitle || 'qr_design').toLowerCase().replace(/\s+/g, '_')}_1200px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = async () => {
    if (!payload) return;
    const svgStr = await generateQrSvgString(payload, {
      foregroundColor: fgColor,
      backgroundColor: bgColor,
      errorCorrectionLevel: selectedIcon !== 'none' || customLogo ? 'H' : 'M',
      width: 800,
    });

    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QRslice_${(designTitle || 'qr_design').toLowerCase().replace(/\s+/g, '_')}_vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogo(reader.result as string);
        setSelectedIcon('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const colorPresets = [
    { name: 'Onyx Black', hex: '#0F172A' },
    { name: 'Royal Purple', hex: '#7C3AED' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Crimson Red', hex: '#DC2626' },
    { name: 'Amber Gold', hex: '#D97706' },
    { name: 'Slate Gray', hex: '#475569' },
    { name: 'Rose Pink', hex: '#E11D48' },
  ];

  return (
    <div className="space-y-6">
      {/* ================= STUDIO TOP CONTROL BAR (CANVA / FIGMA STYLE) ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Project Title & Live Artboard Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={designTitle}
                  onChange={(e) => setDesignTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  autoFocus
                  className="text-sm font-black text-slate-900 border-b border-purple-600 focus:outline-hidden px-1"
                />
              ) : (
                <span
                  onClick={() => setIsEditingTitle(true)}
                  className="text-sm font-black text-slate-900 cursor-pointer hover:text-purple-700 transition flex items-center gap-1.5"
                  title="Click to rename design"
                >
                  <span>{designTitle}</span>
                  <span className="text-[10px] text-slate-400 font-normal">✎</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Studio Canvas</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Vector Equivalent · 300 DPI Print Spec · ISO/IEC 18004 Standard
            </p>
          </div>
        </div>

        {/* Studio Canvas Quick Toolbar (Zoom, Contrast, Guides) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold font-mono px-1.5 text-slate-700">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white transition"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Safe Margins / Print Guides Toggle */}
          <button
            type="button"
            onClick={() => setShowPrintGuides(!showPrintGuides)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              showPrintGuides
                ? 'bg-purple-50 text-purple-700 border-purple-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle print safe margins and cut guides"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Print Guides</span>
          </button>

          {/* Scan Contrast Quality Badge */}
          <div
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              isHighContrast
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={`Calculated Contrast Ratio: ${contrastRatio.toFixed(1)}:1 (Min 4.5:1 recommended)`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isHighContrast ? 'Scan: 100% Pass' : 'Low Contrast Alert'}</span>
          </div>

          {/* Print Spec Sheet Info Modal Toggle */}
          <button
            type="button"
            onClick={() => setShowSpecSheet(!showSpecSheet)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="View Print Specifications & Scan Distance Chart"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Print Spec Sheet Drawer if toggled */}
      {showSpecSheet && (
        <div className="bg-purple-900 text-white rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between border-b border-purple-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider">Industrial Print & Scan Specifications</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowSpecSheet(false)}
              className="text-xs text-purple-300 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-purple-950/60 p-3.5 rounded-2xl border border-purple-800/60">
              <p className="font-bold text-amber-300">Min Physical Print Size</p>
              <p className="text-purple-200 mt-1">2.5 cm × 2.5 cm (Countertop standees recommended 8 cm × 8 cm for 2-meter scan range).</p>
            </div>
            <div className="bg-purple-950/60 p-3.5 rounded-2xl border border-purple-800/60">
              <p className="font-bold text-emerald-300">Resolution & Sizing</p>
              <p className="text-purple-200 mt-1">PNG export is 1200 × 1200 px (300 DPI). Vector SVG has infinite scale with zero raster pixelation.</p>
            </div>
            <div className="bg-purple-950/60 p-3.5 rounded-2xl border border-purple-800/60">
              <p className="font-bold text-cyan-300">Hardware Integration</p>
              <p className="text-purple-200 mt-1">NFC chips (NTAG213) trigger contactless taps up to 4 cm. QR serves as universal camera fallback.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN STUDIO WORKBENCH (LEFT INSPECTOR + RIGHT STAGE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: VISUAL DESIGN INSPECTOR ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-x-auto">
            {[
              { id: 'templates', label: 'Templates', icon: Sparkles },
              { id: 'content', label: '1. Content', icon: Sliders },
              { id: 'frame', label: '2. Frames & Text', icon: LayoutTemplate },
              { id: 'colors', label: '3. Colors', icon: Palette },
              { id: 'eye', label: '4. QR Style', icon: Square },
              { id: 'logo', label: '5. Logo', icon: ImageIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ================= TAB 0: 1-CLICK PRO THEMES ================= */}
          {activeTab === 'templates' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5 animate-in fade-in-50">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Instant 1-Click Design Presets</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any curated theme to instantly re-style colors, frames, and typography.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {proTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition text-left bg-slate-50/50 hover:bg-white group"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: tpl.fg }} />
                      <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: tpl.bg }} />
                    </div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition">{tpl.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 1: CONTENT PAYLOAD ================= */}
          {activeTab === 'content' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5 animate-in fade-in-50">
              {children}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('frame')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next: Customize Frames & Badges</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: FRAMES, BADGES & TYPOGRAPHY ================= */}
          {activeTab === 'frame' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6 animate-in fade-in-50">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-purple-600" />
                  <span>Visual Frame Shapes</span>
                </h3>
              </div>

              {/* Frame Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'badge-top', name: 'Top Header Pill', desc: 'Prominent header banner' },
                  { id: 'bar-bottom', name: 'Bottom Ribbon', desc: 'Sleek footer badge' },
                  { id: 'speech', name: 'Speech Bubble', desc: 'Callout with pointer arrow' },
                  { id: 'polaroid', name: 'Polaroid Card', desc: 'Clean photo print frame' },
                  { id: 'plaque', name: 'Countertop Plaque', desc: 'Hardware plaque border' },
                  { id: 'none', name: 'Clean / Frameless', desc: 'Pure QR code matrix' },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFrameStyle(style.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      frameStyle === style.id
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{style.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{style.desc}</p>
                  </button>
                ))}
              </div>

              {frameStyle !== 'none' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Frame Call-To-Action Headline</label>
                    <input
                      type="text"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="e.g. SCAN TO PAY, REVIEW US ON GOOGLE..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 uppercase placeholder:normal-case focus:bg-white focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Supporting Subtext</label>
                    <input
                      type="text"
                      value={frameSubtext}
                      onChange={(e) => setFrameSubtext(e.target.value)}
                      placeholder="e.g. Camera scan or NFC tap · Instant"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Font Family Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-purple-600" />
                      <span>Typography Style</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'sans', label: 'Modern Sans', class: 'font-sans' },
                        { id: 'display', label: 'Bold Display', class: 'font-extrabold tracking-tight' },
                        { id: 'serif', label: 'Classic Serif', class: 'font-serif' },
                        { id: 'mono', label: 'Tech Mono', class: 'font-mono' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFontFamily(f.id as any)}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition ${
                            fontFamily === f.id
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600'
                              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                          } ${f.class}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: COLORS & PALETTE STUDIO ================= */}
          {activeTab === 'colors' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6 animate-in fade-in-50">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    <span>Color Palette Studio</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curated color harmonies with live ISO 18004 contrast verification.
                  </p>
                </div>
              </div>

              {/* Foreground Color */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Foreground QR Code Color</label>
                <div className="flex flex-wrap items-center gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFgColor(c.hex)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                        fgColor === c.hex
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 pl-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer border border-slate-200"
                      title="Choose custom color"
                    />
                    <span className="text-xs font-mono text-slate-600 font-bold">{fgColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 block">Background Canvas Color</label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'Pure White', hex: '#FFFFFF' },
                    { name: 'Ivory Warm', hex: '#FFFDF7' },
                    { name: 'Soft Mist', hex: '#F8FAFC' },
                    { name: 'Lavender Mist', hex: '#FAF5FF' },
                    { name: 'Obsidian Dark', hex: '#09090B' },
                  ].map((bg) => (
                    <button
                      key={bg.hex}
                      type="button"
                      onClick={() => setBgColor(bg.hex)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                        bgColor === bg.hex
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600'
                          : 'border-slate-200 text-slate-700 bg-white'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: bg.hex }} />
                      <span>{bg.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 pl-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer border border-slate-200"
                      title="Choose custom background"
                    />
                    <span className="text-xs font-mono text-slate-600 font-bold">{bgColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Contrast Meter */}
              <div className="pt-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">Contrast Ratio: </span>
                  <span className="font-mono font-extrabold text-purple-700">{contrastRatio.toFixed(1)}:1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isHighContrast ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[11px] font-semibold text-slate-600">
                    {isHighContrast ? 'Instant Camera Readability Pass' : 'Low Contrast — May affect slow cameras'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: QR STYLE & CORNER EYES ================= */}
          {activeTab === 'eye' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6 animate-in fade-in-50">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Square className="w-4 h-4 text-purple-600" />
                    <span>QR Corner Eye Marker Styles</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize the 3 outer finder patterns for a distinct visual brand identity.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'square', name: 'Sharp Classic', desc: 'Standard sharp corners' },
                  { id: 'rounded', name: 'Smooth Rounded', desc: 'Modern curved corners' },
                  { id: 'circle', name: 'Target Circle', desc: 'Concentric ring dots' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCornerStyle(c.id as any)}
                    className={`p-4 rounded-2xl border text-center transition ${
                      cornerStyle === c.id
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center border-2 border-slate-800 rounded-lg">
                      {c.id === 'circle' ? (
                        <div className="w-4 h-4 rounded-full bg-slate-800" />
                      ) : (
                        <div className={`w-4 h-4 bg-slate-800 ${c.id === 'rounded' ? 'rounded-xs' : ''}`} />
                      )}
                    </div>
                    <p className="text-xs font-bold">{c.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: CENTER LOGO & WATERMARK ================= */}
          {activeTab === 'logo' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6 animate-in fade-in-50">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span>Center Brand Logo & Watermark</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Embed a verified brand icon or upload your business logo.
                  </p>
                </div>
              </div>

              {/* Icon Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Preset Brand Badges</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'google', label: 'Google G' },
                    { id: 'upi', label: 'UPI ₹' },
                    { id: 'wifi', label: 'WiFi' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'youtube', label: 'YouTube' },
                    { id: 'x', label: 'X (Twitter)' },
                    { id: 'star', label: '5-Star Rating' },
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setSelectedIcon(ic.id as any)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        selectedIcon === ic.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ic.label}
                    </button>
                  ))}

                  <label className="py-2 px-2.5 rounded-xl border border-dashed border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold cursor-pointer transition text-center flex items-center justify-center col-span-2">
                    <span>+ Custom Logo</span>
                    <input type="file" accept="image/*" onChange={handleCustomLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Logo Badge Styling */}
              {selectedIcon !== 'none' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Logo Background Badge</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'square', label: 'Rounded Box' },
                          { id: 'circle', label: 'Circle' },
                          { id: 'none', label: 'Transparent' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setLogoBadgeShape(b.id as any)}
                            className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-semibold ${
                              logoBadgeShape === b.id
                                ? 'border-purple-600 bg-purple-50 text-purple-900'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-700">Logo Scale</span>
                        <span className="text-slate-500 font-mono">{logoSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="52"
                        value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE VISUAL CANVAS & 3D HARDWARE SIMULATOR ================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Main Visual Stage Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col items-center text-center space-y-5">
            {/* Mockup Mode Selector Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>Visual Studio Stage</span>
              </span>

              {/* Stage Selector Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'canvas', label: '2D Artboard' },
                  { id: 'standee', label: 'Acrylic' },
                  { id: 'metal-card', label: 'Metal Card' },
                  { id: 'pvc-card', label: 'PVC Card' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMockupView(m.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      mockupView === m.id
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Container with 3D Mouse Tilt */}
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full py-6 flex items-center justify-center min-h-[360px] perspective-[1000px] select-none"
            >
              {/* ================= MODE 1: 2D ARTBOARD (VISUAL DESIGN CANVAS) ================= */}
              {mockupView === 'canvas' && (
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotateX(${tiltRotation.x}deg) rotateY(${tiltRotation.y}deg)`,
                    transition: tiltRotation.x === 0 ? 'transform 0.4s ease-out' : 'none',
                    backgroundColor: bgColor,
                  }}
                  className={`stage-mockup-wrapper relative p-5 shadow-2xl flex flex-col items-center justify-center max-w-[290px] w-full transition-shadow duration-300 ${
                    frameStyle === 'polaroid'
                      ? 'rounded-3xl border-4 border-slate-100 pt-4 pb-8'
                      : frameStyle === 'plaque'
                      ? 'rounded-3xl border-4 border-slate-300 shadow-2xl'
                      : 'rounded-3xl border-2 border-slate-200/80'
                  }`}
                >
                  {/* Print Safe Margin Guides Overlay */}
                  {showPrintGuides && (
                    <div className="absolute inset-2 border border-dashed border-red-400 pointer-events-none rounded-2xl flex items-start justify-end p-1">
                      <span className="text-[9px] font-mono text-red-500 font-bold bg-white/80 px-1 rounded">5mm Safe Zone</span>
                    </div>
                  )}

                  {/* Frame Header Pill */}
                  {frameStyle === 'badge-top' && frameText && (
                    <div
                      className={`w-full py-1.5 px-3 mb-3 rounded-xl text-center text-xs font-black uppercase tracking-wider text-white shadow-xs ${
                        fontFamily === 'display' ? 'font-extrabold tracking-tight' : fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans'
                      }`}
                      style={{ backgroundColor: fgColor }}
                    >
                      {frameText}
                    </div>
                  )}

                  {/* Speech Bubble Header Callout */}
                  {frameStyle === 'speech' && frameText && (
                    <div className="relative mb-3 flex flex-col items-center">
                      <div
                        className="py-1 px-4 rounded-xl text-center text-xs font-black uppercase tracking-wider text-white shadow-xs"
                        style={{ backgroundColor: fgColor }}
                      >
                        {frameText}
                      </div>
                      <div
                        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                        style={{ borderTopColor: fgColor }}
                      />
                    </div>
                  )}

                  {/* QR Image Canvas Container */}
                  <div
                    className={`relative w-48 h-48 flex items-center justify-center p-1 ${
                      cornerStyle === 'rounded' ? 'rounded-2xl' : cornerStyle === 'circle' ? 'rounded-3xl' : 'rounded-none'
                    }`}
                  >
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Visual QR Code Canvas"
                        className={`w-full h-full object-contain ${
                          cornerStyle === 'rounded' ? 'rounded-xl' : cornerStyle === 'circle' ? 'rounded-2xl' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Rendering Artboard...
                      </div>
                    )}

                    {/* Central Brand Logo Badge Overlay */}
                    {selectedIcon !== 'none' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className={`flex items-center justify-center overflow-hidden p-1 shadow-md transition-all ${
                            logoBadgeShape === 'circle'
                              ? 'rounded-full'
                              : logoBadgeShape === 'square'
                              ? 'rounded-xl'
                              : 'rounded-none bg-transparent shadow-none'
                          }`}
                          style={{
                            width: `${logoSize}px`,
                            height: `${logoSize}px`,
                            backgroundColor: logoBadgeShape !== 'none' ? '#FFFFFF' : 'transparent',
                            border: logoBadgeShape !== 'none' ? '1px solid #E2E8F0' : 'none',
                          }}
                        >
                          {selectedIcon === 'google' && <span className="font-bold text-xs text-blue-600">G</span>}
                          {selectedIcon === 'upi' && <span className="font-black text-sm text-emerald-600">₹</span>}
                          {selectedIcon === 'wifi' && <span className="text-sm">📶</span>}
                          {selectedIcon === 'instagram' && <span className="text-sm">📸</span>}
                          {selectedIcon === 'youtube' && <span className="text-sm text-red-600">▶</span>}
                          {selectedIcon === 'x' && <span className="text-xs font-black text-slate-900">𝕏</span>}
                          {selectedIcon === 'star' && <span className="text-amber-500 text-sm">★</span>}
                          {selectedIcon === 'custom' && customLogo && (
                            <img src={customLogo} alt="Custom Logo" className="w-full h-full object-contain" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Frame Bottom Ribbon */}
                  {frameStyle === 'bar-bottom' && frameText && (
                    <div
                      className={`w-full py-1.5 px-3 mt-3 rounded-xl text-center text-xs font-black uppercase tracking-wider text-white shadow-xs ${
                        fontFamily === 'display' ? 'font-extrabold' : ''
                      }`}
                      style={{ backgroundColor: fgColor }}
                    >
                      {frameText}
                    </div>
                  )}

                  {/* Polaroid Frame Bottom Caption */}
                  {frameStyle === 'polaroid' && (
                    <div className="mt-3 text-center">
                      <p className="text-xs font-black text-slate-900 tracking-tight">{businessName}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{frameText}</p>
                    </div>
                  )}

                  {/* Plaque Frame Subtext */}
                  {frameStyle === 'plaque' && frameSubtext && (
                    <p className="text-[10px] text-slate-500 font-semibold mt-2">{frameSubtext}</p>
                  )}
                </div>
              )}

              {/* ================= MODE 2: ACRYLIC COUNTERTOP STANDEE MOCKUP ================= */}
              {mockupView === 'standee' && (
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotateX(${tiltRotation.x}deg) rotateY(${tiltRotation.y}deg)`,
                    transition: tiltRotation.x === 0 ? 'transform 0.4s ease-out' : 'none',
                  }}
                  className="stage-mockup-wrapper relative w-64 h-84 rounded-3xl bg-gradient-to-b from-white/90 via-slate-50/90 to-slate-200/90 border-2 border-white/80 shadow-2xl p-4 flex flex-col items-center justify-between overflow-hidden backdrop-blur-md"
                >
                  {/* Gloss Specular Light Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none transform -skew-x-12" />

                  <div className="w-full text-center pt-2 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      NFC Tap + QR Scan
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-2 truncate">{businessName}</h4>
                  </div>

                  {/* QR on standee */}
                  <div className="w-36 h-36 bg-white p-2 rounded-2xl shadow-md border border-slate-100 relative z-10">
                    {qrDataUrl && <img src={qrDataUrl} alt="QR on Standee" className="w-full h-full object-contain" />}
                  </div>

                  {/* Solid Natural Oak Counter Stand Base */}
                  <div className="w-full h-8 bg-amber-900/95 rounded-xl shadow-inner flex items-center justify-center text-[10px] font-bold text-amber-200 relative z-10 border border-amber-800">
                    <span>Natural Solid Oak Base</span>
                  </div>
                </div>
              )}

              {/* ================= MODE 3: MATTE BLACK LASER METAL NFC CARD ================= */}
              {mockupView === 'metal-card' && (
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotateX(${tiltRotation.x}deg) rotateY(${tiltRotation.y}deg)`,
                    transition: tiltRotation.x === 0 ? 'transform 0.4s ease-out' : 'none',
                  }}
                  className="stage-mockup-wrapper relative w-76 h-48 rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 border border-zinc-700 shadow-2xl p-5 flex items-center justify-between text-white"
                >
                  {/* Brushed Steel Texture Accent */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-mono text-purple-400">QS-MET-2026</span>
                    <p className="text-sm font-extrabold tracking-wide text-zinc-100 truncate max-w-[140px]">{businessName}</p>
                    <p className="text-[10px] text-zinc-400">Anodized Laser-Etched Steel</p>
                    <div className="pt-2 flex items-center gap-1.5">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                        NTAG213 Smart NFC
                      </span>
                    </div>
                  </div>

                  {/* Laser QR */}
                  <div className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-inner border border-zinc-700 shrink-0">
                    {qrDataUrl && <img src={qrDataUrl} alt="Laser QR Code" className="w-full h-full object-contain" />}
                  </div>
                </div>
              )}

              {/* ================= MODE 4: FROST WHITE SMART PVC CARD ================= */}
              {mockupView === 'pvc-card' && (
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotateX(${tiltRotation.x}deg) rotateY(${tiltRotation.y}deg)`,
                    transition: tiltRotation.x === 0 ? 'transform 0.4s ease-out' : 'none',
                  }}
                  className="stage-mockup-wrapper relative w-76 h-48 rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 flex items-center justify-between text-slate-900"
                >
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-mono text-purple-600 font-bold">QRSLICE SMART CARD</span>
                    <p className="text-sm font-extrabold tracking-tight text-slate-900 truncate max-w-[140px]">{businessName}</p>
                    <p className="text-[10px] text-slate-500">Contactless NFC Card</p>
                    <div className="pt-2 flex items-center gap-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        Instant Tap
                      </span>
                    </div>
                  </div>

                  <div className="w-24 h-24 rounded-xl bg-slate-50 p-1.5 shadow-xs border border-slate-200 shrink-0">
                    {qrDataUrl && <img src={qrDataUrl} alt="Smart Card QR" className="w-full h-full object-contain" />}
                  </div>
                </div>
              )}
            </div>

            {/* Stage Actions Toolbar */}
            <div className="w-full pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!qrDataUrl || isGenerating}
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG (1200px)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={!payload || isGenerating}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                  title="Download vector SVG format"
                >
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!qrDataUrl}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* 3D Tilt Toggle */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Interactive 3D Stage</span>
                <button
                  type="button"
                  onClick={() => setTilt3DEnabled(!tilt3DEnabled)}
                  className={`text-[11px] font-bold ${tilt3DEnabled ? 'text-purple-600' : 'text-slate-400'}`}
                >
                  {tilt3DEnabled ? '● 3D Tilt: Active' : '○ 3D Tilt: Paused'}
                </button>
              </div>
            </div>
          </div>

          {/* ================= HARDWARE UPSELL PROMOTION CARD ================= */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                Turn Design Into Physical Hardware
              </span>
              <span className="text-xs font-bold text-purple-200">
                ₹{(suggestedProductPricePaise / 100).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white">{suggestedProductTitle}</h4>
              <p className="text-xs text-purple-200 mt-1">
                Get this exact QR laser-engraved onto premium acrylic or matte metal hardware with embedded NTAG213 smart NFC.
              </p>
            </div>

            <Link
              href={`/products/${suggestedProductSlug}?destinationUrl=${encodeURIComponent(payload)}&businessName=${encodeURIComponent(businessName)}`}
              className="w-full py-3 px-4 rounded-xl bg-white text-purple-900 font-extrabold text-xs hover:bg-purple-50 transition flex items-center justify-center gap-2 shadow-md group"
            >
              <span>Order Physical Hardware with this QR</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
