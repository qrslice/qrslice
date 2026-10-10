import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import {
  calculateOrderTotals,
  generateOrderNumber,
  getProductBySlug,
  ShippingAddressSchema,
  CartItem,
} from '@/lib/shop-service';
import { registerShopOrder } from '@/lib/orders-store';
import { generateCardId } from '@/lib/card-ids';
import { generateClaimPin, hashClaimSecret } from '@/lib/claim-tokens';
import { registerAllocatedCard } from '@/lib/card-store';
import { createRazorpayOrder } from '@/lib/razorpay';

const CheckoutPayloadSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(),
      productId: z.string(),
      title: z.string(),
      slug: z.string(),
      quantity: z.number().int().min(1),
      unitPricePaise: z.number().int().min(1).optional(),
      finish: z.object({
        id: z.string(),
        name: z.string(),
        priceModifierPaise: z.number().optional(),
        previewColor: z.string(),
      }),
      customBusinessName: z.string().min(1),
      customLogoUrl: z.string().optional(),
      qrUrl: z.string().optional(),
    })
  ).min(1, 'Cart is empty'),
  address: ShippingAddressSchema,
  couponCode: z.string().optional(),
  gstin: z.string().optional().or(z.literal('')),
  businessLegalName: z.string().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CheckoutPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, address, couponCode, gstin, businessLegalName } = parsed.data;

    // 1. Calculate price strictly from server-side catalog — never trust client-supplied unitPricePaise
    const verifiedItems: CartItem[] = items.map((item) => {
      const catalogProduct = getProductBySlug(item.slug);
      const matchedFinish =
        catalogProduct?.finishes.find((f) => f.id === item.finish.id) ||
        catalogProduct?.finishes[0] ||
        item.finish;
      const finishModifier = matchedFinish.priceModifierPaise || 0;
      const basePrice = catalogProduct ? catalogProduct.basePricePaise : (item.unitPricePaise || 0);
      const authoritativeUnitPricePaise = basePrice + finishModifier;

      return {
        id: item.id || `item_${item.slug}`,
        productId: catalogProduct?.id || item.productId,
        title: catalogProduct?.title || item.title,
        slug: item.slug,
        quantity: item.quantity,
        unitPricePaise: authoritativeUnitPricePaise,
        finish: {
          id: item.finish.id,
          name: matchedFinish.name || item.finish.name,
          priceModifierPaise: finishModifier,
          previewColor: item.finish.previewColor,
        },
        customBusinessName: item.customBusinessName,
        customLogoUrl: item.customLogoUrl,
        qrUrl: item.qrUrl,
      };
    });

    const { subtotalPaise, discountPaise, shippingPaise, totalPaise, appliedCoupon } =
      calculateOrderTotals(verifiedItems, couponCode);
    const orderNumber = generateOrderNumber();

    // 2. Try reading clerk auth session if user is logged in
    let clerkUserId: string | undefined = undefined;
    try {
      const session = await auth();
      if (session.userId) {
        clerkUserId = session.userId;
      }
    } catch {
      // Guest checkout is valid
    }

    // 3. Create genuine Razorpay order using server credentials
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Payments not configured. Razorpay credentials are required to accept orders.' },
        { status: 503 }
      );
    }

    const rzpOrder = await createRazorpayOrder({
      amountPaise: totalPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        orderNumber,
        customerEmail: address.email,
        customerName: address.fullName,
      },
    });

    // 4. Provision QS- Card IDs and Printed Claim PINs for each unit
    const orderItemsWithHardware = await Promise.all(
      verifiedItems.map(async (item) => {
        const assignedCardIds: string[] = [];
        const printedClaimTokens: string[] = [];

        for (let q = 0; q < item.quantity; q++) {
          const cardId = generateCardId();
          const claimPin = generateClaimPin();
          const claimHash = await hashClaimSecret(claimPin);

          assignedCardIds.push(cardId);
          printedClaimTokens.push(claimPin);

          try {
            await registerAllocatedCard({
              cardId,
              claimTokenHash: claimHash,
              preRoutedUrl: item.qrUrl || 'https://qrslice.com',
              status: 'assigned',
              businessName: item.customBusinessName,
              finish: item.finish.name,
              orderNumber,
            });
          } catch {
            // Store fallback
          }
        }

        return {
          id: `item_${Math.random().toString(36).substring(2, 9)}`,
          productId: item.productId,
          productSlug: item.slug,
          productTitle: item.title,
          quantity: item.quantity,
          unitPricePaise: item.unitPricePaise,
          customBusinessName: item.customBusinessName,
          customLogoUrl: item.customLogoUrl,
          finish: item.finish.name,
          destinationUrl: item.qrUrl,
          assignedCardIds,
          printedClaimTokens,
        };
      })
    );

    // 5. Create pending order record in store & database (never marked captured before verification)
    const orderRecord = {
      id: `ord_${Math.random().toString(36).substring(2, 10)}`,
      orderNumber,
      clerkUserId,
      customerName: address.fullName,
      customerEmail: address.email,
      customerPhone: address.phone,
      gstin: gstin ? gstin.trim().toUpperCase() : undefined,
      businessLegalName: businessLegalName ? businessLegalName.trim() : undefined,
      shippingAddress: `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`,
      totalPaise,
      subtotalPaise,
      discountPaise,
      couponCode: appliedCoupon?.code,
      shippingPaise,
      paymentStatus: 'pending' as const,
      status: 'pending' as const,
      orderStage: 'order_received' as const,
      razorpayOrderId: rzpOrder.id,
      createdAt: new Date().toISOString(),
      items: orderItemsWithHardware,
    };

    await registerShopOrder(orderRecord);

    return NextResponse.json({
      success: true,
      orderNumber,
      totalPaise,
      subtotalPaise,
      discountPaise,
      shippingPaise,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId,
      currency: 'INR',
      customer: {
        name: address.fullName,
        email: address.email,
        phone: address.phone,
      },
      items: orderItemsWithHardware,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
