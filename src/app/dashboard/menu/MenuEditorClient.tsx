// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  formatPaiseToRupees,
  rupeesToPaise,
  type MenuItem,
  type RestaurantMenu,
} from "@/lib/menu-service";

interface MenuEditorClientProps {
  initialMenu: RestaurantMenu | null;
  restaurantName: string;
  defaultSlug: string;
}

export default function MenuEditorClient({
  initialMenu,
  restaurantName,
  defaultSlug,
}: MenuEditorClientProps) {
  const [items, setItems] = useState<MenuItem[]>(initialMenu?.items || []);
  const [categories, setCategories] = useState<string[]>(
    initialMenu?.categories || ["All", "Mains", "Beverages", "Desserts"],
  );
  const [zomatoUrl, setZomatoUrl] = useState(initialMenu?.zomato_url || "");
  const [swiggyUrl, setSwiggyUrl] = useState(initialMenu?.swiggy_url || "");
  const [slug, setSlug] = useState(initialMenu?.slug || defaultSlug);

  // New item modal/form state
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Mains");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemVeg, setNewItemVeg] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    const item: MenuItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      price_paise: rupeesToPaise(newItemPrice),
      category: newItemCategory,
      desc: newItemDesc.trim(),
      is_veg: newItemVeg,
      available: true,
    };

    setItems([...items, item]);
    setNewItemName("");
    setNewItemPrice("");
    setNewItemDesc("");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleToggleAvailable = (id: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, available: !item.available } : item)),
    );
  };

  const handleSaveMenu = async () => {
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          categories,
          zomatoUrl: zomatoUrl.trim() || null,
          swiggyUrl: swiggyUrl.trim() || null,
          customSlug: slug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: "error", text: data?.message || "Failed to save menu." });
        return;
      }

      setStatusMsg({ type: "success", text: "Digital menu published successfully!" });
      if (data.slug) setSlug(data.slug);
    } catch {
      setStatusMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Digital Menu Builder</h1>
          <p className="text-sm text-neutral-400">
            Edit items and prices for {restaurantName}. Updates reflect immediately at{" "}
            <Link
              href={`/m/${slug}`}
              target="_blank"
              className="text-white hover:underline font-mono text-xs inline-flex items-center gap-1"
            >
              /m/{slug} ↗
            </Link>
          </p>
        </div>

        <button
          onClick={handleSaveMenu}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-lg shadow-white/5"
        >
          {isSaving ? "Publishing..." : "Publish Menu Changes"}
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Add Item Form */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-base font-semibold text-white">Add New Item</h2>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Item Name *</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Masala Chai, Paneer Tikka"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Price (in ₹) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="e.g. 150"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
              >
                {categories.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs text-neutral-400">Description (Optional)</label>
              <input
                type="text"
                maxLength={200}
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="e.g. Freshly brewed with ginger and cardamom"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Dietary</label>
              <button
                type="button"
                onClick={() => setNewItemVeg(!newItemVeg)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  newItemVeg
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${newItemVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                {newItemVeg ? "Pure Veg" : "Non-Veg"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            + Add to Menu
          </button>
        </form>
      </div>

      {/* Item List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Current Menu Items ({items.length})</h2>
        {items.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs">
            No items in menu yet. Use the form above to add your first dish or beverage.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-3 h-3 rounded border ${
                      item.is_veg ? "border-emerald-500" : "border-red-500"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? "bg-emerald-500" : "bg-red-500"}`} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                    {item.desc && <p className="text-xs text-neutral-400">{item.desc}</p>}
                    <span className="text-[10px] text-neutral-500 font-mono mt-0.5 inline-block">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white font-mono">
                    {formatPaiseToRupees(item.price_paise)}
                  </span>
                  <button
                    onClick={() => handleToggleAvailable(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      item.available
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-neutral-800 text-neutral-500"
                    }`}
                  >
                    {item.available ? "Active" : "Hidden"}
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-red-400 text-xs transition-colors"
                    aria-label="Delete item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outbound Delivery Links Configuration */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h2 className="text-base font-semibold text-white">Outbound Delivery Links (Optional)</h2>
        <p className="text-xs text-neutral-400">
          Provide links to your Zomato or Swiggy listings to let customers order directly through their preferred apps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Zomato Restaurant Link</label>
            <input
              type="url"
              value={zomatoUrl}
              onChange={(e) => setZomatoUrl(e.target.value)}
              placeholder="https://www.zomato.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Swiggy Restaurant Link</label>
            <input
              type="url"
              value={swiggyUrl}
              onChange={(e) => setSwiggyUrl(e.target.value)}
              placeholder="https://www.swiggy.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
