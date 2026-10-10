'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Zap,
  Star,
  CreditCard,
  User,
  UtensilsCrossed,
  Check,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function VirtualNfcSimulator() {
  const [phoneType, setPhoneType] = useState<'ios' | 'android'>('ios');
  const [selectedProduct, setSelectedProduct] = useState<'google' | 'upi' | 'vcard' | 'menu'>('google');
  const [isTapped, setIsTapped] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const phoneRef = useRef<HTMLDivElement>(null);
  const hardwareRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  const productData = {
    google: {
      title: 'Acrylic Google Review Standee',
      hardwareImage: '/products/google-review-standee.png',
      badge: '5-Star Direct Dialog',
      slug: 'acrylic-google-review-standee',
      price: '₹499',
      notificationTitle: 'Google Maps · Rate & Review',
      notificationBody: 'Rate Copper Chimney Bistro ★★★★★',
      actionText: 'Write a Review',
    },
    upi: {
      title: 'Countertop UPI Payment Standee',
      hardwareImage: '/products/upi-payment-standee.png',
      badge: '0% Commission Payments',
      slug: 'dual-qr-upi-payment-standee',
      price: '₹399',
      notificationTitle: 'PhonePe / GPay · UPI Payment',
      notificationBody: 'Pay Copper Chimney (₹250.00)',
      actionText: 'Authorize via UPI PIN',
    },
    vcard: {
      title: 'Matte Black Laser Metal NFC Card',
      hardwareImage: '/products/nfc-business-card.png',
      badge: 'Instant Contact Exchange',
      slug: 'nfc-business-card-metal-black',
      price: '₹799',
      notificationTitle: 'Contacts · New Card Detected',
      notificationBody: 'Rahul Sharma · CTO at TechLabs',
      actionText: 'Save Contact (.vcf)',
    },
    menu: {
      title: 'Natural Beechwood Tabletop Menu',
      hardwareImage: '/products/wooden-menu-standee.png',
      badge: 'Digital Menu & Ordering',
      slug: 'nfc-menu-standee-wooden',
      price: '₹599',
      notificationTitle: 'Safari · Digital Menu',
      notificationBody: 'Copper Chimney Chef’s Tasting Menu',
      actionText: 'View Food & Drinks',
    },
  };

  const current = productData[selectedProduct];

  const handleSimulateTap = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    // Audio chime fallback using Web Audio API
    if (soundEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {
        // Audio error fallback
      }
    }

    // Haptic vibration on supporting mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {}
    }

    // GSAP phone move animation towards hardware
    const tl = gsap.timeline();
    tl.to(phoneRef.current, {
      x: -45,
      y: -15,
      rotate: -4,
      duration: 0.35,
      ease: 'power2.inOut',
    })
      .to(phoneRef.current, {
        scale: 1.03,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      })
      .call(() => {
        setIsTapped(true);
        // Ripple effect
        if (rippleRef.current) {
          gsap.fromTo(
            rippleRef.current,
            { scale: 0.2, opacity: 1 },
            { scale: 2.5, opacity: 0, duration: 0.8, ease: 'power2.out' }
          );
        }
      })
      .to(phoneRef.current, {
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.1,
      })
      .call(() => {
        setIsSimulating(false);
      });
  };

  const handleReset = () => {
    setIsTapped(false);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Hardware Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Try Virtual Contactless NFC Tap
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            See exactly what your customers experience. Tap the simulated phone against the QrSlice standee or card below.
          </p>
        </div>

        {/* Device & Sound Toggle Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setPhoneType('ios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                phoneType === 'ios'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>iPhone (iOS 18)</span>
            </button>
            <button
              type="button"
              onClick={() => setPhoneType('android')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                phoneType === 'android'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Android Galaxy</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title={soundEnabled ? 'Haptic sound on' : 'Haptic sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Product Category Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
        {[
          { id: 'google', label: 'Google Review Standee', icon: Star, color: 'text-amber-400' },
          { id: 'upi', label: 'UPI Payment Standee', icon: CreditCard, color: 'text-emerald-400' },
          { id: 'vcard', label: 'Metal Business Card', icon: User, color: 'text-purple-400' },
          { id: 'menu', label: 'Tabletop Menu Block', icon: UtensilsCrossed, color: 'text-cyan-400' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedProduct === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedProduct(item.id as any);
                setIsTapped(false);
              }}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-purple-900/60 border-purple-500 text-white ring-1 ring-purple-500'
                  : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-xs font-bold leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage: Physical Hardware vs Virtual Smartphone */}
      <div className="relative z-10 py-8 bg-slate-950/70 rounded-3xl border border-slate-800/90 flex flex-col md:flex-row items-center justify-around gap-8 p-6 overflow-hidden">
        {/* Left: Physical QrSlice Hardware Plaque */}
        <div ref={hardwareRef} className="relative flex flex-col items-center text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
            {current.badge}
          </span>

          <div className="relative w-48 sm:w-56 h-60 sm:h-64 rounded-3xl bg-slate-900 border border-slate-700/80 p-4 flex flex-col items-center justify-between shadow-2xl">
            {/* NFC Sensor Target Area */}
            <div className="absolute -top-3 -right-3">
              <span className="flex h-6 w-6 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-6 w-6 bg-purple-500 text-[10px] font-black items-center justify-center text-white">
                  NFC
                </span>
              </span>
            </div>

            <div className="w-full text-center">
              <p className="text-xs font-bold text-slate-200 truncate">Copper Chimney Bistro</p>
              <p className="text-[10px] text-slate-400">QrSlice Smart Hardware</p>
            </div>

            <div className="w-28 h-28 bg-white rounded-2xl p-2 border border-slate-200 flex items-center justify-center shadow-md">
              <img
                src={current.hardwareImage}
                alt={current.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="w-full py-1 rounded-xl bg-amber-900/80 text-amber-200 text-[10px] font-bold text-center border border-amber-700/60">
              Natural Solid Oak Base
            </div>
          </div>

          <p className="text-xs font-extrabold text-slate-300">{current.title}</p>
        </div>

        {/* Center: Tap Simulation Trigger Action */}
        <div className="flex flex-col items-center justify-center space-y-3 relative">
          {/* Animated Tap Ripple */}
          <div
            ref={rippleRef}
            className="w-24 h-24 rounded-full border-2 border-purple-400 bg-purple-500/20 absolute pointer-events-none opacity-0"
          />

          <button
            type="button"
            onClick={handleSimulateTap}
            disabled={isSimulating}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 active:scale-95 flex items-center gap-2 group disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-amber-300 group-hover:scale-125 transition-transform" />
            <span>{isSimulating ? 'Tapping Sensor...' : 'Tap Phone on NFC Tag'}</span>
          </button>

          <span className="text-[11px] text-slate-500 font-medium">
            Simulates smartphone NFC antenna detection
          </span>

          {isTapped && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Screen</span>
            </button>
          )}
        </div>

        {/* Right: Virtual Phone Screen Display (iOS 18 / Android Galaxy) */}
        <div
          ref={phoneRef}
          className="relative w-64 h-[420px] rounded-[42px] bg-slate-900 border-4 border-slate-700 shadow-2xl p-3 flex flex-col justify-between overflow-hidden select-none will-change-transform"
        >
          {/* Phone Dynamic Island / Camera Notch */}
          <div className="w-full flex justify-center pt-1">
            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
            </div>
          </div>

          {/* Interactive Screen Display */}
          <div className="flex-1 w-full flex flex-col justify-between py-2 text-slate-900">
            {/* Pop-up Banner Notification when tapped */}
            {isTapped ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Simulated iOS / Android Banner */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                      <span>{current.notificationTitle}</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">now</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{current.notificationBody}</p>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                      Tap to open
                    </span>
                    <ExternalLink className="w-3 h-3 text-purple-600" />
                  </div>
                </div>

                {/* Simulated In-App Landing Card */}
                <div className="bg-slate-800 rounded-2xl p-3.5 text-white space-y-2.5 border border-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-100">Tag Detected Successfully</span>
                  </div>

                  {selectedProduct === 'google' && (
                    <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                      <p className="text-[11px] font-bold text-slate-300">Rate Copper Chimney</p>
                      <div className="flex justify-center gap-1 text-amber-400 text-sm">
                        {'★★★★★'}
                      </div>
                    </div>
                  )}

                  {selectedProduct === 'upi' && (
                    <div className="bg-slate-900/80 p-2 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400">Paying via GPay</span>
                      <p className="text-sm font-black text-emerald-400">₹250.00</p>
                    </div>
                  )}

                  {selectedProduct === 'vcard' && (
                    <div className="bg-slate-900/80 p-2 rounded-xl text-center space-y-1">
                      <p className="text-xs font-black text-slate-100">Rahul Sharma</p>
                      <span className="text-[10px] text-purple-300">CTO · TechLabs Corp</span>
                    </div>
                  )}

                  {selectedProduct === 'menu' && (
                    <div className="bg-slate-900/80 p-2 rounded-xl text-center space-y-0.5">
                      <p className="text-xs font-black text-amber-300">Dinner Tasting Menu</p>
                      <span className="text-[10px] text-slate-400">42 Handcrafted Dishes</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => alert(`Simulated action: ${current.actionText}`)}
                    className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
                  >
                    {current.actionText}
                  </button>
                </div>
              </div>
            ) : (
              /* Idle Waiting State */
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 animate-pulse text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Ready to Tap</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Click &quot;Tap Phone on NFC Tag&quot; to test contactless interaction
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-full flex justify-center pb-1">
            <div className="w-24 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Direct Order Upsell Bar */}
      <div className="bg-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{current.title}</h4>
            <p className="text-xs text-slate-400">
              Laser engraved with embedded NTAG213 NFC chip · Starting at {current.price}
            </p>
          </div>
        </div>

        <Link
          href={`/products/${current.slug}`}
          className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-purple-50 transition flex items-center gap-1.5 shadow-md shrink-0 group"
        >
          <span>Order This Hardware</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
