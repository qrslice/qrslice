import { z } from 'zod';

export type VerticalType = 'all' | 'retail' | 'salons' | 'clinics' | 'gyms' | 'cafes' | 'corporate';
export type CategoryType = 'standees' | 'cards' | 'plaques' | 'tags' | 'google-review' | 'business-cards' | 'social-media' | 'upi-payments' | 'menu-ordering' | 'custom-products' | 'gifts-lifestyle' | 'bulk-orders';

export interface CategoryInfo {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  image: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'cards',
    slug: 'cards',
    name: 'Google Review Cards',
    shortName: 'Review Cards',
    description: 'Pocket and counter tap cards for instant contactless Google reviews.',
    icon: '💳',
    image: '/products/nfc-google-review-card.png',
  },
  {
    id: 'business-cards',
    slug: 'business-cards',
    name: 'Digital Business Cards',
    shortName: 'Business Cards',
    description: 'Smart NFC business cards that share your contacts and socials with one tap.',
    icon: '💼',
    image: '/categories/business-cards.png',
  },
  {
    id: 'google-review',
    slug: 'google-review',
    name: 'Table & Counter Standees',
    shortName: 'Standees',
    description: 'Durable acrylic and solid wooden display stands for counters and tables.',
    icon: '⭐',
    image: '/categories/google-review.png',
  },
  {
    id: 'combos',
    slug: 'combos',
    name: 'Multi-Action Combos',
    shortName: 'Combos',
    description: '2-in-1 and 3-in-1 dual displays (Reviews + UPI Payments + Social Follow).',
    icon: '⚡',
    image: '/products/google-review-combo-pack.png',
  },
  {
    id: 'upi-payments',
    slug: 'upi-payments',
    name: 'UPI & Payment Displays',
    shortName: 'UPI Displays',
    description: 'Premium dual UPI QR stands and stainless steel plates for PhonePe, GPay, Paytm.',
    icon: '💸',
    image: '/categories/upi-payments.png',
  },
  {
    id: 'bulk-orders',
    slug: 'bulk-orders',
    name: 'Bulk & Corporate Packs',
    shortName: 'Bulk Packs',
    description: 'Wholesale starter kits for multi-table restaurants and corporate teams.',
    icon: '📦',
    image: '/categories/bulk-orders.png',
  },
  {
    id: 'accessories',
    slug: 'accessories',
    name: 'Mounts & Accessories',
    shortName: 'Accessories',
    description: 'Wall and mirror mount plates, adhesive table pucks, and durable tags.',
    icon: '🔧',
    image: '/products/metal-google-review-plate.png',
  },
];

export interface FinishOption {
  id: string;
  name: string;
  priceModifierPaise: number;
  previewColor: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface ShopProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: CategoryType;
  categorySlug: string;
  vertical: VerticalType;
  basePricePaise: number;
  originalPricePaise?: number;
  rating: number;
  reviewCount: number;
  material: 'Acrylic' | 'Wooden' | 'PVC' | 'Metal';
  color: 'black' | 'white' | 'purple' | 'blue' | 'pink' | 'gold';
  image: string;
  badge?: string;
  badgeColor?: string;
  finishes: FinishOption[];
  features: string[];
  reviews?: ProductReview[];
  isFeatured?: boolean;
  nfcSupport?: boolean;
  qrSupport?: boolean;
  isCustomizable?: boolean;
  customizationZones?: CustomizationZoneConfig;
}

export interface CustomizationZoneConfig {
  nameZone?: {
    topPercent: number;
    leftPercent: number;
    widthPercent: number;
    maxFontSizePx?: number;
    textAlign?: 'center' | 'left' | 'right';
    textColor?: string;
  };
  logoZone?: {
    topPercent: number;
    leftPercent: number;
    widthPercent: number;
    heightPercent?: number;
  };
  qrZone?: {
    topPercent: number;
    leftPercent: number;
    widthPercent: number;
    heightPercent?: number;
  };
  previewType?: 'standee' | 'card' | 'plate' | 'combo';
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image?: string;
  quantity: number;
  unitPricePaise: number;
  finish: FinishOption;
  customBusinessName: string;
  customLogoUrl?: string;
  qrUrl?: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountPaise?: number;
  freeShipping?: boolean;
  minOrderPaise?: number;
  description: string;
}

export const VALID_COUPONS: Record<string, Coupon> = {
  WELCOME10: {
    code: 'WELCOME10',
    discountPercent: 10,
    description: '10% off your entire order',
  },
  BULK20: {
    code: 'BULK20',
    discountPercent: 20,
    minOrderPaise: 200000, // ₹2,000
    description: '20% off on orders above ₹2,000',
  },
  FREESHIP: {
    code: 'FREESHIP',
    freeShipping: true,
    description: 'Free express shipping anywhere in India',
  },
};

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian phone number'),
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit PIN code'),
});

export const CustomizerSchema = z.object({
  productId: z.string().min(1),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(50),
  finishId: z.string().min(1),
  quantity: z.number().int().min(1).max(500),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

const RAW_PRODUCTS: ShopProduct[] = [
  // ================= 1. GOOGLE REVIEW PRODUCTS =================
  {
    id: 'prod-standee-acrylic',
    title: 'Acrylic Google Review Standee (NFC + QR)',
    slug: 'acrylic-google-review-standee',
    description: 'High-gloss acrylic counter standee with embedded high-frequency NTAG213 NFC chip and laser-etched QR code. Boost 5-star Google reviews instantly at checkout.',
    shortDescription: 'High-gloss acrylic counter standee with NFC tap & scan QR',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'all',
    basePricePaise: 49900,
    originalPricePaise: 69900,
    rating: 4.8,
    reviewCount: 124,
    material: 'Acrylic',
    color: 'white',
    image: '/products/acrylic-google-review-standee.png',
    badge: 'Cast Acrylic',
    badgeColor: 'purple',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'acrylic-clear', name: 'Ultra-Clear Gloss Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'acrylic-matte-black', name: 'Matte Obsidian Black', priceModifierPaise: 10000, previewColor: '#18181b' },
      { id: 'acrylic-frosted', name: 'Frosted Glass Finish', priceModifierPaise: 5000, previewColor: '#e4e4e7' },
    ],
    features: [
      'Built-in NTAG213 NFC chip (100,000+ tap durability)',
      'High-contrast scan QR code for all smartphones',
      'Direct link to your official Google Review dialog',
      'No battery or app required — instant native popup',
      'Custom branded with your business name & logo',
    ],
    reviews: [
      { id: 'rev-1', author: 'Vikram Mehta', rating: 5, date: '2 days ago', comment: 'Our Google reviews doubled within 2 weeks of placing this on the billing counter! Customers love the tap feature.', verifiedPurchase: true },
      { id: 'rev-2', author: 'Neha Kapoor', rating: 5, date: '1 week ago', comment: 'High quality acrylic, clean laser engraving. Looks extremely premium in our salon.', verifiedPurchase: true },
      { id: 'rev-3', author: 'Chef Anand', rating: 4, date: '2 weeks ago', comment: 'Very durable and waterproof. Survived multiple cafe drink spills easily.', verifiedPurchase: true },
    ],
  },
  {
    id: 'prod-combo-review-instagram',
    title: '2-in-1 Dual Standee (Google Review + Instagram Follow)',
    slug: 'combo-review-instagram-standee',
    description: 'Dual-action premium acrylic counter standee featuring side-by-side Google Review tap and Instagram profile QR. Customers can leave a 5-star review and follow your Instagram with zero friction at checkout.',
    shortDescription: 'Dual 2-in-1 acrylic counter standee: Google Review + Instagram',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'all',
    basePricePaise: 59900,
    originalPricePaise: 89900,
    rating: 4.9,
    reviewCount: 168,
    material: 'Acrylic',
    color: 'white',
    image: '/products/instagram-follow-acrylic-standee.png',
    badge: '2-in-1 Dual',
    badgeColor: 'purple',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'dual-acrylic-gloss', name: 'Ultra-Clear Gloss Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'dual-acrylic-matte-black', name: 'Matte Obsidian Black', priceModifierPaise: 10000, previewColor: '#18181b' },
      { id: 'dual-acrylic-frosted', name: 'Frosted Glass Finish', priceModifierPaise: 5000, previewColor: '#e4e4e7' },
    ],
    features: [
      'Dual QR & NFC zones: 5-Star Google Review + Instagram Follow',
      'Embedded NTAG213 NFC chip for 1-tap iPhone and Android popup',
      'Diamond-polished 3mm cast acrylic with stable self-standing base',
      'Custom branded with your business logo and handle',
      'Waterproof, UV-protected, wipe-clean counter surface',
    ],
    reviews: [
      { id: 'c-rev-1', author: 'Rohan Sharma', rating: 5, date: '1 day ago', comment: 'Our cafe gained 300+ real local Instagram followers and 50+ Google reviews in our first month with this standee!', verifiedPurchase: true },
      { id: 'c-rev-2', author: 'Pooja Bhatt', rating: 5, date: '1 week ago', comment: 'Looks super clean on our reception counter. Customers love scanning the Instagram QR while waiting for their bill.', verifiedPurchase: true },
    ],
  },
  {
    id: 'prod-combo-review-upi-instagram',
    title: '3-in-1 Triple Counter Standee (Review + UPI Payment + Instagram)',
    slug: 'combo-review-upi-instagram-standee',
    description: 'All-in-one countertop powerhouse combining Google Review NFC tap, dynamic all-bank UPI QR (GPay, PhonePe, Paytm, BHIM), and Instagram Follow QR. Replaces counter clutter with a single clean, high-converting display.',
    shortDescription: '3-in-1 Acrylic Standee: Google Review + UPI Payment + Instagram',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'all',
    basePricePaise: 69900,
    originalPricePaise: 99900,
    rating: 4.9,
    reviewCount: 214,
    material: 'Acrylic',
    color: 'purple',
    image: '/products/upi-payment-qr-standee.png',
    badge: '3-in-1 Multi',
    badgeColor: 'amber',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'tri-acrylic-gloss', name: 'Ultra-Clear Gloss Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'tri-acrylic-matte-black', name: 'Matte Obsidian Black', priceModifierPaise: 10000, previewColor: '#18181b' },
    ],
    features: [
      '3 Dedicated Zones: Google Review + UPI QR + Instagram QR',
      'Embedded NTAG213 NFC chip for instant 1-tap Google Review dialog',
      'Zero-fee UPI QR works with PhonePe, Google Pay, Paytm & BHIM',
      'Heavy-duty anti-slip rubber padded base included',
      'Replaces 3 separate counter displays with one premium branded unit',
    ],
    reviews: [
      { id: 't-rev-1', author: 'Karan Singhal', rating: 5, date: '3 days ago', comment: 'Replaced our messy paper UPI QR stand and Google card with this single piece. Looks 10x more professional.', verifiedPurchase: true },
      { id: 't-rev-2', author: 'Meera Iyer', rating: 5, date: '2 weeks ago', comment: 'Payments and reviews both happen seamlessly. Solid acrylic build.', verifiedPurchase: true },
    ],
  },
  {
    id: 'prod-wall-mirror-nfc-plate',
    title: 'Wall & Mirror Mount NFC Review Plate (100x100mm)',
    slug: 'wall-mirror-nfc-review-plate',
    description: 'Compact 100mm × 100mm square acrylic plate with high-strength pre-applied 3M VHB mounting tape. Designed for salon mirrors, clinic doors, gym fitness stations, and vanity mirrors where counter space is limited.',
    shortDescription: '3M adhesive-backed acrylic wall & mirror plate with NFC + QR',
    category: 'plaques',
    categorySlug: 'google-review',
    vertical: 'salons',
    basePricePaise: 39900,
    originalPricePaise: 59900,
    rating: 4.8,
    reviewCount: 82,
    material: 'Acrylic',
    color: 'white',
    image: '/products/metal-google-review-plate.png',
    badge: 'Wall Mount',
    badgeColor: 'cyan',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'plate-gloss-white', name: 'Gloss White Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'plate-frosted-glass', name: 'Frosted Glass Finish', priceModifierPaise: 5000, previewColor: '#e4e4e7' },
      { id: 'plate-matte-black', name: 'Matte Obsidian Black', priceModifierPaise: 5000, previewColor: '#18181b' },
    ],
    features: [
      'Pre-applied 3M heavy-duty VHB foam tape adheres to glass, mirrors, tiles & wood',
      'Zero counter footprint — installs at eye level right where customers look',
      'Dual NFC tap & laser-sharp QR code scan',
      'Waterproof, humidity-resistant & wipe-clean',
      'Ideal for salons, clinics, fitting rooms and boutique mirrors',
    ],
    reviews: [
      { id: 'w-rev-1', author: 'Deepa Rao', rating: 5, date: '4 days ago', comment: 'Installed 6 of these on our salon mirrors. Clients tap with their phones right while getting their hair done!', verifiedPurchase: true },
    ],
  },
  {
    id: 'prod-standee-wooden-review',
    title: 'Wooden Google Review Standee (Premium)',
    slug: 'wooden-google-review-standee',
    description: 'Solid handcrafted beechwood counter stand with laser-engraved Google review branding and embedded NFC. Warm, sustainable aesthetic ideal for specialty cafes, boutiques & upscale restaurants.',
    shortDescription: 'Solid handcrafted wood with precision laser engraving',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'cafes',
    basePricePaise: 59900,
    originalPricePaise: 89900,
    rating: 4.7,
    reviewCount: 96,
    material: 'Wooden',
    color: 'gold',
    image: '/products/wooden-google-review-standee.png',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'wood-beech', name: 'Natural Beechwood', priceModifierPaise: 0, previewColor: '#d4b996' },
      { id: 'wood-walnut', name: 'Dark Walnut Finish', priceModifierPaise: 10000, previewColor: '#5c4033' },
    ],
    features: [
      'Eco-friendly solid wood construction',
      'Precision laser-engraved QR code and Google badge',
      'High-gain embedded NFC chip for instant smartphone tap',
      'Weighted base for stable checkout placement',
    ],
  },
  {
    id: 'prod-card-nfc-review',
    title: 'NFC Google Review Card (PVC Premium)',
    slug: 'nfc-google-review-card',
    description: 'Pocket-sized durable matte PVC card with embedded NFC chip and Google review QR code. Staff can present it to customers tableside or upon service completion.',
    shortDescription: 'Staff-ready handheld card for tableside review collection',
    category: 'cards',
    categorySlug: 'google-review',
    vertical: 'retail',
    basePricePaise: 29900,
    originalPricePaise: 49900,
    rating: 4.6,
    reviewCount: 72,
    material: 'PVC',
    color: 'black',
    image: '/products/nfc-google-review-card.png',
    badge: 'Matte PVC',
    badgeColor: 'purple',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'pvc-matte-black', name: 'Matte Black', priceModifierPaise: 0, previewColor: '#18181b' },
      { id: 'pvc-gloss-white', name: 'Gloss White', priceModifierPaise: 0, previewColor: '#ffffff' },
    ],
    features: [
      'Credit-card size fits in wallet or apron pocket',
      'Waterproof, scratch-resistant PVC with UV print',
      'Instant tap opens review screen on customer phone',
    ],
  },
  {
    id: 'prod-sticker-qr-review',
    title: 'Google Review QR Sticker (Weatherproof)',
    slug: 'google-review-qr-sticker',
    description: 'Heavy-duty 3M vinyl weatherproof sticker with vibrant UV printing. Perfect for windows, front doors, mirrors, takeout counters, and delivery packaging.',
    shortDescription: 'Weatherproof vinyl stickers with UV protection',
    category: 'tags',
    categorySlug: 'google-review',
    vertical: 'all',
    basePricePaise: 19900,
    originalPricePaise: 29900,
    rating: 4.5,
    reviewCount: 64,
    material: 'PVC',
    color: 'white',
    image: '/products/google-review-qr-sticker.png',
    badge: 'New',
    badgeColor: 'rose',
    isFeatured: false,
    nfcSupport: false,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'sticker-white', name: 'Standard Vinyl (3-pack)', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'sticker-transparent', name: 'Transparent Decal (3-pack)', priceModifierPaise: 5000, previewColor: '#e4e4e7' },
    ],
    features: [
      'Weatherproof & scratch-resistant vinyl adhesive',
      'High-contrast QR code scans under any lighting',
      'Leaves zero sticky residue upon removal',
    ],
  },
  {
    id: 'prod-plate-metal-review',
    title: 'Metal Google Review Plate (Silver)',
    slug: 'metal-google-review-plate',
    description: 'Architectural brushed stainless steel plate with laser-annealed Google review QR and NFC antenna. Premium desk presence for law firms, medical clinics, and luxury showrooms.',
    shortDescription: 'Brushed stainless steel desk plaque with laser engraving',
    category: 'plaques',
    categorySlug: 'google-review',
    vertical: 'clinics',
    basePricePaise: 89900,
    originalPricePaise: 129900,
    rating: 4.8,
    reviewCount: 58,
    material: 'Metal',
    color: 'white',
    image: '/products/metal-google-review-plate.png',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'metal-silver', name: 'Brushed Silver Steel', priceModifierPaise: 0, previewColor: '#cbd5e1' },
      { id: 'metal-gold', name: 'Brushed Champagne Gold', priceModifierPaise: 20000, previewColor: '#d97706' },
      { id: 'metal-matte-black', name: 'Anodized Matte Black', priceModifierPaise: 10000, previewColor: '#1e293b' },
    ],
    features: [
      'Heavy-gauge 1.2mm stainless steel',
      'Laser-annealed permanent QR markings',
      'Embedded high-gain NFC module',
      'Includes silicone non-scratch counter pads',
    ],
  },
  {
    id: 'prod-combo-review-pack',
    title: 'Google Review Combo Pack (Stand + Card + Sticker)',
    slug: 'google-review-combo-pack',
    description: 'The ultimate review acceleration bundle. Includes 1 Acrylic NFC Counter Standee, 1 Handheld PVC NFC Staff Card, and 2 Weatherproof Window Stickers.',
    shortDescription: 'Complete 4-piece kit: 1 Standee + 1 Card + 2 Stickers',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'all',
    basePricePaise: 129900,
    originalPricePaise: 179900,
    rating: 4.7,
    reviewCount: 142,
    material: 'Acrylic',
    color: 'black',
    image: '/products/google-review-combo-pack.png',
    badge: 'Combo Pack',
    badgeColor: 'purple',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'combo-standard', name: 'Standard Complete Kit', priceModifierPaise: 0, previewColor: '#18181b' },
    ],
    features: [
      'Covers counter, tableside, and storefront windows',
      'Save ₹500 compared to buying pieces separately',
      'Configured to the exact same Google Review link',
    ],
  },
  {
    id: 'prod-table-stand-review',
    title: 'Google Review Table Stand (Clear Acrylic)',
    slug: 'google-review-table-stand',
    description: 'Compact L-stand acrylic review display designed for restaurant tables, cafe bar seating, and salon stations without occupying valuable table space.',
    shortDescription: 'Compact L-stand acrylic display for tables & counters',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'cafes',
    basePricePaise: 44900,
    originalPricePaise: 69900,
    rating: 4.6,
    reviewCount: 88,
    material: 'Acrylic',
    color: 'white',
    image: '/products/google-review-table-stand.png',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'l-stand-clear', name: 'Clear Crystal Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
    ],
    features: [
      'Slanted viewing angle for effortless camera scan',
      'Dual NFC & QR technology',
      'Spill-proof and easy to wipe clean',
    ],
  },
  {
    id: 'prod-engraved-wooden-stand',
    title: 'Engraved Google Review Stand (Custom Text)',
    slug: 'engraved-google-review-stand',
    description: 'Customized natural beechwood table block with deeply engraved personalized business name, tagline, and live NFC Google review chip.',
    shortDescription: 'Natural beechwood block with customized engraved text',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'corporate',
    basePricePaise: 69900,
    originalPricePaise: 99900,
    rating: 4.8,
    reviewCount: 46,
    material: 'Wooden',
    color: 'gold',
    image: '/products/engraved-google-review-stand.png',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'engraved-natural', name: 'Natural Grain', priceModifierPaise: 0, previewColor: '#d4b996' },
    ],
    features: [
      'Deep 3D laser engraving of business name',
      'Embedded high-capacity NFC module',
      'Organic wax matte protective coating',
    ],
  },
  {
    id: 'prod-keychain-review',
    title: 'NFC Google Review Keychain',
    slug: 'nfc-google-review-keychain',
    description: 'Compact round epoxy NFC keychain tag for on-the-go professionals, home service contractors, drivers, and field technicians.',
    shortDescription: 'Pocket-sized NFC keychain for mobile service pros',
    category: 'tags',
    categorySlug: 'google-review',
    vertical: 'retail',
    basePricePaise: 34900,
    originalPricePaise: 49900,
    rating: 4.6,
    reviewCount: 73,
    material: 'PVC',
    color: 'black',
    image: '/products/nfc-google-review-keychain.png',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: false,
    isCustomizable: true,
    finishes: [
      { id: 'keychain-black', name: 'Gloss Black Epoxy', priceModifierPaise: 0, previewColor: '#18181b' },
    ],
    features: [
      'Sturdy stainless steel split ring',
      'IP68 100% waterproof construction',
      'Instant tap-to-review',
    ],
  },
  {
    id: 'prod-door-hanger-review',
    title: 'Google Review Door Hanger',
    slug: 'google-review-door-hanger',
    description: 'Frosted acrylic door handle sign with NFC and QR code. Ideal for hotel rooms, Airbnb hosts, fitting rooms, and clinic consultation rooms.',
    shortDescription: 'Acrylic handle display for hotel rooms & fitting areas',
    category: 'standees',
    categorySlug: 'google-review',
    vertical: 'salons',
    basePricePaise: 39900,
    originalPricePaise: 59900,
    rating: 4.5,
    reviewCount: 39,
    material: 'Acrylic',
    color: 'white',
    image: '/products/google-review-door-hanger.png',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'hanger-frosted', name: 'Frosted White Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
    ],
    features: [
      'Fits standard door handles and fixtures',
      'Dual NFC & QR review trigger',
      'Elegant modern hotelier aesthetic',
    ],
  },

  // ================= 2. DIGITAL BUSINESS CARDS =================
  {
    id: 'prod-card-pvc',
    title: 'NFC Business Card (PVC Premium)',
    slug: 'nfc-business-card-pvc',
    description: 'Matte black premium PVC smart business card with tap-to-share contact details (vCard), social links, and website. Never print paper business cards again.',
    shortDescription: 'Matte black PVC card with instant tap-to-save contact',
    category: 'cards',
    categorySlug: 'business-cards',
    vertical: 'corporate',
    basePricePaise: 29900,
    originalPricePaise: 49900,
    rating: 4.7,
    reviewCount: 96,
    material: 'PVC',
    color: 'black',
    image: '/products/nfc-business-card-pvc.png',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'pvc-matte-black', name: 'Stealth Matte Black', priceModifierPaise: 0, previewColor: '#18181b' },
      { id: 'pvc-gloss-white', name: 'Polar White', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'pvc-gradient-purple', name: 'QrSlice Royal Purple', priceModifierPaise: 5000, previewColor: '#7c3aed' },
    ],
    features: [
      'Instant vCard contact download directly into iPhone/Android',
      'Custom laser printing of your name and company logo',
      'Dynamic URL repointing anytime in owner portal',
      'Lifetime durability — no app or subscription required',
    ],
  },
  {
    id: 'prod-card-metal-luxury',
    title: 'Custom Matte Black Metal NFC Card',
    slug: 'matte-black-metal-nfc-card',
    description: 'Ultra-luxurious 0.8mm laser-engraved stainless steel card with matte black finish. Perfect for retail brand VIP cards, founders, doctors, and real estate professionals.',
    shortDescription: 'Aerospace stainless steel with precision laser engraving',
    category: 'cards',
    categorySlug: 'business-cards',
    vertical: 'corporate',
    basePricePaise: 99900,
    originalPricePaise: 149900,
    rating: 4.9,
    reviewCount: 84,
    material: 'Metal',
    color: 'black',
    image: '/products/nfc-business-card-pvc.png',
    badge: 'Matte Steel',
    badgeColor: 'amber',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'metal-matte-black', name: 'Matte Stealth Black', priceModifierPaise: 0, previewColor: '#09090b' },
      { id: 'metal-brushed-gold', name: 'Brushed Gold', priceModifierPaise: 20000, previewColor: '#d97706' },
      { id: 'metal-gunmetal', name: 'Gunmetal Silver', priceModifierPaise: 10000, previewColor: '#52525b' },
    ],
    features: [
      'Dual-frequency high-gain NFC antenna',
      '0.8mm aerospace stainless steel core',
      'Laser-etched custom logo and merchant branding',
      'Instant tap-to-save contact (vCard) or link to store',
      'Scratch-resistant PVD coating',
    ],
  },
  {
    id: 'prod-card-bamboo-eco',
    title: 'Eco Natural Bamboo NFC Business Card',
    slug: 'eco-bamboo-nfc-business-card',
    description: 'Sustainably crafted natural bamboo wood card with laser engraved typography and embedded NFC chip. Ideal for organic brands, architects, and sustainability leaders.',
    shortDescription: 'Organic natural bamboo wood with micro-NFC chip',
    category: 'cards',
    categorySlug: 'business-cards',
    vertical: 'cafes',
    basePricePaise: 79900,
    originalPricePaise: 119900,
    rating: 4.8,
    reviewCount: 42,
    material: 'Wooden',
    color: 'gold',
    image: '/categories/business-cards.png',
    badge: 'Solid Bamboo',
    badgeColor: 'emerald',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'bamboo-natural', name: 'Natural Bamboo', priceModifierPaise: 0, previewColor: '#d4b996' },
      { id: 'bamboo-walnut', name: 'Dark Walnut Wood', priceModifierPaise: 10000, previewColor: '#5c4033' },
    ],
    features: [
      '100% genuine biodegradable wood shell',
      'Precision laser-etched name and logo',
      'Waterproof embedded NTAG213 micro-antenna',
    ],
  },

  // ================= 3. SOCIAL MEDIA STANDEES =================
  {
    id: 'prod-standee-instagram',
    title: 'Instagram Follow Acrylic Standee',
    slug: 'instagram-follow-acrylic-standee',
    description: 'Vibrant arch acrylic Instagram standee with live QR code and NFC tap. Turn every visiting customer into an active Instagram follower effortlessly.',
    shortDescription: 'Vibrant arch acrylic standee to grow Instagram followers',
    category: 'standees',
    categorySlug: 'social-media',
    vertical: 'salons',
    basePricePaise: 49900,
    originalPricePaise: 69900,
    rating: 4.8,
    reviewCount: 88,
    material: 'Acrylic',
    color: 'pink',
    image: '/products/instagram-follow-acrylic-standee.png',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'insta-gloss', name: 'High-Gloss Acrylic', priceModifierPaise: 0, previewColor: '#e1306c' },
      { id: 'insta-frost', name: 'Frosted Glass Finish', priceModifierPaise: 5000, previewColor: '#fce7f3' },
    ],
    features: [
      'Launches Instagram app directly on user phone',
      'High-resolution Instagram gradient branding',
      'Dual NFC chip + high-contrast QR scan code',
      'Includes free customization with your @handle',
    ],
  },
  {
    id: 'prod-standee-multi-social',
    title: 'Multi-Platform 3-in-1 Social Media Stand',
    slug: 'multi-platform-3in1-social-stand',
    description: 'All-in-one counter display combining Instagram, Google Reviews, and WhatsApp on a single sleek acrylic arch. Maximize engagement without counter clutter.',
    shortDescription: 'Instagram + Google Reviews + WhatsApp on one stand',
    category: 'standees',
    categorySlug: 'social-media',
    vertical: 'retail',
    basePricePaise: 69900,
    originalPricePaise: 99900,
    rating: 4.9,
    reviewCount: 65,
    material: 'Acrylic',
    color: 'white',
    image: '/categories/social-media.png',
    badge: '3-in-1 Display',
    badgeColor: 'purple',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'multi-gloss', name: 'Gloss White Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'multi-black', name: 'Matte Obsidian Base', priceModifierPaise: 10000, previewColor: '#18181b' },
    ],
    features: [
      '3 distinct high-contrast QR scan zones',
      'Embedded central NFC tap beacon',
      'Custom printed with your exact social handles',
    ],
  },

  // ================= 4. UPI & PAYMENT DISPLAYS =================
  {
    id: 'prod-standee-upi',
    title: 'UPI Payment QR Standee (Dual UPI)',
    slug: 'upi-payment-qr-standee',
    description: 'Sleek counter display with dual QR integration for Google Pay, PhonePe, Paytm, and BHIM UPI. Keep your counter uncluttered while processing zero-friction payments.',
    shortDescription: 'Sleek counter display with dual QR integration for UPI',
    category: 'standees',
    categorySlug: 'upi-payments',
    vertical: 'retail',
    basePricePaise: 39900,
    originalPricePaise: 59900,
    rating: 4.6,
    reviewCount: 72,
    material: 'Acrylic',
    color: 'white',
    image: '/products/upi-payment-qr-standee.png',
    isFeatured: true,
    nfcSupport: false,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'upi-white-acrylic', name: 'White Gloss Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'upi-black-acrylic', name: 'Obsidian Black Acrylic', priceModifierPaise: 5000, previewColor: '#18181b' },
    ],
    features: [
      'Works with all Indian UPI apps (PhonePe, GPay, Paytm, Cred)',
      'Custom printed with your Merchant UPI ID and Merchant Name',
      'Heavy weighted base for busy retail counters',
      'Fade-resistant UV cured inks',
    ],
  },
  {
    id: 'prod-plate-metal-upi',
    title: 'Custom-Branded Stainless Steel UPI Payment Plate',
    slug: 'custom-metal-upi-payment-plate',
    description: 'Heavy duty 1.2mm brushed stainless steel UPI payment plate. Scratchproof, waterproof, and permanently laser-annealed for heavy footfall checkout counters.',
    shortDescription: 'Brushed stainless steel plate with laser-annealed UPI QR',
    category: 'plaques',
    categorySlug: 'upi-payments',
    vertical: 'retail',
    basePricePaise: 79900,
    originalPricePaise: 119900,
    rating: 4.8,
    reviewCount: 38,
    material: 'Metal',
    color: 'white',
    image: '/categories/upi-payments.png',
    badge: 'Stainless Steel',
    badgeColor: 'amber',
    isFeatured: false,
    nfcSupport: false,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'metal-steel', name: 'Brushed Silver Steel', priceModifierPaise: 0, previewColor: '#cbd5e1' },
      { id: 'metal-gold', name: 'Champagne Gold PVD', priceModifierPaise: 15000, previewColor: '#d97706' },
    ],
    features: [
      'Laser-annealed permanent markings that never fade or wipe off',
      'Weighted 450g steel base prevents counter slide',
      'Includes silicone non-scratch counter footpads',
    ],
  },

  // ================= 5. MENU & ORDERING STANDEES =================
  {
    id: 'prod-standee-menu-wooden',
    title: 'NFC Menu Standee (Wooden Premium)',
    slug: 'nfc-menu-standee-wooden',
    description: 'Round solid beechwood table standee with laser-etched fork & knife icon, embedded contactless NFC, and instant menu QR code. Elevated dining experience for modern cafes.',
    shortDescription: 'Round solid wood table standee with contactless menu tap',
    category: 'standees',
    categorySlug: 'menu-ordering',
    vertical: 'cafes',
    basePricePaise: 59900,
    originalPricePaise: 89900,
    rating: 4.8,
    reviewCount: 64,
    material: 'Wooden',
    color: 'gold',
    image: '/products/nfc-menu-standee-wooden.png',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'menu-wood-natural', name: 'Natural Beechwood', priceModifierPaise: 0, previewColor: '#d4b996' },
      { id: 'menu-wood-walnut', name: 'Dark Walnut Finish', priceModifierPaise: 10000, previewColor: '#5c4033' },
    ],
    features: [
      'Contactless digital menu viewing with zero app download',
      'Instant updates anytime via QrSlice dashboard',
      'Solid wood stand that resists spills and drops',
      'Supports restaurant table number numbering',
    ],
  },
  {
    id: 'prod-puck-menu-acrylic',
    title: 'Contactless Table QR Ordering Puck',
    slug: 'contactless-table-qr-ordering-puck',
    description: 'Ultra-slim 5mm crystal acrylic disc that adheres flat onto dining tables. Unobtrusive, spill-proof, and easy to wipe clean after every dining party.',
    shortDescription: 'Flat 5mm crystal acrylic disc for restaurant tables',
    category: 'tags',
    categorySlug: 'menu-ordering',
    vertical: 'cafes',
    basePricePaise: 29900,
    originalPricePaise: 44900,
    rating: 4.7,
    reviewCount: 51,
    material: 'Acrylic',
    color: 'white',
    image: '/categories/menu-ordering.png',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'puck-clear', name: 'Clear Crystal Acrylic', priceModifierPaise: 0, previewColor: '#ffffff' },
      { id: 'puck-black', name: 'Matte Obsidian Acrylic', priceModifierPaise: 5000, previewColor: '#18181b' },
    ],
    features: [
      'Industrial 3M adhesive backing adheres firmly to wood, marble, and glass',
      'Dual NFC micro-chip + high contrast QR code',
      'Customized with individual table numbers (Table 1 to Table 50)',
    ],
  },

  // ================= 6. CUSTOM PRODUCTS =================
  {
    id: 'prod-custom-acrylic-sign',
    title: 'Custom Laser-Cut Acrylic Logo Display',
    slug: 'custom-acrylic-logo-display',
    description: 'Custom-cut acrylic desktop display shaped or printed with your business emblem and high-gain NFC module. Premium desk art for reception counters.',
    shortDescription: 'Custom acrylic desktop display with brand logo & NFC',
    category: 'plaques',
    categorySlug: 'custom-products',
    vertical: 'corporate',
    basePricePaise: 79900,
    originalPricePaise: 119900,
    rating: 4.9,
    reviewCount: 34,
    material: 'Acrylic',
    color: 'purple',
    image: '/categories/custom-products.png',
    badge: 'Laser Cut',
    badgeColor: 'purple',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'custom-acrylic-standard', name: 'Custom Printed Acrylic', priceModifierPaise: 0, previewColor: '#7c3aed' },
    ],
    features: [
      'Tailored with your exact vector logo and brand color palette',
      'Embedded high-speed NFC module',
      'Polished beveled edges',
    ],
  },

  // ================= 7. GIFTS & LIFESTYLE =================
  {
    id: 'prod-keychain-photo',
    title: 'Personalized NFC Photo Keychain',
    slug: 'personalized-nfc-photo-keychain',
    description: 'Crystal-clear acrylic photo keychain featuring your favorite photo on the front and embedded NFC chip that opens a custom digital album, message, or playlist.',
    shortDescription: 'Crystal acrylic photo keychain with tap-to-open memory',
    category: 'tags',
    categorySlug: 'gifts-lifestyle',
    vertical: 'all',
    basePricePaise: 34900,
    originalPricePaise: 49900,
    rating: 4.7,
    reviewCount: 53,
    material: 'Acrylic',
    color: 'white',
    image: '/products/personalized-nfc-photo-keychain.png',
    isFeatured: true,
    nfcSupport: true,
    qrSupport: false,
    isCustomizable: true,
    finishes: [
      { id: 'keychain-clear-acrylic', name: 'Crystal Acrylic Framing', priceModifierPaise: 0, previewColor: '#ffffff' },
    ],
    features: [
      'Personal photo printed in vibrant photo-lab quality',
      'Embedded NFC chip links to Spotify song or photo gallery',
      'Durable stainless steel key ring included',
      'Heartfelt personalized gift for birthdays & anniversaries',
    ],
  },
  {
    id: 'prod-song-acrylic-plaque',
    title: 'Custom Spotify Song & Album Art NFC Plaque',
    slug: 'custom-spotify-song-nfc-plaque',
    description: 'Glass-like acrylic desk plaque with your favorite song album artwork, scannable audio code, and embedded NFC chip that instantly plays the song on Spotify when tapped.',
    shortDescription: 'Acrylic desk plaque that plays your favorite song on tap',
    category: 'plaques',
    categorySlug: 'gifts-lifestyle',
    vertical: 'all',
    basePricePaise: 59900,
    originalPricePaise: 89900,
    rating: 4.9,
    reviewCount: 78,
    material: 'Acrylic',
    color: 'black',
    image: '/categories/gifts-lifestyle.png',
    badge: 'Acrylic Plaque',
    badgeColor: 'rose',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'plaque-acrylic-woodbase', name: 'With Natural Beechwood Base', priceModifierPaise: 0, previewColor: '#d4b996' },
      { id: 'plaque-acrylic-ledbase', name: 'With Warm LED Light Base', priceModifierPaise: 20000, previewColor: '#fbbf24' },
    ],
    features: [
      'Instant tap-to-play Spotify music integration',
      'Vibrant UV printed photo and waveform graphics',
      'Includes solid wooden display stand',
    ],
  },

  // ================= 8. BULK ORDERS =================
  {
    id: 'prod-kit-restaurant-starter',
    title: 'Restaurant Starter Kit (10 Stands + 2 Staff Cards)',
    slug: 'restaurant-starter-kit',
    description: 'Complete hospitality phygital bundle: 10 Wooden NFC Menu Stands, 2 PVC Review Cards for floor managers, and 1 Google Review Counter Standee. Complete setup for full dining room.',
    shortDescription: 'Complete 13-piece bundle for dining rooms & bars',
    category: 'standees',
    categorySlug: 'bulk-orders',
    vertical: 'cafes',
    basePricePaise: 499900,
    originalPricePaise: 749900,
    rating: 4.9,
    reviewCount: 31,
    material: 'Wooden',
    color: 'gold',
    image: '/categories/bulk-orders.png',
    badge: '10-Table Kit',
    badgeColor: 'purple',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'kit-standard-hospitality', name: 'Full Hospitality Setup', priceModifierPaise: 0, previewColor: '#d4b996' },
    ],
    features: [
      'Equips up to 10 tables + checkout counter',
      'Save over ₹2,500 compared to individual products',
      'Coordinated laser engraving of restaurant logo',
      'Dedicated phone onboarding and menu digitizer support',
    ],
  },
  {
    id: 'prod-kit-corporate-cards',
    title: 'Corporate NFC Cards Bundle (Pack of 25)',
    slug: 'corporate-nfc-cards-bundle',
    description: 'Pack of 25 custom branded NFC business cards for your sales, leadership, or executive team. Uniform corporate identity with centralized directory management.',
    shortDescription: 'Pack of 25 custom branded smart cards for companies',
    category: 'cards',
    categorySlug: 'bulk-orders',
    vertical: 'corporate',
    basePricePaise: 599900,
    originalPricePaise: 899900,
    rating: 4.8,
    reviewCount: 22,
    material: 'PVC',
    color: 'black',
    image: '/categories/business-cards.png',
    badge: '25-Card Pack',
    badgeColor: 'blue',
    isFeatured: false,
    nfcSupport: true,
    qrSupport: true,
    isCustomizable: true,
    finishes: [
      { id: 'corp-matte-black', name: 'Corporate Matte Black', priceModifierPaise: 0, previewColor: '#18181b' },
    ],
    features: [
      'Full-color corporate logo on all 25 cards',
      'Individual names and designations printed per card',
      'Centralized employee contact management',
    ],
  },
];

export const INITIAL_PRODUCTS: ShopProduct[] = RAW_PRODUCTS.map((p) => ({
  ...p,
  rating: 0,
  reviewCount: 0,
  reviews: [],
  features: p.features.map((f) =>
    f
      .replace(/\s*\(\d+[\d,]*\+?\s*taps?[^)]*\)/gi, '')
      .replace(/\s*\(\d+[\d,]*\+?\s*tap\s+durability\)/gi, '')
      .replace(/\s*\(\d+[\d,]*\+?\s*tap\s+lifetime\)/gi, '')
  ),
}));

export function getProductBySlug(slug: string): ShopProduct | undefined {
  if (slug === 'google-review-nfc-standee') {
    const p = INITIAL_PRODUCTS.find((item) => item.slug === 'acrylic-google-review-standee') || INITIAL_PRODUCTS[0];
    return { ...p, slug: 'google-review-nfc-standee', basePricePaise: 69900 };
  }
  return INITIAL_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductCustomizationZones(product: ShopProduct): CustomizationZoneConfig {
  if (product.customizationZones) {
    return product.customizationZones;
  }

  const slug = product.slug;
  const isCombo = slug.includes('combo') || slug.includes('2-in-1') || slug.includes('3-in-1');
  const isCard = product.categorySlug === 'cards' || product.categorySlug === 'business-cards';
  const isPlate = slug.includes('plate') || slug.includes('wall');

  if (isCombo) {
    return {
      previewType: 'combo',
      nameZone: {
        topPercent: 50,
        leftPercent: 50,
        widthPercent: 78,
        maxFontSizePx: 16,
        textAlign: 'center',
        textColor: '#FFFFFF',
      },
      logoZone: {
        topPercent: 25,
        leftPercent: 50,
        widthPercent: 20,
        heightPercent: 15,
      },
    };
  }

  if (isCard) {
    return {
      previewType: 'card',
      nameZone: {
        topPercent: 62,
        leftPercent: 50,
        widthPercent: 80,
        maxFontSizePx: 16,
        textAlign: 'center',
        textColor: '#F3E5AB',
      },
      logoZone: {
        topPercent: 30,
        leftPercent: 50,
        widthPercent: 26,
        heightPercent: 18,
      },
    };
  }

  if (isPlate) {
    return {
      previewType: 'plate',
      nameZone: {
        topPercent: 56,
        leftPercent: 50,
        widthPercent: 74,
        maxFontSizePx: 16,
        textAlign: 'center',
        textColor: '#E0F2FE',
      },
      logoZone: {
        topPercent: 26,
        leftPercent: 50,
        widthPercent: 22,
        heightPercent: 16,
      },
    };
  }

  // Standard Acrylic or Wooden Standee
  return {
    previewType: 'standee',
    nameZone: {
      topPercent: 54,
      leftPercent: 50,
      widthPercent: 74,
      maxFontSizePx: 18,
      textAlign: 'center',
      textColor: '#FFFFFF',
    },
    logoZone: {
      topPercent: 24,
      leftPercent: 50,
      widthPercent: 24,
      heightPercent: 16,
    },
  };
}

export function getProductsByCategory(categorySlug: string): ShopProduct[] {
  if (categorySlug === 'all') return INITIAL_PRODUCTS;
  if (categorySlug === 'cards') {
    return INITIAL_PRODUCTS.filter((p) => p.category === 'cards');
  }
  if (categorySlug === 'combos') {
    return INITIAL_PRODUCTS.filter((p) => p.slug.includes('combo') || p.title.toLowerCase().includes('combo') || p.title.toLowerCase().includes('2-in-1') || p.title.toLowerCase().includes('3-in-1'));
  }
  if (categorySlug === 'accessories') {
    return INITIAL_PRODUCTS.filter((p) => p.category === 'plaques' || p.category === 'tags');
  }
  if (categorySlug === 'standees') {
    return INITIAL_PRODUCTS.filter((p) => p.category === 'standees');
  }
  return INITIAL_PRODUCTS.filter((p) => p.categorySlug === categorySlug || p.category === categorySlug);
}

export function generateOrderNumber(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `ORD-${year}-${rand}`;
}

export function validateCoupon(code: string, subtotalPaise: number): { valid: boolean; coupon?: Coupon; error?: string } {
  const normalized = code.trim().toUpperCase();
  const coupon = VALID_COUPONS[normalized];

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code. Try WELCOME10 or BULK20.' };
  }

  if (coupon.minOrderPaise && subtotalPaise < coupon.minOrderPaise) {
    return {
      valid: false,
      error: `Coupon ${coupon.code} requires a minimum order of ₹${(coupon.minOrderPaise / 100).toLocaleString('en-IN')}`,
    };
  }

  return { valid: true, coupon };
}

export function calculateOrderTotals(
  items: CartItem[],
  couponCode?: string
): {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  appliedCoupon?: Coupon;
} {
  const subtotalPaise = items.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0);

  let discountPaise = 0;
  let appliedCoupon: Coupon | undefined = undefined;
  let freeShippingFromCoupon = false;

  if (couponCode) {
    const val = validateCoupon(couponCode, subtotalPaise);
    if (val.valid && val.coupon) {
      appliedCoupon = val.coupon;
      if (appliedCoupon.discountPercent) {
        discountPaise = Math.round((subtotalPaise * appliedCoupon.discountPercent) / 100);
      } else if (appliedCoupon.discountPaise) {
        discountPaise = Math.min(subtotalPaise, appliedCoupon.discountPaise);
      }
      if (appliedCoupon.freeShipping) {
        freeShippingFromCoupon = true;
      }
    }
  }

  // Free shipping above ₹999 (99,900 paise) or via coupon, else ₹79 (7,900 paise)
  const shippingPaise =
    subtotalPaise >= 99900 || subtotalPaise === 0 || freeShippingFromCoupon
      ? 0
      : 7900;

  const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise);

  return { subtotalPaise, discountPaise, shippingPaise, totalPaise, appliedCoupon };
}
