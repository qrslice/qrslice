import React from 'react';
import { SubscriptionsClient } from './SubscriptionsClient';

export const metadata = {
  title: 'Subscriptions & SaaS Access | QRslice Superadmin',
  description: 'Manage café-owner subscription plans, trial extensions, overdue payments, and access controls.',
};

export default function SuperSubscriptionsPage() {
  return <SubscriptionsClient />;
}
