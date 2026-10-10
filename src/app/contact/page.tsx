import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contact Us & Bulk Orders — QrSlice',
  description: 'Get in touch with the QrSlice hardware support team or request custom enterprise and restaurant bulk quotation.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
            Support & Sales
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            We&apos;re Here to Help
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Have questions about product sizing, custom bulk branding, or an existing order?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Contact Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <h2 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100">
              Get in Touch
            </h2>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Email Inquiries</h4>
                  <p className="text-slate-500">support@qrslice.com</p>
                  <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Response within 2-4 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Direct Support Helpline</h4>
                  <p className="text-slate-500">+91 (022) 4892-7100</p>
                  <p className="text-[11px] text-slate-400">Mon – Sat: 9:30 AM – 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Operations</h4>
                  <p className="text-slate-500">QRslice Operations, India · Pan-India express dispatch & merchant support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Inquiries Quick Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100">
              Request a Bulk Quotation
            </h2>

            <form className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anjali Nair"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Email or Phone</label>
                <input
                  type="text"
                  placeholder="anjali@hotelcorp.in"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantity & Products of Interest</label>
                <textarea
                  rows={3}
                  placeholder="Looking for 50 Google Review stands and 200 employee NFC cards..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
