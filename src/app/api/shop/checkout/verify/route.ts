import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay';
import { findOrderByNumber, markOrderPaid } from '@/lib/orders-store';
import { adjustProductStock } from '@/lib/admin-catalog-store';
import { sendOrderConfirmationEmail } from '@/lib/email-service';
import { recordAuditLog } from '@/lib/audit-service';

const VerifySchema = z.object({
  orderNumber: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payment verification parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // 1. Find existing pending order
    const order = await findOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Check if order was already confirmed (idempotency)
    if (order.paymentStatus === 'captured') {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        orderNumber: order.orderNumber,
      });
    }

    // 3. Verify Razorpay cryptographic HMAC-SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Payments not configured. RAZORPAY_KEY_SECRET is required to verify signatures.' },
        { status: 503 }
      );
    }

    const isSignatureValid = await verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      secret,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Forged or tampered response.' },
        { status: 400 }
      );
    }

    // 4. Mark order paid in persistent store
    const updatedOrder = await markOrderPaid(orderNumber, {
      razorpayOrderId,
      razorpayPaymentId,
      amountPaise: order.totalPaise,
    });

    // 5. Deduct inventory stock for each purchased item
    for (const item of order.items) {
      if (item.productId) {
        await adjustProductStock(
          item.productId,
          {
            delta: -item.quantity,
            reason: 'order_sale',
            notes: `Fulfillment for order ${order.orderNumber}`,
          },
          'system.checkout'
        );
      }
    }

    // 6. Record financial transaction ledger
    try {
      const { recordFinanceTransaction } = await import('@/lib/admin-finance-store');
      await recordFinanceTransaction({
        id: `txn_${razorpayPaymentId}`,
        type: 'physical_order',
        referenceId: order.orderNumber,
        razorpayPaymentId,
        razorpayOrderId,
        grossAmountPaise: order.totalPaise,
        gstPaise: 0,
        gatewayFeePaise: Math.round(order.totalPaise * 0.02),
        netSettledPaise: Math.round(order.totalPaise * 0.98),
        paymentMethod: 'card',
        status: 'captured',
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[checkout-verify] Finance ledger recording error:', err);
    }

    // 7. Send order confirmation email
    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalPaise: order.totalPaise,
      shippingAddress: order.shippingAddress,
      items: order.items.map((i) => ({
        title: i.productTitle,
        quantity: i.quantity,
        unitPricePaise: i.unitPricePaise,
        finish: i.finish,
        customBusinessName: i.customBusinessName,
      })),
    }).catch((err) => console.error('[checkout-verify] Confirmation email error:', err));

    // 8. Record audit log
    await recordAuditLog({
      actorId: 'system.razorpay',
      actorEmail: order.customerEmail,
      actorRole: 'system',
      action: 'order.payment_verified',
      resourceType: 'order',
      resourceId: order.orderNumber,
      changesAfter: {
        paymentStatus: 'captured',
        status: 'confirmed',
        razorpayPaymentId,
      },
      metadata: {
        orderNumber: order.orderNumber,
        totalPaise: order.totalPaise,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      status: 'confirmed',
      paymentStatus: 'captured',
    });
  } catch (error) {
    console.error('[checkout-verify] Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
