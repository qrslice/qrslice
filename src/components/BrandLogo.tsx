'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  isDark?: boolean;
  className?: string;
}

export function BrandLogo({
  href = '/',
  size = 'md',
  subtitle,
  isDark = false,
  className = '',
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* 3D Brand App Icon */}
      <img
        src="/app-icon.png"
        alt="QrSlice Logo"
        className={`${iconSizes} object-cover shadow-sm transition-transform duration-200 group-hover:scale-105 flex-shrink-0`}
      />

      {/* Styled Brand Wordmark */}
      <div className="flex items-baseline gap-1.5">
        <span className={`font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F0728]'} ${textSizes}`}>
          Qr<span className={isDark ? 'text-violet-400' : 'text-violet-600'}>slice</span>
        </span>
        {subtitle && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isDark 
              ? 'bg-violet-950/80 text-violet-300 border border-violet-800/60' 
              : 'bg-violet-50 text-violet-700 border border-violet-200/60'
          } ml-1`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center select-none focus:outline-none">
      {content}
    </Link>
  );
}
