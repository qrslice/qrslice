'use client';

import React from 'react';
import { Truck, Palette, ShieldCheck, Gift, Headphones } from 'lucide-react';

interface BenefitsStripProps {
  className?: string;
}

export function BenefitsStrip({ className = '' }: BenefitsStripProps) {
  const benefits = [
    {
      icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />,
      title: 'Free Shipping',
      subtitle: 'on orders above ₹999',
    },
    {
      icon: <Palette className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />,
      title: 'Custom Branding',
      subtitle: 'Your logo, your design',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />,
      title: 'Premium Quality',
      subtitle: 'Durable & long-lasting',
    },
    {
      icon: <Gift className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />,
      title: 'Bulk Discounts',
      subtitle: 'For cafes, restaurants & businesses',
    },
    {
      icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />,
      title: 'Dedicated Support',
      subtitle: "We're here to help",
    },
  ];

  return (
    <section
      className={`w-full bg-[#7c3aed] text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-xl shadow-purple-600/10 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 items-center">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 justify-start sm:justify-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 text-white">
                {b.icon}
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                  {b.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-purple-100 font-medium leading-tight mt-0.5">
                  {b.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
