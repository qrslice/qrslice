import React from 'react';
import { MarketingClient } from './MarketingClient';

export const metadata = {
  title: 'Marketing & Promotional Campaigns | QRslice Superadmin',
  description: 'Manage storefront discount coupons, product bundle rules, and promotional campaigns.',
};

export default function SuperMarketingPage() {
  return <MarketingClient />;
}
