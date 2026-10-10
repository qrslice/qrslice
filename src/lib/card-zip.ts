// Copyright (c) 2026 QRslice. All rights reserved.
// Minimal ZIP writer (stored, no compression) — no new dependencies.
// Used for card-batch export: {card_id}-front/back.svg + batch-manifest.csv.

function crc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = crc32Table();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  name: string;
  content: string | Uint8Array;
}

function toBytes(content: string | Uint8Array): Uint8Array {
  if (content instanceof Uint8Array) return content;
  return new TextEncoder().encode(content);
}

function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const d =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    ((date.getDate()) & 0x1f);
  return { time, date: d };
}

/** Build a ZIP (store method) as a Buffer/Uint8Array. Deterministic for same inputs + date. */
export function buildZip(entries: ZipEntry[], at: Date = new Date()): Uint8Array {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const { time, date } = dosDateTime(at);

  const pushU16 = (arr: number[], v: number) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff);
  };
  const pushU32 = (arr: number[], v: number) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  };

  for (const entry of entries) {
    const data = toBytes(entry.content);
    const name = toBytes(entry.name);
    const crc = crc32(data);

    const local: number[] = [];
    pushU32(local, 0x04034b50);
    pushU16(local, 20);
    pushU16(local, 0x0800); // UTF-8
    pushU16(local, 0); // store
    pushU16(local, time);
    pushU16(local, date);
    pushU32(local, crc);
    pushU32(local, data.length);
    pushU32(local, data.length);
    pushU16(local, name.length);
    pushU16(local, 0);

    const localHeader = new Uint8Array([...local, ...name]);
    chunks.push(localHeader, data);

    const centralHeader: number[] = [];
    pushU32(centralHeader, 0x02014b50);
    pushU16(centralHeader, 20);
    pushU16(centralHeader, 20);
    pushU16(centralHeader, 0x0800);
    pushU16(centralHeader, 0);
    pushU16(centralHeader, time);
    pushU16(centralHeader, date);
    pushU32(centralHeader, crc);
    pushU32(centralHeader, data.length);
    pushU32(centralHeader, data.length);
    pushU16(centralHeader, name.length);
    pushU16(centralHeader, 0);
    pushU16(centralHeader, 0);
    pushU16(centralHeader, 0);
    pushU16(centralHeader, 0);
    pushU32(centralHeader, 0);
    pushU32(centralHeader, offset);
    central.push(new Uint8Array([...centralHeader, ...name]));

    offset += localHeader.length + data.length;
  }

  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end: number[] = [];
  pushU32(end, 0x06054b50);
  pushU16(end, 0);
  pushU16(end, 0);
  pushU16(end, entries.length);
  pushU16(end, entries.length);
  pushU32(end, centralSize);
  pushU32(end, offset);
  pushU16(end, 0);

  const totalLen = offset + centralSize + end.length;
  const out = new Uint8Array(totalLen);
  let p = 0;
  const append = (b: Uint8Array) => {
    out.set(b, p);
    p += b.length;
  };
  for (const c of chunks) append(c);
  for (const c of central) append(c);
  append(new Uint8Array(end));
  return out;
}

export function buildBatchManifestCsv(
  rows: Array<{ card_id: string; activation_url: string; status: string }>,
): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = ["card_id,activation_url,status"];
  for (const r of rows) {
    lines.push(`${esc(r.card_id)},${esc(r.activation_url)},${esc(r.status)}`);
  }
  return `${lines.join("\n")}\n`;
}
