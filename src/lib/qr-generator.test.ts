import { describe, it, expect } from 'vitest';
import {
  formatUpiUri,
  formatWifiUri,
  formatVCardUri,
  formatGoogleReviewUri,
  formatSocialUri,
  generateQrSvgString,
  generateQrDataUrl,
} from './qr-generator';

describe('QR Generator Utilities', () => {
  it('formats NPCI compliant UPI payment URI correctly', () => {
    const uri = formatUpiUri({
      vpa: 'merchant@okhdfcbank',
      name: 'Cafe Mocha',
      amount: '250.00',
      note: 'Coffee and Croissant',
    });

    expect(uri).toContain('upi://pay?pa=merchant@okhdfcbank');
    expect(uri).toContain('&pn=Cafe%20Mocha');
    expect(uri).toContain('&am=250.00');
    expect(uri).toContain('&tn=Coffee%20and%20Croissant');
    expect(uri).toContain('&cu=INR');
  });

  it('formats WiFi connect URI correctly with special characters', () => {
    const uri = formatWifiUri({
      ssid: 'Cafe_Guest;Net',
      password: 'Pass;word123',
      encryption: 'WPA',
    });

    expect(uri).toBe('WIFI:T:WPA;S:Cafe_Guest\\;Net;P:Pass\\;word123;;');
  });

  it('formats standard vCard 3.0 contact payload', () => {
    const vcard = formatVCardUri({
      firstName: 'Rahul',
      lastName: 'Sharma',
      organization: 'Tech Labs',
      title: 'CTO',
      phone: '+919820012345',
      email: 'rahul@techlabs.com',
      url: 'https://techlabs.com',
    });

    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:3.0');
    expect(vcard).toContain('FN:Rahul Sharma');
    expect(vcard).toContain('ORG:Tech Labs');
    expect(vcard).toContain('TITLE:CTO');
    expect(vcard).toContain('TEL;TYPE=CELL,VOICE:+919820012345');
    expect(vcard).toContain('EMAIL;TYPE=WORK,INTERNET:rahul@techlabs.com');
    expect(vcard).toContain('END:VCARD');
  });

  it('formats Google Review Place ID into direct review dialog link', () => {
    const uri = formatGoogleReviewUri('ChIJN1t_tDeuEmsRUsoyG83frY4');
    expect(uri).toBe('https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4');

    const directUri = formatGoogleReviewUri('https://g.page/r/example/review');
    expect(directUri).toBe('https://g.page/r/example/review');
  });

  it('formats social media follow URIs', () => {
    expect(formatSocialUri('instagram', '@qrslice')).toBe('https://instagram.com/qrslice');
    expect(formatSocialUri('youtube', 'qrslice')).toBe('https://youtube.com/@qrslice');
    expect(formatSocialUri('whatsapp', '+91 98200 12345')).toBe('https://wa.me/919820012345');
  });

  it('generates valid QR SVG and PNG data URL', async () => {
    const svg = await generateQrSvgString('https://qrslice.com', {
      foregroundColor: '#7C3AED',
      backgroundColor: '#FFFFFF',
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');

    const dataUrl = await generateQrDataUrl('https://qrslice.com');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
