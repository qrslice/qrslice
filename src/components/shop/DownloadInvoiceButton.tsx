'use client';

import React, { useState } from 'react';
import { FileText, Download, Check } from 'lucide-react';
import { downloadGSTInvoice, InvoiceOrderData } from '@/lib/invoice-generator';

interface DownloadInvoiceButtonProps {
  order: InvoiceOrderData;
  className?: string;
}

export function DownloadInvoiceButton({ order, className = '' }: DownloadInvoiceButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    downloadGSTInvoice(order);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition shadow-2xs active:scale-95 ${className}`}
      title="Download Official Order Invoice / Receipt"
    >
      {downloaded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700">Invoice Saved!</span>
        </>
      ) : (
        <>
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>Download Order Receipt (PDF)</span>
        </>
      )}
    </button>
  );
}
