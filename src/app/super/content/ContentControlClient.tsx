'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { WebsiteContentSettings } from '@/lib/content-store';
import {
  Globe,
  Bell,
  Phone,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';

export function ContentControlClient() {
  const containerRef = useRef<HTMLFormElement>(null);
  const [settings, setSettings] = useState<WebsiteContentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form local state
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementBadge, setAnnouncementBadge] = useState('');

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [fulfillmentNotice, setFulfillmentNotice] = useState('');

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/super/content');
      const data = await res.json();
      if (data.success && data.settings) {
        const s: WebsiteContentSettings = data.settings;
        setSettings(s);
        setAnnouncementEnabled(s.announcementBar.enabled);
        setAnnouncementText(s.announcementBar.text);
        setAnnouncementLink(s.announcementBar.linkUrl || '');
        setAnnouncementBadge(s.announcementBar.badgeText || '');

        setMetaTitle(s.seo.metaTitle);
        setMetaDescription(s.seo.metaDescription);

        setSupportPhone(s.support.supportPhone);
        setSupportEmail(s.support.supportEmail);
        setBusinessAddress(s.support.businessAddress);

        setMaintenanceMode(s.systemNotices.maintenanceMode);
        setFulfillmentNotice(s.systemNotices.orderFulfillmentNotice || '');
      }
    } catch (err) {
      console.error('Failed to load content settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // GSAP animation for content panels
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.content-panel',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out', clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/super/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementBar: {
            enabled: announcementEnabled,
            text: announcementText,
            linkUrl: announcementLink,
            badgeText: announcementBadge,
          },
          seo: {
            metaTitle,
            metaDescription,
          },
          support: {
            supportPhone,
            supportEmail,
            businessAddress,
          },
          systemNotices: {
            maintenanceMode,
            orderFulfillmentNotice: fulfillmentNotice,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Content configuration published live!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert(data.error || 'Failed to update website content');
      }
    } catch {
      alert('Error updating website content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-400 text-xs font-mono">Loading CMS settings...</div>;
  }

  return (
    <form ref={containerRef} onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Storefront & Website Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              CMS Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish announcement banners, SEO metadata, contact details, and maintenance notices without editing code.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {successMessage && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMessage}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Announcement Bar Banner */}
        <div className="content-panel p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">Homepage Announcement Banner</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-0"
              />
              <span className={announcementEnabled ? 'text-purple-700 font-bold' : 'text-slate-500'}>
                {announcementEnabled ? 'Active on Storefront' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Banner Badge (Optional)</label>
              <input
                type="text"
                value={announcementBadge}
                onChange={(e) => setAnnouncementBadge(e.target.value)}
                placeholder="e.g. FESTIVE SALE, NEW LAUNCH"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Announcement Copy Text *</label>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Call-To-Action Link</label>
              <input
                type="text"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                placeholder="/products or /tools"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:border-purple-600 focus:outline-none"
              />
            </div>

            {/* Live Preview Box */}
            {announcementEnabled && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center text-xs text-purple-950 font-medium">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-600 text-white mr-2">
                  {announcementBadge || 'UPDATE'}
                </span>
                <span>{announcementText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Global SEO Metadata */}
        <div className="content-panel p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Global SEO & Social Metadata</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Primary Meta Title *</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Meta Description *</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* SERP Search Preview */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Google Search Result Snippet</p>
              <p className="text-xs text-blue-600 font-medium truncate">{metaTitle}</p>
              <p className="text-[10px] text-emerald-700 font-mono">https://qrslice.com</p>
              <p className="text-[11px] text-slate-600 line-clamp-2">{metaDescription}</p>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Business Legal Info */}
        <div className="content-panel p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Merchant Support & Business Info</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Support Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Dispatch Hub & Registered Address</label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Operational Availability & Maintenance */}
        <div className="content-panel p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Storefront Availability & Lead Times</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Storefront Maintenance Mode</div>
                <div className="text-[11px] text-slate-500">Temporarily pauses new checkout orders for maintenance.</div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-0"
                />
                <span className={maintenanceMode ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                  {maintenanceMode ? 'ENABLED' : 'OFF'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fulfillment Notice Banner</label>
              <input
                type="text"
                value={fulfillmentNotice}
                onChange={(e) => setFulfillmentNotice(e.target.value)}
                placeholder="e.g. Standard laser etching & dispatch: 24 to 48 hours."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
