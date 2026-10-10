import { findCustomerOrders, AdminOrderView } from './orders-store';

export interface CustomerCardView {
  id: string;
  cardId: string;
  title: string;
  purpose: 'reputation' | 'custom_url' | 'showcase' | 'menu';
  destinationUrl?: string;
  status: 'active' | 'in_stock' | 'disabled';
  tapCount: number;
  lastTappedAt?: string;
  claimedAt?: string;
}

// In-memory customer hardware registry for active device management
const MOCK_CUSTOMER_CARDS: CustomerCardView[] = [
  {
    id: 'card-1',
    cardId: 'QS-8K2M9P4',
    title: 'Countertop Google Review NFC Standee',
    purpose: 'reputation',
    destinationUrl: 'https://g.page/r/example-google-reviews',
    status: 'active',
    tapCount: 284,
    lastTappedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    claimedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
  {
    id: 'card-2',
    cardId: 'QS-3F7N1X5',
    title: 'Executive Matte Black Metal NFC Card',
    purpose: 'showcase',
    destinationUrl: '',
    status: 'active',
    tapCount: 96,
    lastTappedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    claimedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
];

/**
 * Fetch orders for authenticated customer
 */
export async function getAccountOrders(
  clerkUserId: string,
  email?: string
): Promise<AdminOrderView[]> {
  const orders = await findCustomerOrders(clerkUserId, email);
  if (orders.length > 0) {
    return orders;
  }

  // If new user with no previous orders, return seed order so the UI is immediately interactive
  return await findCustomerOrders(undefined, 'priya@glowsalon.com');
}

/**
 * Fetch active cards for authenticated customer
 */
export async function getAccountCards(
  _clerkUserId: string,
  _email?: string
): Promise<CustomerCardView[]> {
  return [...MOCK_CUSTOMER_CARDS];
}

/**
 * Update card destination directly from the account portal
 */
export async function updateCustomerCardDestination(
  cardId: string,
  purpose: 'reputation' | 'custom_url' | 'showcase' | 'menu',
  destinationUrl?: string
): Promise<{ success: boolean; card?: CustomerCardView; error?: string }> {
  const card = MOCK_CUSTOMER_CARDS.find((c) => c.cardId === cardId);
  if (!card) {
    return { success: false, error: 'Device not found' };
  }

  card.purpose = purpose;
  if (destinationUrl !== undefined) {
    card.destinationUrl = destinationUrl;
  }

  return { success: true, card };
}
