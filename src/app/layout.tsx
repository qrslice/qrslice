import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartDrawer } from "@/components/shop/CartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL("https://qrslice.com"),
  title: {
    default: "QRslice — The Restaurant & Retail QR Layer",
    template: "%s | QRslice",
  },
  description: "Commercial-grade laser-etched NFC tap standees, luxury business cards, Google review collectors, and smart displays for modern Indian businesses.",
  openGraph: {
    title: "QRslice — Commercial NFC & QR Hardware for Indian Businesses",
    description: "Turn every in-person customer into a 5-star Google review. Precision acrylic and metal tap standees with free cloud link management.",
    url: "https://qrslice.com",
    siteName: "QRslice",
    images: [
      {
        url: "/hero/hero-products.png",
        width: 1200,
        height: 630,
        alt: "QRslice Commercial NFC and QR Hardware",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRslice — Commercial NFC & QR Hardware for Indian Businesses",
    description: "Turn every in-person customer into a 5-star Google review. Precision acrylic and metal tap standees with free cloud link management.",
    images: ["/hero/hero-products.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/app-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0728",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-violet-600 selection:text-white">
        <ClerkProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </WishlistProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}