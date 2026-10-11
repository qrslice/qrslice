import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug } from '@/lib/shop-service';
import { ProductDetailClient } from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | QRslice' };

  return {
    title: `${product.title} — Customize & Buy | QRslice`,
    description: product.description,
    openGraph: {
      title: `${product.title} | QRslice Commercial NFC & QR Hardware`,
      description: product.description,
      images: [{ url: product.image }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Schema.org Product JSON-LD (strictly without aggregateRating as no reviews exist yet)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: `https://qrslice.com${product.image}`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'QRslice',
    },
    offers: {
      '@type': 'Offer',
      price: (product.basePricePaise / 100).toFixed(2),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `https://qrslice.com/products/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'QRslice',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
