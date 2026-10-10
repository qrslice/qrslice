import QRCode from 'qrcode';

export interface QROptions {
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
}

export interface UpiParams {
  vpa: string;
  name: string;
  amount?: string;
  note?: string;
}

export interface WifiParams {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface VCardParams {
  firstName: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
}

/**
 * Format NPCI compliant UPI payment URI string
 */
export function formatUpiUri(params: UpiParams): string {
  const cleanVpa = params.vpa.trim();
  const cleanName = encodeURIComponent(params.name.trim() || 'Merchant');
  let uri = `upi://pay?pa=${cleanVpa}&pn=${cleanName}&cu=INR`;

  if (params.amount && parseFloat(params.amount) > 0) {
    uri += `&am=${parseFloat(params.amount).toFixed(2)}`;
  }
  if (params.note) {
    uri += `&tn=${encodeURIComponent(params.note.trim())}`;
  }
  return uri;
}

/**
 * Format WiFi Network Connect URI string
 */
export function formatWifiUri(params: WifiParams): string {
  const enc = params.encryption || 'WPA';
  const ssid = params.ssid.replace(/([\\;,:"])/g, '\\$1');
  const pass = (params.password || '').replace(/([\\;,:"])/g, '\\$1');
  const hidden = params.hidden ? 'H:true;' : '';

  return `WIFI:T:${enc};S:${ssid};P:${pass};${hidden};`;
}

/**
 * Format vCard 3.0 Contact URI string
 */
export function formatVCardUri(params: VCardParams): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  const n = `${params.lastName || ''};${params.firstName || ''};;;`;
  lines.push(`N:${n}`);
  lines.push(`FN:${params.firstName || ''} ${params.lastName || ''}`.trim());

  if (params.organization) lines.push(`ORG:${params.organization}`);
  if (params.title) lines.push(`TITLE:${params.title}`);
  if (params.phone) lines.push(`TEL;TYPE=CELL,VOICE:${params.phone.replace(/\s+/g, '')}`);
  if (params.email) lines.push(`EMAIL;TYPE=WORK,INTERNET:${params.email.trim()}`);
  if (params.url) lines.push(`URL:${params.url.trim()}`);
  if (params.address) lines.push(`ADR;TYPE=WORK:;;${params.address.replace(/\n/g, ', ')};;;;`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Format Google Review Direct Dialog URL
 */
export function formatGoogleReviewUri(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // If it's a Place ID like ChIJ...
  if (trimmed.startsWith('ChIJ') || trimmed.length > 20) {
    return `https://search.google.com/local/writereview?placeid=${trimmed}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}+reviews`;
}

/**
 * Format Social Media Follow Link
 */
export function formatSocialUri(
  platform: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin' | 'x' | 'facebook',
  handle: string
): string {
  const clean = handle.trim().replace(/^@/, '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${clean}`;
    case 'youtube':
      return `https://youtube.com/@${clean}`;
    case 'x':
      return `https://x.com/${clean}`;
    case 'facebook':
      return `https://facebook.com/${clean}`;
    case 'linkedin':
      return `https://linkedin.com/in/${clean}`;
    case 'whatsapp':
      return `https://wa.me/${clean.replace(/\D/g, '')}`;
    default:
      return clean;
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQrSvgString(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const {
    foregroundColor = '#0F172A',
    backgroundColor = '#FFFFFF',
    errorCorrectionLevel = 'M',
    margin = 2,
    width = 400,
  } = options;

  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel,
    margin,
    width,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });
}

/**
 * Generate QR code as Data URL (PNG)
 */
export async function generateQrDataUrl(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const {
    foregroundColor = '#0F172A',
    backgroundColor = '#FFFFFF',
    errorCorrectionLevel = 'M',
    margin = 2,
    width = 1200,
  } = options;

  return QRCode.toDataURL(text, {
    errorCorrectionLevel,
    margin,
    width,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });
}
