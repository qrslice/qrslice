import React from 'react';
import { FinanceClient } from './FinanceClient';

export const metadata = {
  title: 'Payments, Ledger & Reconciliation | QRslice Superadmin',
  description: 'Track Razorpay payment transactions, revenue breakdowns, settlement reconciliation, and separate physical vs subscription revenues.',
};

export default function SuperFinancePage() {
  return <FinanceClient />;
}
