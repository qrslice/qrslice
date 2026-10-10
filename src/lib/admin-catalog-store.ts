import { INITIAL_PRODUCTS, ShopProduct, FinishOption } from './shop-service';
import { recordAuditLog } from './audit-service';

export interface AdminProduct extends ShopProduct {
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  costPricePaise: number;
  weightGrams: number;
  fulfilmentDays: number;
  isActive: boolean;
  isArchived: boolean;
  supplierName?: string;
}

// Generate default SKU and inventory data for initial products
const IN_MEMORY_CATALOG: AdminProduct[] = INITIAL_PRODUCTS.map((p, idx) => {
  const categoryPrefix = p.categorySlug.substring(0, 3).toUpperCase();
  const sku = `QS-${categoryPrefix}-${String(idx + 1).padStart(3, '0')}`;
  // Estimate realistic cost price (approx 35-40% of retail price)
  const costPricePaise = Math.round(p.basePricePaise * 0.38);
  // Default stock between 8 and 75 units to test low stock alerts
  const stockQuantity = idx === 0 ? 8 : idx === 3 ? 5 : 45 + (idx * 5) % 30;

  return {
    ...p,
    sku,
    stockQuantity,
    lowStockThreshold: 10,
    costPricePaise,
    weightGrams: p.material === 'Metal' ? 220 : p.material === 'Wooden' ? 180 : 120,
    fulfilmentDays: 2,
    isActive: true,
    isArchived: false,
    supplierName: p.material === 'Acrylic' ? 'Apex Acrylics Okhla' : 'FineGrain Timber Jaipur',
  };
});

/**
 * Get all products for super admin with filters
 */
export function getAdminProducts(filters?: {
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive' | 'low_stock' | 'archived';
}): AdminProduct[] {
  let list = [...IN_MEMORY_CATALOG];

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }

  if (filters?.category && filters.category !== 'all') {
    list = list.filter((p) => p.categorySlug === filters.category);
  }

  if (filters?.status) {
    if (filters.status === 'active') {
      list = list.filter((p) => p.isActive && !p.isArchived);
    } else if (filters.status === 'inactive') {
      list = list.filter((p) => !p.isActive && !p.isArchived);
    } else if (filters.status === 'low_stock') {
      list = list.filter((p) => p.stockQuantity <= p.lowStockThreshold && !p.isArchived);
    } else if (filters.status === 'archived') {
      list = list.filter((p) => p.isArchived);
    }
  }

  return list;
}

/**
 * Get single product by ID or slug
 */
export function getAdminProductById(id: string): AdminProduct | undefined {
  return IN_MEMORY_CATALOG.find((p) => p.id === id || p.slug === id);
}

/**
 * Create a new physical product
 */
export async function createAdminProduct(
  payload: Omit<AdminProduct, 'id'>,
  actorEmail: string = 'suraj@qrslice.com'
): Promise<AdminProduct> {
  const newProduct: AdminProduct = {
    ...payload,
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  IN_MEMORY_CATALOG.unshift(newProduct);

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail,
    actorRole: 'super_admin',
    action: 'product.create',
    resourceType: 'product',
    resourceId: newProduct.id,
    changesAfter: {
      title: newProduct.title,
      sku: newProduct.sku,
      basePricePaise: newProduct.basePricePaise,
      stockQuantity: newProduct.stockQuantity,
    },
    metadata: { title: newProduct.title },
  });

  return newProduct;
}

/**
 * Update an existing product
 */
export async function updateAdminProduct(
  id: string,
  updates: Partial<AdminProduct>,
  actorEmail: string = 'suraj@qrslice.com'
): Promise<AdminProduct | null> {
  const index = IN_MEMORY_CATALOG.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const before = { ...IN_MEMORY_CATALOG[index] };
  const updated: AdminProduct = {
    ...before,
    ...updates,
  };

  IN_MEMORY_CATALOG[index] = updated;

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail,
    actorRole: 'super_admin',
    action: 'product.update',
    resourceType: 'product',
    resourceId: id,
    changesBefore: before,
    changesAfter: updated,
    metadata: { title: updated.title },
  });

  return updated;
}

/**
 * Record a manual stock adjustment (received stock, damaged stock, audit cycle)
 */
export async function adjustProductStock(
  id: string,
  adjustment: {
    delta: number;
    reason: 'goods_received' | 'damaged' | 'audit_reconciliation' | 'customer_return' | 'order_sale';
    notes?: string;
  },
  actorEmail: string = 'suraj@qrslice.com'
): Promise<AdminProduct | null> {
  const product = IN_MEMORY_CATALOG.find((p) => p.id === id);
  if (!product) return null;

  const beforeStock = product.stockQuantity;
  const newStock = Math.max(0, beforeStock + adjustment.delta);
  product.stockQuantity = newStock;

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail,
    actorRole: 'super_admin',
    action: 'inventory.stock_adjust',
    resourceType: 'inventory',
    resourceId: id,
    changesBefore: { stockQuantity: beforeStock },
    changesAfter: { stockQuantity: newStock },
    metadata: {
      sku: product.sku,
      delta: adjustment.delta,
      reason: adjustment.reason,
      notes: adjustment.notes,
    },
  });

  return product;
}

/**
 * Archive a product
 */
export async function archiveAdminProduct(
  id: string,
  actorEmail: string = 'suraj@qrslice.com'
): Promise<boolean> {
  const product = IN_MEMORY_CATALOG.find((p) => p.id === id);
  if (!product) return false;

  product.isArchived = true;
  product.isActive = false;

  await recordAuditLog({
    actorId: 'super-admin',
    actorEmail,
    actorRole: 'super_admin',
    action: 'product.archive',
    resourceType: 'product',
    resourceId: id,
    changesBefore: { isArchived: false, isActive: true },
    changesAfter: { isArchived: true, isActive: false },
    metadata: { title: product.title },
  });

  return true;
}
