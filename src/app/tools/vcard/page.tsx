'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRStudio } from '@/components/tools/QRStudio';
import { formatVCardUri } from '@/lib/qr-generator';
import { ChevronRight, User, Phone, Mail, Building, Globe, MapPin } from 'lucide-react';

export default function VCardQRPage() {
  const [firstName, setFirstName] = useState('Rahul');
  const [lastName, setLastName] = useState('Kapoor');
  const [organization, setOrganization] = useState('Apex Digital Labs');
  const [title, setTitle] = useState('Founder & CEO');
  const [phone, setPhone] = useState('+91 98201 12345');
  const [email, setEmail] = useState('rahul@apexdigital.in');
  const [url, setUrl] = useState('https://apexdigital.in');
  const [address, setAddress] = useState('BKC, Bandra East, Mumbai');

  const finalPayload = formatVCardUri({
    firstName,
    lastName,
    organization,
    title,
    phone,
    email,
    url,
    address,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-purple-600 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/tools" className="hover:text-purple-600 transition">
            Free QR Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">Digital Business Card (vCard) QR Generator</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Hero Title */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
            <span>Standard vCard 3.0 · 1-Tap Save to Phone Contacts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Free vCard Digital Business Card QR Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Generate a smart vCard QR code that downloads directly into iPhone and Android contacts when scanned. Never lose a prospective client or partner again.
          </p>
        </div>

        {/* QR Studio */}
        <QRStudio
          initialPayload={finalPayload}
          defaultFrameText="SCAN TO SAVE CONTACT"
          businessName={`${firstName} ${lastName}`}
          suggestedProductSlug="nfc-business-card-pvc"
          suggestedProductTitle="Matte Black Premium NFC Business Card"
          suggestedProductPricePaise={29900}
          suggestedProductImage="/products/nfc-business-card-pvc.png"
        >
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">1. Contact & Identity Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rahul"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Kapoor"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Company / Brand</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Apex Digital Labs"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Job Title / Designation</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Founder & CEO"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 12345"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Website / Portfolio URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Office / City Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bandra Kurla Complex, Mumbai"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          </div>
        </QRStudio>
      </main>

      <Footer />
    </div>
  );
}
