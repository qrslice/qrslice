import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartDrawer } from "@/components/shop/CartDrawer";

export const metadata: Metadata = {
  title: "QrSlice — Smart NFC & QR Products for Modern Businesses",
  description: "Boost reviews. Grow your social media. Enable payments. All with beautiful, ready-to-use QR & NFC products from QrSlice.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/app-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-purple-100 selection:text-purple-900">
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