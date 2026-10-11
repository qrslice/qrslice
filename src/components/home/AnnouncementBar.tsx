import React from 'react';

export function AnnouncementBar() {
  return (
    <div className="w-full bg-[#0F0728] text-violet-100 text-xs font-medium py-2 px-4 border-b border-violet-900/60 text-center flex items-center justify-center gap-2 select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
      <span>Free express shipping across India on all orders over ₹999.</span>
    </div>
  );
}
