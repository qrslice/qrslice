'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Coupon, calculateOrderTotals, validateCoupon } from './shop-service';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  itemCount: number;
  totalItems: number;
  couponCode: string;
  appliedCoupon?: Coupon;
  couponError?: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'qrslice_cart_v1';
const COUPON_STORAGE_KEY = 'qrslice_coupon_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponError, setCouponError] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        setCouponCode(storedCoupon);
      }
    } catch {
      // Ignore storage read errors
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      if (couponCode) {
        localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore storage write errors
    }
  }, [items, couponCode, isLoaded]);

  const addItem = (itemData: Omit<CartItem, 'id'>) => {
    const id = `${itemData.productId}-${itemData.finish.id}-${itemData.customBusinessName}`.toLowerCase().replace(/\s+/g, '-');
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + itemData.quantity } : i
        );
      }
      return [...prev, { ...itemData, id }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setCouponError(undefined);
  };

  const applyCoupon = (code: string): boolean => {
    const currentSubtotal = items.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0);
    const result = validateCoupon(code, currentSubtotal);
    if (!result.valid) {
      setCouponError(result.error);
      return false;
    }
    setCouponCode(code.trim().toUpperCase());
    setCouponError(undefined);
    return true;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponError(undefined);
  };

  const { subtotalPaise, discountPaise, shippingPaise, totalPaise, appliedCoupon } =
    calculateOrderTotals(items, couponCode);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        subtotalPaise,
        discountPaise,
        shippingPaise,
        totalPaise,
        itemCount,
        totalItems: itemCount,
        couponCode,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
