import { Metadata } from 'next';
import { CustomersClient } from './CustomersClient';

export const metadata: Metadata = {
  title: 'Merchant & Customer CRM | QRslice Superadmin',
  description: 'Café owners, customer spending LTV, subscription status, and support notes.',
};

export default function SuperCustomersPage() {
  return <CustomersClient />;
}
