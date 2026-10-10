'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Scale,
  Sun,
  Droplets,
} from 'lucide-react';

const MATERIALS = [
  {
    id: 'acrylic-standee',
    name: 'Countertop Acrylic Standee',
    subtitle: 'High-Gloss Optical Acrylic + Solid Oak Base',
    image: '/products/google-review-standee.png',
    slug: 'acrylic-google-review-standee',
    pricePaise: 49900,
    idealFor: 'Restaurants, Retail Checkouts, Hotel Receptions, Clinics',
    thickness: '5.0 mm Optical Acrylic',
    base: 'Natural Solid Oak Base Included',
    nfcChip: 'NTAG213 (144 bytes)',
    tapRange: '3.5 - 4.0 cm',
    waterproof: true,
    uvResistant: true,
    dropResistance: 'High (Impact resistant cast acrylic)',
    dimensions: '140 mm × 95 mm × 35 mm',
    weight: '160 grams',
    repointing: 'Free Cloud Repoint Anytime',
    laserSetup: 'Free Included',
  },
  {
    id: 'metal-card',
    name: 'Matte Black Laser Metal Card',
    subtitle: 'Anodized 304 Stainless Steel + Laser Etched',
    image: '/products/nfc-business-card.png',
    slug: 'nfc-business-card-metal-black',
    pricePaise: 79900,
    idealFor: 'Executives, Founders, Sales Leaders, Luxury VIPs',
    thickness: '0.8 mm Heavy Metal Card',
    base: 'Wallet Sized (Credit card profile)',
    nfcChip: 'NTAG213 Shielded High-Gain',
    tapRange: '2.5 - 3.5 cm (Ferrite-backed)',
    waterproof: true,
    uvResistant: true,
    dropResistance: 'Indestructible (Solid steel core)',
    dimensions: '85.6 mm × 54.0 mm',
    weight: '24 grams',
    repointing: 'Free Cloud Repoint Anytime',
    laserSetup: 'Free Included',
  },
  {
    id: 'pvc-card',
    name: 'Frost White Smart PVC Card',
    subtitle: 'Satin Finish ISO 7810 Card + NFC Antenna',
    image: '/products/nfc-card-pvc.png',
    slug: 'nfc-business-card-pvc-matte',
    pricePaise: 29900,
    idealFor: 'Event Badges, Multi-Team Distribution, Field Staff',
    thickness: '0.76 mm Standard Card',
    base: 'Flexible PVC Core',
    nfcChip: 'NTAG213 (144 bytes)',
    tapRange: '3.0 - 4.0 cm',
    waterproof: true,
    uvResistant: true,
    dropResistance: 'Bend-tolerant & Waterproof',
    dimensions: '85.6 mm × 54.0 mm',
    weight: '5 grams',
    repointing: 'Free Cloud Repoint Anytime',
    laserSetup: 'Free Included',
  },
  {
    id: 'wooden-block',
    name: 'Natural Beechwood Table Block',
    subtitle: 'Solid Organic Beechwood + Laser Burn Engraving',
    image: '/products/wooden-menu-standee.png',
    slug: 'nfc-menu-standee-wooden',
    pricePaise: 59900,
    idealFor: 'Artisan Cafes, Breweries, Fine Dining Tables',
    thickness: '20.0 mm Solid Beechwood',
    base: 'Self-Standing Block Profile',
    nfcChip: 'NTAG213 Embedded Core',
    tapRange: '3.0 - 3.5 cm',
    waterproof: false,
    uvResistant: true,
    dropResistance: 'High (Solid natural wood)',
    dimensions: '120 mm × 80 mm × 20 mm',
    weight: '140 grams',
    repointing: 'Free Cloud Repoint Anytime',
    laserSetup: 'Free Included',
  },
];

export function CompareClient() {
  const [filter, setFilter] = useState<'all' | 'nfc' | 'durability' | 'pricing'>('all');

  return (
    <div className="space-y-8">
      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Complete Comparison (All 12 Specs)' },
          { id: 'nfc', label: 'NFC & RF Performance' },
          { id: 'durability', label: 'Materials & Physical Durability' },
          { id: 'pricing', label: 'Pricing & Order Delivery' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              filter === f.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="py-5 px-4 font-black text-slate-900 w-44 text-sm">
                  Physical Hardware
                </th>
                {MATERIALS.map((mat) => (
                  <th key={mat.id} className="py-5 px-4 min-w-[210px] w-64 align-top">
                    <div className="space-y-2">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 p-1.5 shadow-2xs">
                        <img src={mat.image} alt={mat.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{mat.name}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">{mat.subtitle}</p>
                        <p className="text-sm font-black text-purple-700 mt-1">
                          ₹{(mat.pricePaise / 100).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <Link
                        href={`/products/${mat.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 group"
                      >
                        <span>Customize Hardware</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row: Best Suited For */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Ideal Use Case</td>
                {MATERIALS.map((m) => (
                  <td key={m.id} className="py-3 px-4 text-slate-700 font-medium">
                    {m.idealFor}
                  </td>
                ))}
              </tr>

              {/* NFC Specs */}
              {(filter === 'all' || filter === 'nfc') && (
                <>
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="py-2 px-4 font-black uppercase tracking-wider text-[10px] text-purple-800">
                      NFC & Contactless Performance
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">NFC Microchip</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 font-mono font-bold text-purple-700">
                        {m.nfcChip}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Contactless Range</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 font-semibold text-slate-800">
                        {m.tapRange}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Cloud Repoint URL</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Included</span>
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Physical Durability Specs */}
              {(filter === 'all' || filter === 'durability') && (
                <>
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="py-2 px-4 font-black uppercase tracking-wider text-[10px] text-purple-800">
                      Materials & Environmental Durability
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Thickness & Profile</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 text-slate-700 font-medium">
                        {m.thickness}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Water & Spill Proof</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4">
                        {m.waterproof ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>100% Waterproof</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Wipe clean with cloth</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Drop & Shock Resistance</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 text-slate-700">
                        {m.dropResistance}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Product Weight</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 font-mono text-slate-800">
                        {m.weight}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Pricing & Manufacturing */}
              {(filter === 'all' || filter === 'pricing') && (
                <>
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="py-2 px-4 font-black uppercase tracking-wider text-[10px] text-purple-800">
                      Pricing & Manufacturing Guarantee
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Laser Artwork Setup</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 font-bold text-emerald-600">
                        ₹0 Free Setup
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">Unit Price</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-3 px-4 font-black text-purple-700 font-mono text-sm">
                        ₹{(m.pricePaise / 100).toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-4 font-bold text-slate-700 bg-slate-50/30">Direct Action</td>
                    {MATERIALS.map((m) => (
                      <td key={m.id} className="py-4 px-4">
                        <Link
                          href={`/products/${m.slug}`}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition inline-flex items-center gap-1 shadow-xs"
                        >
                          <span>Order Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
