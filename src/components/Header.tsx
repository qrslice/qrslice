'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { INITIAL_PRODUCTS, ShopProduct } from '@/lib/shop-service';
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Heart,
  ArrowRight,
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const searchResults: ShopProduct[] = searchQuery.trim().length >= 2
    ? INITIAL_PRODUCTS.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isProductsActive =
    pathname.startsWith('/products') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/shop');

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* 1. Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <BrandLogo href="/" size="md" />
          </div>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/products"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isProductsActive
                  ? 'text-purple-700 bg-purple-100/70 shadow-xs'
                  : 'text-slate-700 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <span>Products</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            </Link>

            <Link
              href="/products?category=google-review"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors"
            >
              Google Reviews
            </Link>

            <Link
              href="/products?category=business-cards"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors"
            >
              Business Cards
            </Link>

            <Link
              href="/tools"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/tools')
                  ? 'text-purple-700 bg-purple-50'
                  : 'text-slate-700 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Free QR Tools</span>
            </Link>

            <Link
              href="/bulk-orders"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors"
            >
              Bulk & Corporate
            </Link>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onBlur={() => setTimeout(() => setResourcesOpen(false), 200)}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <span>Features & Tools</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <Link
                    href="/demo/tap-simulator"
                    className="block px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                  >
                    ⚡ Virtual NFC Tap Simulator
                  </Link>
                  <Link
                    href="/compare"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    📐 Materials Spec Comparison
                  </Link>
                  <Link
                    href="/track-order"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    📦 Track Manufacturing Status
                  </Link>
                  <Link
                    href="/bulk-orders"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    🏢 Corporate Multi-Customizer
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <Link
                    href="/about"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    About QrSlice
                  </Link>
                  <Link
                    href="/faq"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    Frequently Asked Questions
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    Contact & Inquiries
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Search Bar with Live Suggestions */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products (e.g. review standee, NFC card...)"
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200/90 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            {/* Live Autocomplete Popover */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] font-bold text-slate-500 px-3">
                  <span>Suggested Products</span>
                  <span>{searchResults.length} matches</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="p-2.5 flex items-center gap-3 hover:bg-purple-50/60 transition group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-400 capitalize">{p.categorySlug.replace(/-/g, ' ')}</p>
                      </div>
                      <span className="text-xs font-black text-purple-700 shrink-0">
                        ₹{(p.basePricePaise / 100).toLocaleString('en-IN')}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                  className="p-2.5 bg-slate-50 hover:bg-purple-50 text-center block text-xs font-bold text-purple-700 border-t border-slate-100 transition flex items-center justify-center gap-1.5"
                >
                  <span>View all results for &quot;{searchQuery}&quot;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* 4. Right Controls (Account, Wishlist, Cart, Mobile Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Account Action */}
            <div className="flex items-center">
              <Show when="signed-in">
                <div className="flex items-center gap-2">
                  <Link
                    href="/account/orders"
                    className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition"
                  >
                    My Orders
                  </Link>
                  <UserButton />
                </div>
              </Show>
              <Show when="signed-out">
                <div className="flex items-center gap-1.5">
                  <SignInButton mode="modal">
                    <button
                      className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-1.5 text-sm font-semibold"
                      title="Sign In / Account"
                    >
                      <User className="w-5 h-5 text-slate-600" />
                      <span className="hidden sm:inline">Sign In</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors text-xs font-semibold shadow-xs"
                      title="Create Account"
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </Show>
            </div>

            {/* Wishlist Trigger */}
            <Link
              href="/account/wishlist"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-all group"
              aria-label={`Wishlist with ${wishlistCount} items`}
              title="Saved to Wishlist"
            >
              <Heart className="w-5 h-5 transition-transform group-hover:scale-105 text-slate-700 group-hover:text-rose-500" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[11px] font-extrabold flex items-center justify-center shadow-xs animate-in zoom-in-50">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger with Live Badge */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-all group"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-105 text-slate-800" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full text-[11px] font-extrabold flex items-center justify-center shadow-xs animate-in zoom-in-50">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Mobile Links */}
          <div className="flex flex-col space-y-1 pt-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-purple-700 bg-purple-50 flex items-center justify-between"
            >
              <span>Explore Products</span>
              <span className="text-xs">→</span>
            </Link>
            <Link
              href="/products?category=google-review"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Google Review Standees
            </Link>
            <Link
              href="/products?category=business-cards"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Smart Business Cards
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Bulk & Corporate Orders
            </Link>
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-bold text-purple-700 bg-purple-50/60 hover:bg-purple-50 flex items-center justify-between"
            >
              <span>🛠️ Free QR Code Tools</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-extrabold">NEW</span>
            </Link>
            <Link
              href="/activate"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Activate Received Card
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              My Order History
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              FAQ & Help Center
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
