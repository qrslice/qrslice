import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug } from '@/lib/shop-service';
import { ProductCustomizerClient } from './ProductCustomizerClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | QRslice' };

  return {
    title: `${product.title} — Customize & Order | QRslice Store`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductCustomizerClient product={product} />;
}
