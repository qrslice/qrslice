// Copyright (c) 2026 QRslice. All rights reserved.
// Transactional Email Service using Resend.

import { Resend } from 'resend';

interface OrderConfirmationEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalPaise: number;
  shippingAddress: string;
  items: Array<{
    title: string;
    quantity: number;
    unitPricePaise: number;
    finish?: string;
    customBusinessName?: string;
  }>;
}

interface DispatchNotificationEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingCarrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  assignedCardIds?: string[];
  printedClaimTokens?: string[];
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams) {
  const resend = getResendClient();
  const formattedTotal = (params.totalPaise / 100).toLocaleString('en-IN');

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; font-family: sans-serif; font-size: 13px; color: #0f172a;">
          <strong>${item.title}</strong>
          ${item.finish ? `<br><span style="font-size: 11px; color: #64748b;">Finish: ${item.finish}</span>` : ''}
          ${item.customBusinessName ? `<br><span style="font-size: 11px; color: #7c3aed;">Laser Marking: "${item.customBusinessName}"</span>` : ''}
        </td>
        <td style="padding: 10px 0; font-family: sans-serif; font-size: 13px; text-align: center; color: #0f172a;">${item.quantity}</td>
        <td style="padding: 10px 0; font-family: sans-serif; font-size: 13px; text-align: right; color: #0f172a;">₹${((item.unitPricePaise * item.quantity) / 100).toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="background-color: #f8fafc; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #7c3aed; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">QrSlice</h1>
          <p style="color: #ede9fe; margin: 4px 0 0 0; font-size: 12px;">The Restaurant & Retail QR Layer</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Order Confirmed!</h2>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            Hi <strong>${params.customerName}</strong>,<br>
            Thank you for your purchase. Your hardware order <strong>${params.orderNumber}</strong> has been confirmed and queued for custom laser engraving.
          </p>
          <div style="margin: 20px 0; padding: 16px; background-color: #f5f3ff; border-radius: 12px; border: 1px solid #ddd6fe;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd6fe; text-align: left;">
                  <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6d28d9;">Item</th>
                  <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6d28d9; text-align: center;">Qty</th>
                  <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6d28d9; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd6fe; display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #0f172a;">
              <span>Total Paid:</span>
              <span style="color: #7c3aed;">₹${formattedTotal}</span>
            </div>
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
            <strong>Shipping Address:</strong><br>
            ${params.shippingAddress}
          </div>
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://qrslice.com/account/orders" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: bold;">
              Track Order & Download Invoice
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  if (!resend) {
    console.log(`[Email Service Simulation] Order Confirmation sent to ${params.customerEmail} for ${params.orderNumber}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'QrSlice Orders <orders@qrslice.com>',
      replyTo: 'support@qrslice.com',
      to: params.customerEmail,
      subject: `Order Confirmed: ${params.orderNumber} — QrSlice Hardware`,
      html,
    });
    return { success: true, data };
  } catch (err) {
    console.error('Failed to send confirmation email:', err);
    return { success: false, error: err };
  }
}

export async function sendDispatchNotificationEmail(params: DispatchNotificationEmailParams) {
  const resend = getResendClient();

  const html = `
    <div style="background-color: #f8fafc; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background-color: #7c3aed; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">QrSlice</h1>
          <p style="color: #ede9fe; margin: 4px 0 0 0; font-size: 12px;">Your Hardware Has Dispatched!</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">On The Way via Express Courier</h2>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            Hi <strong>${params.customerName}</strong>,<br>
            Your custom hardware for order <strong>${params.orderNumber}</strong> has completed laser engraving and quality inspection, and has been dispatched!
          </p>
          <div style="margin: 20px 0; padding: 16px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 13px; color: #166534;">
              <strong>Courier Carrier:</strong> ${params.trackingCarrier}<br>
              <strong>Tracking / AWB Number:</strong> <code style="font-weight: bold;">${params.trackingNumber}</code>
            </p>
          </div>
          <div style="background-color: #f5f3ff; padding: 14px; border-radius: 12px; font-size: 12px; color: #5b21b6; line-height: 1.5;">
            <strong>📦 Activation Instructions:</strong><br>
            Your hardware has been pre-configured and will work immediately on tap! Each item in the box includes a <strong>printed claim PIN</strong>. Once delivered, scan the QR on the back of your card or visit <a href="https://qrslice.com/activate">qrslice.com/activate</a> to link it to your dashboard.
          </div>
        </div>
      </div>
    </div>
  `;

  if (!resend) {
    console.log(`[Email Service Simulation] Dispatch notification sent to ${params.customerEmail} for ${params.orderNumber}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'QrSlice Logistics <shipping@qrslice.com>',
      replyTo: 'support@qrslice.com',
      to: params.customerEmail,
      subject: `Dispatched: Your QrSlice Hardware Order ${params.orderNumber}`,
      html,
    });
    return { success: true, data };
  } catch (err) {
    console.error('Failed to send dispatch email:', err);
    return { success: false, error: err };
  }
}
