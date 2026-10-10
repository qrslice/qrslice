import { Metadata } from 'next';
import { OrderTrackingClient } from './OrderTrackingClient';

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} | QRslice Tracking`,
  };
}

export default async function OrderTrackingPage({ params }: Props) {
  const { orderNumber } = await params;
  return <OrderTrackingClient orderNumber={orderNumber} />;
}
