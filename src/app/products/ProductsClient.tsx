'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductCard } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { INITIAL_PRODUCTS, CATEGORIES, ShopProduct } from '@/lib/shop-service';
import { SlidersHorizontal, X, Star, ChevronDown, RotateCcw } from 'lucide-react';

export function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL search query & category
  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategory ? [urlCategory] : []
  );
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Sync category changes from URL
  React.useEffect(() => {
    setSelectedCategories(urlCategory ? [urlCategory] : []);
  }, [urlCategory]);

  // Sync category changes from CategoryNav
  const handleCategoryNavSelect = (slug: string) => {
    if (selectedCategories.length === 1 && selectedCategories[0] === slug) {
      setSelectedCategories([]);
      router.replace('/products', { scroll: false });
    } else {
      setSelectedCategories([slug]);
      router.replace(`/products?category=${slug}`, { scroll: false });
    }
  };

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      if (selectedCategories.length === 1) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(selectedCategories.filter((c) => c !== slug));
      }
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const toggleMaterial = (mat: string) => {
    if (selectedMaterials.includes(mat)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== mat));
    } else {
      setSelectedMaterials([...selectedMaterials, mat]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(2000);
    setMinRating(null);
    setSelectedMaterials([]);
    setSelectedColor(null);
    setSortBy('popularity');
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    maxPrice < 2000 ||
    minRating !== null ||
    selectedMaterials.length > 0 ||
    selectedColor !== null;

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let prods = [...INITIAL_PRODUCTS];

    // 1. Text Search
    if (urlSearch.trim()) {
      const q = urlSearch.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q)
      );
    }

    // 2. Categories
    if (selectedCategories.length > 0) {
      prods = prods.filter((p) => selectedCategories.includes(p.categorySlug));
    }

    // 3. Price
    prods = prods.filter((p) => p.basePricePaise / 100 <= maxPrice);

    // 4. Rating
    if (minRating !== null) {
      prods = prods.filter((p) => p.rating >= minRating);
    }

    // 5. Material
    if (selectedMaterials.length > 0) {
      prods = prods.filter((p) => selectedMaterials.includes(p.material));
    }

    // 6. Color
    if (selectedColor !== null) {
      prods = prods.filter((p) => p.color === selectedColor);
    }

    // 7. Sorting
    switch (sortBy) {
      case 'price-asc':
        prods.sort((a, b) => a.basePricePaise - b.basePricePaise);
        break;
      case 'price-desc':
        prods.sort((a, b) => b.basePricePaise - a.basePricePaise);
        break;
      case 'rating':
        prods.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        prods.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popularity':
      default:
        prods.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return prods;
  }, [
    urlSearch,
    selectedCategories,
    maxPrice,
    minRating,
    selectedMaterials,
    selectedColor,
    sortBy,
  ]);

  // Active Category Title
  const activeCategoryTitle = useMemo(() => {
    if (selectedCategories.length === 1) {
      const cat = CATEGORIES.find((c) => c.slug === selectedCategories[0]);
      return cat?.name || 'Catalog Products';
    }
    if (urlSearch) {
      return `Search results for "${urlSearch}"`;
    }
    return 'All Products';
  }, [selectedCategories, urlSearch]);

  const activeCategoryDescription = useMemo(() => {
    if (selectedCategories.length === 1) {
      const cat = CATEGORIES.find((c) => c.slug === selectedCategories[0]);
      return cat?.description || 'Browse high-quality NFC and QR products.';
    }
    return 'Browse our complete catalog of smart NFC and QR hardware products.';
  }, [selectedCategories]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Horizontal Category Selector */}
        <section>
          <CategoryNav
            activeCategorySlug={
              selectedCategories.length === 1 ? selectedCategories[0] : undefined
            }
            onSelectCategory={handleCategoryNavSelect}
          />
        </section>

        {/* 2-Column Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* ================= LEFT SIDEBAR: FILTERS ================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs sticky top-24">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">Filters</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 transition"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Category Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Category
              </h4>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer font-medium select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => toggleCategory(cat.slug)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 accent-purple-600"
                    />
                    <span>{cat.shortName}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Price Range Filter */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Price Range
                </h4>
                <span className="text-xs font-bold text-purple-700">
                  Up to ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>₹0</span>
                <span>₹2,000</span>
              </div>
            </div>

            {/* 3. Rating Filter */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Rating
              </h4>
              <div className="space-y-2">
                {[
                  { val: 4.5, stars: 5, label: '4.5 & above' },
                  { val: 4.0, stars: 4, label: '4.0 & above' },
                  { val: 3.5, stars: 3, label: '3.5 & above' },
                ].map((r) => (
                  <label
                    key={r.val}
                    className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={minRating === r.val}
                      onChange={() => setMinRating(minRating === r.val ? null : r.val)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 accent-purple-600"
                    />
                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-slate-700 ml-1">{r.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Material Filter */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Material
              </h4>
              <div className="space-y-2">
                {['Acrylic', 'Wooden', 'PVC', 'Metal'].map((mat) => (
                  <label
                    key={mat}
                    className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer font-medium select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(mat)}
                      onChange={() => toggleMaterial(mat)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 accent-purple-600"
                    />
                    <span>{mat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Color Swatches Filter */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Color
              </h4>
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { name: 'black', hex: '#18181b', border: 'border-slate-800' },
                  { name: 'white', hex: '#ffffff', border: 'border-slate-300' },
                  { name: 'purple', hex: '#7c3aed', border: 'border-purple-600' },
                  { name: 'blue', hex: '#3b82f6', border: 'border-blue-600' },
                  { name: 'pink', hex: '#ec4899', border: 'border-pink-500' },
                  { name: 'gold', hex: '#d97706', border: 'border-amber-600' },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() =>
                      setSelectedColor(selectedColor === c.name ? null : c.name)
                    }
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      c.border
                    } ${
                      selectedColor === c.name
                        ? 'ring-2 ring-purple-600 scale-125'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* ================= RIGHT MAIN AREA: PRODUCTS GRID ================= */}
          <div className="lg:col-span-9 space-y-6">
            {/* Header with Title & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeCategoryTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {activeCategoryDescription}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                  <span>Filters</span>
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600 cursor-pointer shadow-xs"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center text-2xl">
                  🔍
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No products found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No products matched your active filters. Try adjusting your price slider or clearing category selections.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white h-full p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Category</h4>
                {CATEGORIES.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => toggleCategory(cat.slug)}
                      className="accent-purple-600"
                    />
                    <span>{cat.shortName}</span>
                  </label>
                ))}
              </div>

              {/* Price */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  Price: Up to ₹{maxPrice}
                </h4>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Material */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Material</h4>
                {['Acrylic', 'Wooden', 'PVC', 'Metal'].map((m) => (
                  <label key={m} className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(m)}
                      onChange={() => toggleMaterial(m)}
                      className="accent-purple-600"
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
