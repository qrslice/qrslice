// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState } from "react";
import type { MenuItem } from "@/lib/menu-service";
import { formatPaiseToRupees } from "@/lib/menu-service";

interface PublicMenuClientProps {
  restaurant: {
    name: string;
    logoUrl: string | null;
    tagline: string | null;
  };
  categories: string[];
  items: MenuItem[];
  zomatoUrl: string | null;
  swiggyUrl: string | null;
}

export default function PublicMenuClient({
  restaurant,
  categories,
  items,
  zomatoUrl,
  swiggyUrl,
}: PublicMenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    if (!item.available) return false;
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    if (vegOnly && !item.is_veg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Restaurant Header */}
      <header className="text-center space-y-3 pt-2">
        {restaurant.logoUrl && (
          <img
            src={restaurant.logoUrl}
            alt={restaurant.name}
            className="w-20 h-20 rounded-3xl mx-auto object-cover border border-neutral-800 shadow-xl"
          />
        )}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="text-xs text-neutral-400 font-medium">{restaurant.tagline}</p>
          )}
        </div>

        {/* Optional Outbound Delivery Links */}
        {(zomatoUrl || swiggyUrl) && (
          <div className="flex items-center justify-center gap-2 pt-1">
            {zomatoUrl && (
              <a
                href={zomatoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
              >
                Order on Zomato ↗
              </a>
            )}
            {swiggyUrl && (
              <a
                href={swiggyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/20 text-xs font-semibold transition-colors"
              >
                Order on Swiggy ↗
              </a>
            )}
          </div>
        )}
      </header>

      {/* Controls: Search & Veg-Only Filter */}
      <div className="sticky top-3 z-10 bg-neutral-950/90 backdrop-blur-md p-3 rounded-2xl border border-neutral-800 space-y-3 shadow-xl">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items or ingredients..."
            className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
          />
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              vegOnly
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Veg Only
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-white text-neutral-950 font-semibold shadow-sm"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-2">
          <p className="text-sm font-medium text-neutral-300">No items found</p>
          <p className="text-xs text-neutral-500">Try adjusting your category filter or search terms.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  {/* Veg / Non-Veg Indicator Symbol */}
                  <span
                    className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border ${
                      item.is_veg
                        ? "border-emerald-500 text-emerald-500"
                        : "border-red-500 text-red-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.is_veg ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                  </span>
                  <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                    {item.name}
                  </h2>
                </div>

                {item.desc && (
                  <p className="text-xs text-neutral-400 leading-relaxed pr-2">
                    {item.desc}
                  </p>
                )}
              </div>

              {/* Price display at edge only */}
              <div className="text-right whitespace-nowrap pt-0.5">
                <span className="text-sm sm:text-base font-bold text-white font-mono">
                  {formatPaiseToRupees(item.price_paise)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Branding */}
      <footer className="text-center pt-8 pb-4 border-t border-neutral-900 space-y-1">
        <p className="text-[11px] text-neutral-600 font-mono">
          Powered by <span className="text-neutral-400 font-semibold">QRslice</span>
        </p>
      </footer>
    </div>
  );
}
