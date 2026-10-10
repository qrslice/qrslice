'use client';

import React from 'react';
import { ShowcaseData } from '@/lib/card-service';

interface Props {
  cardId: string;
  tenant: {
    name: string;
    logoUrl: string | null;
    googleReviewUrl: string | null;
  };
  showcaseData?: ShowcaseData | null;
}

export function SmartShowcaseView({ cardId, tenant, showcaseData }: Props) {
  const data: ShowcaseData = {
    title: showcaseData?.title || tenant.name,
    tagline: showcaseData?.tagline || 'Welcome! Tap any button below to connect with us.',
    phone: showcaseData?.phone || '',
    email: showcaseData?.email || '',
    websiteUrl: showcaseData?.websiteUrl || '',
    instagramUrl: showcaseData?.instagramUrl || '',
    googleReviewUrl: showcaseData?.googleReviewUrl || tenant.googleReviewUrl || '',
    address: showcaseData?.address || '',
    hours: showcaseData?.hours || 'Mon - Sun: 10:00 AM - 9:00 PM',
  };

  const downloadVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${data.title}`,
      `ORG:${data.title}`,
      data.phone ? `TEL;TYPE=CELL,VOICE:${data.phone}` : '',
      data.email ? `EMAIL:${data.email}` : '',
      data.websiteUrl ? `URL:${data.websiteUrl}` : '',
      data.address ? `ADR;TYPE=WORK:;;${data.address};;;;` : '',
      `NOTE:Saved from QRslice NFC card (${cardId})`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(data.title || 'contact').replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 text-center">
      {/* Brand Profile Header */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-4">
        {tenant.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tenant.logoUrl}
            alt={tenant.name}
            className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-zinc-700 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-black font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            {tenant.name.substring(0, 2).toUpperCase()}
          </div>
        )}

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-white">{data.title}</h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            {data.tagline}
          </p>
        </div>

        {/* 1-Tap Save Contact Button */}
        <button
          onClick={downloadVCard}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-white/10"
        >
          <span>📱</span>
          <span>Save to Phone Contacts (vCard)</span>
        </button>
      </div>

      {/* Action Links Grid */}
      <div className="space-y-2.5">
        {data.googleReviewUrl && (
          <a
            href={data.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="text-xl">⭐</span>
              <div>
                <h2 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  Leave a Google Review
                </h2>
                <p className="text-[11px] text-zinc-500">Takes 10 seconds · Direct link</p>
              </div>
            </div>
            <span className="text-xs text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}

        {data.phone && (
          <a
            href={`tel:${data.phone}`}
            className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="text-xl">📞</span>
              <div>
                <h2 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Call Business
                </h2>
                <p className="text-[11px] text-zinc-500">{data.phone}</p>
              </div>
            </div>
            <span className="text-xs text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}

        {data.instagramUrl && (
          <a
            href={data.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="text-xl">📸</span>
              <div>
                <h2 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                  Follow on Instagram
                </h2>
                <p className="text-[11px] text-zinc-500">Latest updates & galleries</p>
              </div>
            </div>
            <span className="text-xs text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}

        {data.websiteUrl && (
          <a
            href={data.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="text-xl">🌐</span>
              <div>
                <h2 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  Visit Official Website
                </h2>
                <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">{data.websiteUrl}</p>
              </div>
            </div>
            <span className="text-xs text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}
      </div>

      {/* Info Card: Hours & Location */}
      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-left text-xs space-y-2">
        {data.hours && (
          <div>
            <span className="text-zinc-500 font-semibold block text-[10px] uppercase">Business Hours</span>
            <span className="text-zinc-300 font-medium">{data.hours}</span>
          </div>
        )}
        {data.address && (
          <div className="pt-2 border-t border-zinc-800/60">
            <span className="text-zinc-500 font-semibold block text-[10px] uppercase">Address</span>
            <span className="text-zinc-300 font-medium">{data.address}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[10px] text-zinc-600 font-mono">
        Tapped via QRslice NFC ({cardId})
      </div>
    </div>
  );
}
