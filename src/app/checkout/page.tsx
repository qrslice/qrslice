'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/lib/cart-context';
import { ShippingAddress } from '@/lib/shop-service';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPaise, discountPaise, couponCode, appliedCoupon, shippingPaise, totalPaise, clearCart } = useCart();

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const [gstin, setGstin] = useState('');
  const [businessLegalName, setBusinessLegalName] = useState('');
  const [showGstSection, setShowGstSection] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi NCR', 'Chandigarh'
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add items before checking out.');
      return;
    }

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.pincode
    ) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (gstin.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase())) {
      setErrorMessage('Please enter a valid 15-character Indian GSTIN (e.g. 27AABCU9603R1ZM).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          address: formData,
          couponCode: couponCode || undefined,
          gstin: gstin.trim() ? gstin.trim().toUpperCase() : undefined,
          businessLegalName: businessLegalName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to initialize payment.');
        setIsSubmitting(false);
        return;
      }

      // Check if Razorpay script is available or load it
      const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !(window as any).Razorpay) {
        setErrorMessage('Failed to load Razorpay payment gateway SDK. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      if (!data.razorpayKeyId) {
        setErrorMessage('Payments are not configured on this store. Contact support.');
        setIsSubmitting(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: data.razorpayKeyId,
        amount: data.totalPaise,
        currency: data.currency || 'INR',
        name: 'QRslice',
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customer?.name || formData.fullName,
          email: data.customer?.email || formData.email,
          contact: data.customer?.phone || formData.phone,
        },
        theme: { color: '#9333ea' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/shop/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderNumber: data.orderNumber,
                razorpayOrderId: response.razorpay_order_id || data.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              setErrorMessage(verifyData.error || 'Payment signature verification failed.');
              setIsSubmitting(false);
              return;
            }

            clearCart();
            router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
          } catch {
            setErrorMessage('Failed to verify payment with server.');
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      });
      rzp.open();
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Your cart is currently empty</h1>
          <p className="text-xs text-slate-500 mb-6">
            Please select custom NFC standees or cards to proceed with checkout.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm"
          >
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Shipping
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your shipping address for laser engraving & Pan-India express dispatch.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: ADDRESS & DETAILS ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>1. Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vikram@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Phone (10-digit mobile) *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-xs text-slate-600 font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>2. Delivery Address (India)</span>
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Address Line 1 (Building, Street) *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Shop #12, Ground Floor, Linking Road"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Address Line 2 (Landmark, Suite - optional)</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Opposite City Mall"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium cursor-pointer"
                    >
                      {indianStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="400050"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Business Billing Details (Optional) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>3. Business Billing Details (Optional)</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowGstSection(!showGstSection)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
                >
                  {showGstSection ? '− Hide' : '+ Add Business / Tax Ref'}
                </button>
              </div>

              {showGstSection ? (
                <div className="space-y-3 pt-1">
                  <p className="text-[11px] text-slate-500">
                    Add your business entity name or tax identifier for your internal expense voucher. (Note: QRslice is an unregistered entity; supplies are exempt from GST).
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Business / Entity Name</label>
                      <input
                        type="text"
                        value={businessLegalName}
                        onChange={(e) => setBusinessLegalName(e.target.value)}
                        placeholder="e.g. Blue Tokai Cafe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Buyer GSTIN / Tax ID (For Reference)</label>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        placeholder="Optional tax identifier"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 font-mono font-bold uppercase"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Are you a cafe, restaurant, or business? Click &quot;Add Business / Tax Ref&quot; above to include your business name on the receipt.
                </p>
              )}
            </div>

            {/* Payment Method Notice */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-slate-900">Razorpay Payment Gateway:</span> Supports UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards, NetBanking, and Wallets.
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 sticky top-24">
            <h2 className="text-base font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-500 font-semibold">{items.length} items</span>
            </h2>

            {/* Item list snapshot */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span>🏷️</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-[180px]">{item.title}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity} · {item.finish?.name}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 whitespace-nowrap">
                    ₹{((item.unitPricePaise * item.quantity) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="text-slate-900 font-bold">₹{(subtotalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                  <span>-₹{(discountPaise / 100).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Express Pan-India Delivery</span>
                <span>
                  {shippingPaise === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${(shippingPaise / 100).toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Setup</span>
                <span className="font-bold text-slate-700">₹0 (Unregistered)</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-black text-slate-900">
                <span>Payable Total</span>
                <span className="text-purple-700">₹{(totalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-98"
            >
              {isSubmitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order & Pay · ₹{(totalPaise / 100).toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Razorpay 256-Bit SSL Encrypted Payment</span>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
