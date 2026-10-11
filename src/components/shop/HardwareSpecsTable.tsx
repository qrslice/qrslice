import React from 'react';
import { ShopProduct } from '@/lib/shop-service';
import { Cpu, Radio, Shield, BatteryCharging, Smartphone, RefreshCw, Layers } from 'lucide-react';

interface HardwareSpecsTableProps {
  product: ShopProduct;
}

export function HardwareSpecsTable({ product }: HardwareSpecsTableProps) {
  const getMaterialLabel = (p: ShopProduct) => {
    const title = p.title.toLowerCase();
    if (title.includes('bamboo') || title.includes('wood')) {
      return 'Natural Solid Bamboo (Hand-finished oil coat, eco-friendly)';
    }
    if (title.includes('steel') || title.includes('metal')) {
      return 'Brushed 304 Stainless Steel (Anti-rust, commercial grade)';
    }
    if (title.includes('matte black') || title.includes('pvc') || title.includes('card')) {
      return 'Premium Matte PVC with embedded chip core (Waterproof & scratch-resistant)';
    }
    return '4mm High-Gloss Cast Optical Acrylic with polished beveled edges';
  };

  const specs = [
    {
      icon: Cpu,
      label: 'NFC Microchip',
      value: 'Genuine NXP NTAG213 (High-Frequency 13.56 MHz, NFC Forum Type 2 Tag)',
    },
    {
      icon: Radio,
      label: 'Read Distance',
      value: '2 to 4 cm contactless tap (instant response through thin non-metal phone cases)',
    },
    {
      icon: BatteryCharging,
      label: 'Power & Battery',
      value: 'Completely passive RFID (Zero batteries, zero charging, powered by the phone’s NFC field)',
    },
    {
      icon: Layers,
      label: 'Build Material',
      value: getMaterialLabel(product),
    },
    {
      icon: Shield,
      label: 'Laser & QR Durability',
      value: 'High-contrast precision UV / laser etching (300+ DPI, sanitizer & spill resistant)',
    },
    {
      icon: Smartphone,
      label: 'Device Compatibility',
      value: 'Apple iPhone (iPhone 7+ on iOS 11+) and all NFC-enabled Android devices natively',
    },
    {
      icon: RefreshCw,
      label: 'Cloud Software Layer',
      value: 'QRslice Cloud Dashboard included free for life (Dynamic URL re-pointing & private owner inbox)',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hardware & Technical Specifications</span>
          </h3>
          <p className="text-xs text-slate-500">
            Engineered for high-volume Indian retail counters, salons, cafes, and executive desks.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-violet-800 bg-violet-50 px-3 py-1 rounded-full border border-violet-200/80 w-fit">
          Commercial Grade
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 transition hover:bg-slate-50"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Icon className="w-4 h-4 text-violet-600" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
