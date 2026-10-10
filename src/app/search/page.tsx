import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  redirect(`/products?search=${encodeURIComponent(q || '')}`);
}
