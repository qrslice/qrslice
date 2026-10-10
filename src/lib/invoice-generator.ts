// Copyright (c) 2026 QRslice. All rights reserved.
// Official Commercial Invoice & Order Receipt Generator using jsPDF.
// QRslice is an unregistered business entity and does not collect GST.

import { jsPDF } from 'jspdf';

export interface InvoiceItem {
  title?: string;
  productTitle?: string;
  quantity: number;
  unitPricePaise: number;
  finish?: string;
  customBusinessName?: string;
}

export interface InvoiceOrderData {
  orderNumber: string;
  invoiceNumber?: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  gstin?: string;
  businessLegalName?: string;
  items: InvoiceItem[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
}

export function generateGSTInvoicePDF(order: InvoiceOrderData): jsPDF {
  return generateOrderInvoicePDF(order);
}

export function generateOrderInvoicePDF(order: InvoiceOrderData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // 1. Header Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(124, 58, 237); // #7c3aed QrSlice purple
  doc.text('QRslice', margin, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INVOICE / RECEIPT', pageWidth - margin, y, { align: 'right' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('(Original for Recipient · Hardware & Fleet Supply)', pageWidth - margin, y, { align: 'right' });

  y += 2;
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Hardware Lab & Online Dispatch, India', margin, y);
  y += 4;
  doc.text('Supplier: Unregistered Entity (No GST collected) | Email: support@qrslice.com', margin, y);
  y += 4;
  doc.text('Website: https://qrslice.com', margin, y);

  y += 3;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // 2. Invoice & Customer Details Box
  const colWidth = (pageWidth - margin * 2) / 2;

  // Left: Bill To / Ship To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('BILL TO / SHIP TO:', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(order.businessLegalName ? order.businessLegalName : order.customerName, margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  if (order.businessLegalName && order.customerName) {
    doc.text(`Attn: ${order.customerName}`, margin, y);
    y += 3.5;
  }

  // Address lines (wrapped)
  const splitAddress = doc.splitTextToSize(order.shippingAddress, colWidth - 8);
  doc.text(splitAddress, margin, y);
  y += splitAddress.length * 3.5;

  doc.text(`Mobile: +91 ${order.customerPhone} | Email: ${order.customerEmail}`, margin, y);
  y += 3.5;

  if (order.gstin) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text(`Buyer GSTIN (Ref): ${order.gstin}`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    y += 4;
  }

  // Right Box: Invoice Reference Info
  let rightY = y - (order.gstin ? 19 : 15);
  const rightX = margin + colWidth + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Invoice No: ${order.invoiceNumber || 'INV-' + order.orderNumber.replace('ORD-', '')}`, rightX, rightY);
  rightY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, rightX, rightY);
  rightY += 3.5;
  doc.text(`Order Ref: ${order.orderNumber}`, rightX, rightY);
  rightY += 3.5;
  doc.text(`Tax Category: Unregistered (0% GST)`, rightX, rightY);
  rightY += 3.5;
  doc.text(`Payment Mode: 100% Prepaid (Razorpay PG)`, rightX, rightY);

  y = Math.max(y, rightY) + 4;

  // 3. Items Table Header
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  doc.text('#', margin + 2, y + 4.5);
  doc.text('Item Description & Branding', margin + 10, y + 4.5);
  doc.text('Qty', margin + 120, y + 4.5);
  doc.text('Unit Price (₹)', margin + 145, y + 4.5);
  doc.text('Amount (₹)', pageWidth - margin - 2, y + 4.5, { align: 'right' });

  y += 7;

  // 4. Items Table Rows
  let itemsSubtotal = 0;
  order.items.forEach((item, index) => {
    const itemTotal = (item.unitPricePaise * item.quantity) / 100;
    itemsSubtotal += itemTotal;
    const titleText = item.productTitle || item.title || 'QR Hardware';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    doc.text(String(index + 1), margin + 2, y + 4);

    const desc = `${titleText}${item.finish ? ' (' + item.finish + ')' : ''}`;
    doc.text(desc.substring(0, 56), margin + 10, y + 4);

    if (item.customBusinessName) {
      doc.setFontSize(6.5);
      doc.setTextColor(124, 58, 237);
      doc.text(`Laser Marking: "${item.customBusinessName}"`, margin + 10, y + 7.5);
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
    }

    doc.text(String(item.quantity), margin + 120, y + 4);
    doc.text(`₹${(item.unitPricePaise / 100).toFixed(2)}`, margin + 145, y + 4);
    doc.text(`₹${itemTotal.toFixed(2)}`, pageWidth - margin - 2, y + 4, { align: 'right' });

    y += item.customBusinessName ? 9.5 : 6.5;
  });

  // Shipping row if applicable
  const shippingTotal = (order.shippingPaise || 0) / 100;
  if (shippingTotal > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(String(order.items.length + 1), margin + 2, y + 4);
    doc.text('Express Courier Logistics & Packaging', margin + 10, y + 4);
    doc.text('1', margin + 120, y + 4);
    doc.text(`₹${shippingTotal.toFixed(2)}`, margin + 145, y + 4);
    doc.text(`₹${shippingTotal.toFixed(2)}`, pageWidth - margin - 2, y + 4, { align: 'right' });
    y += 6.5;
  }

  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // 5. Summary Box
  const finalTotal = order.totalPaise / 100;
  const summaryX = margin + 100;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Items Subtotal:', summaryX, y);
  doc.text(`₹${itemsSubtotal.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  if (shippingTotal > 0) {
    doc.text('Delivery & Handling:', summaryX, y);
    doc.text(`₹${shippingTotal.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
    y += 4;
  }

  doc.text('Taxes (Unregistered Supplier under GST):', summaryX, y);
  doc.text('₹0.00', pageWidth - margin - 2, y, { align: 'right' });
  y += 4;

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(summaryX, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Amount Paid (INR):', summaryX, y);
  doc.setTextColor(124, 58, 237);
  doc.text(`₹${finalTotal.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });

  // 6. Footer Notes
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Declaration: This is an electronic order receipt issued by an unregistered supplier under Indian GST law.', margin, y);
  y += 3.5;
  doc.text('No GST has been charged or collected on this transaction. Input Tax Credit (ITC) is not applicable.', margin, y);
  y += 3.5;
  doc.text('Warranty: 1-Year physical NFC tag replacement coverage against chip malfunction.', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.text('For QRslice', pageWidth - margin - 40, y - 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('(Authorised Signatory)', pageWidth - margin - 40, y, { align: 'center' });

  return doc;
}

export function generatePackingSlipPDF(order: InvoiceOrderData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // Packing slip header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('QRslice Dispatch Packing Slip', margin, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Order #${order.orderNumber}`, pageWidth - margin, y, { align: 'right' });
  y += 6;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Deliver To:', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(order.businessLegalName ? order.businessLegalName : order.customerName, margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitAddress = doc.splitTextToSize(order.shippingAddress, 100);
  doc.text(splitAddress, margin, y);
  y += splitAddress.length * 3.5;
  doc.text(`Phone: +91 ${order.customerPhone}`, margin, y);
  y += 8;

  // Items table
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('#', margin + 2, y + 4.5);
  doc.text('Item / Product Description', margin + 10, y + 4.5);
  doc.text('Finish / Laser Details', margin + 85, y + 4.5);
  doc.text('Qty', margin + 150, y + 4.5);
  doc.text('QC Check', pageWidth - margin - 2, y + 4.5, { align: 'right' });
  y += 7;

  order.items.forEach((item, index) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    doc.text(String(index + 1), margin + 2, y + 4);
    doc.text((item.productTitle || item.title || 'Hardware').substring(0, 40), margin + 10, y + 4);
    doc.text(item.customBusinessName ? `"${item.customBusinessName}"` : (item.finish || 'Standard'), margin + 85, y + 4);
    doc.text(String(item.quantity), margin + 150, y + 4);
    doc.text('[  ] Pass', pageWidth - margin - 2, y + 4, { align: 'right' });
    y += 7;
  });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Packed by: _____________________    Date: ____________________    Courier AWB: _____________________', margin, y);

  return doc;
}

export function downloadGSTInvoice(order: InvoiceOrderData) {
  downloadOrderInvoice(order);
}

export function downloadOrderInvoice(order: InvoiceOrderData) {
  const doc = generateOrderInvoicePDF(order);
  doc.save(`qrslice-invoice-${order.orderNumber}.pdf`);
}

export const downloadGstInvoicePdf = downloadGSTInvoice;
