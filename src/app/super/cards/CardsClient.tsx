// Copyright (c) 2026 QRslice. All rights reserved.
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Smartphone,
  QrCode,
  Printer,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sliders,
  ZoomIn,
  RotateCw,
  Cpu,
  FileText,
  Check,
  Boxes,
  FileSpreadsheet,
  ChevronRight,
  ShieldAlert,
  Info,
  X,
  Upload,
  Image as ImageIcon,
  LayoutGrid,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { CARD_THEME_IDS, PRINT_SPEC_TEXT } from "@/lib/card-constants";

type ThemeId = (typeof CARD_THEME_IDS)[number];

interface BatchRow {
  id: string;
  name: string;
  theme: ThemeId;
  design_json: {
    businessName: string;
    logoUrl: string | null;
    theme: ThemeId;
    headline: string;
    backTitle: string;
    backLine1: string;
    backLine2: string;
    contactLine: string;
  };
  quantity: number;
  status: "draft" | "exported" | "manufactured";
  created_at: string;
  card_count: number;
}

interface BatchDetail extends Omit<BatchRow, "card_count"> {
  cards: Array<{
    id: string;
    card_id: string;
    activation_url: string;
    status: string;
    svg_front: string | null;
    svg_back: string | null;
    created_at: string;
  }>;
}

interface Reveal {
  card_id: string;
  claim_token: string;
  activation_url: string;
  status: string;
}

const THEME_METADATA: Record<
  ThemeId,
  {
    name: string;
    description: string;
    bg: string;
    ink: string;
    accent: string;
    tag: string;
  }
> = {
  "google-review": {
    name: "Google 5-Star Official",
    description: "Clean Google Material white with Google Blue accents & 5-star badge",
    bg: "#FFFFFF",
    ink: "#202124",
    accent: "#4285F4",
    tag: "Highest Conversion",
  },
  "premium-plum": {
    name: "Royal Plum & Gold",
    description: "Deep luxury velvet plum with brushed gold serif typography",
    bg: "#221040",
    ink: "#FFF9F0",
    accent: "#C9A227",
    tag: "High-End Luxury",
  },
  "minimal-mono": {
    name: "Architectural Mono",
    description: "Swiss brutalist monochrome with high-contrast typewriter typography",
    bg: "#111827",
    ink: "#F9FAFB",
    accent: "#9CA3AF",
    tag: "Modern & Hip",
  },
  "instagram-follow": {
    name: "Instagram Social Boost",
    description: "Vibrant IG gradient accents with camera badge for social follower growth",
    bg: "#FFFFFF",
    ink: "#262626",
    accent: "#E1306C",
    tag: "Social Growth",
  },
  "wifi-connect": {
    name: "Instant Wi-Fi Tap",
    description: "Guest hotspot credential tap card with beacon signal iconography",
    bg: "#0B2545",
    ink: "#EEF4F8",
    accent: "#134074",
    tag: "Hospitality Staple",
  },
  "digital-bizcard": {
    name: "Executive vCard",
    description: "Sleek contact exchange card with dual vCard download & phone tap",
    bg: "#18181B",
    ink: "#FAFAFA",
    accent: "#3B82F6",
    tag: "Networking & C-Suite",
  },
  "menu-order": {
    name: "Dine-In Menu & Order",
    description: "Appetite amber and warm bistro styling for table ordering",
    bg: "#7C2D12",
    ink: "#FFFBEB",
    accent: "#D97706",
    tag: "Restaurants & Bars",
  },
  "appointment-book": {
    name: "Salon & Studio Booking",
    description: "Soft eucalyptus sage with calendar icon for appointments & clinics",
    bg: "#064E3B",
    ink: "#ECFDF5",
    accent: "#10B981",
    tag: "Salons & Clinics",
  },
  "loyalty-rewards": {
    name: "VIP Loyalty & Stamp",
    description: "Midnight emerald with gold crown for repeat visit point tracking",
    bg: "#022C22",
    ink: "#ECFDF5",
    accent: "#F59E0B",
    tag: "Retention & VIP",
  },
  "upi-payment": {
    name: "Instant UPI & Tap Pay",
    description: "NPCI India standard cyan and green theme for zero-friction bill settlements",
    bg: "#0C4A6E",
    ink: "#F0F9FF",
    accent: "#0284C7",
    tag: "Instant Settlements",
  },
  "event-badge": {
    name: "Summit & Pass Badge",
    description: "Cyber cobalt badge with attendee credential verification",
    bg: "#1E1B4B",
    ink: "#EEF2FF",
    accent: "#6366F1",
    tag: "Conferences & VIP",
  },
  "feedback-survey": {
    name: "Private Voice of Guest",
    description: "Discreet internal feedback collector stopping 1-star public rants",
    bg: "#312E81",
    ink: "#EEF2FF",
    accent: "#818CF8",
    tag: "Brand Protection",
  },
  "custom-url": {
    name: "Universal Smart Link",
    description: "Multi-destination dynamic router for any custom domain or landing page",
    bg: "#18181B",
    ink: "#FAFAFA",
    accent: "#A855F7",
    tag: "Flexible Router",
  },
};

export function CardsClient({ initialBatchId }: { initialBatchId?: string }) {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "exported" | "manufactured">("all");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialBatchId ?? null);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Active designer subtab
  const [activeDesignerTab, setActiveDesignerTab] = useState<"brand" | "copy" | "batch">("brand");

  // New-batch form
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTheme, setNewTheme] = useState<ThemeId>("premium-plum");
  const [newQty, setNewQty] = useState(25);
  const [creating, setCreating] = useState(false);

  // Designer controls (zone A)
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeId>("premium-plum");
  const [headline, setHeadline] = useState("Tell us how we did — Google review link inside.");
  const [backTitle, setBackTitle] = useState("Enjoyed your visit?");
  const [backLine1, setBackLine1] = useState("Your words keep us cooking.");
  const [backLine2, setBackLine2] = useState("Scan to find us on Google.");
  const [contactLine, setContactLine] = useState("[ your contact ]");
  const [quantity, setQuantity] = useState(25);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");

  // Preview (zone B)
  const [frontSvg, setFrontSvg] = useState<string>("");
  const [backSvg, setBackSvg] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeSide, setActiveSide] = useState<"both" | "front" | "back">("both");
  const [actualSize, setActualSize] = useState(false);
  const [showBleed, setShowBleed] = useState(true);
  const [showNfcZone, setShowNfcZone] = useState(false);

  // Factory Gang Sheet Imposition
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [sheetFormat, setSheetFormat] = useState<"a4" | "sra3">("a4");
  const [sheetSide, setSheetSide] = useState<"front" | "back">("front");
  const [sheetPage, setSheetPage] = useState(1);
  const [sheetSvg, setSheetSvg] = useState<string>("");
  const [sheetLoading, setSheetLoading] = useState(false);

  // Card list inside Zone C
  const [cardSearch, setCardSearch] = useState("");
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  // Generate / reveal
  const [genCount, setGenCount] = useState(25);
  const [generating, setGenerating] = useState(false);
  const [reveals, setReveals] = useState<Reveal[] | null>(null);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // GSAP animation for batch rows
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.card-batch-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out', clearProps: 'transform' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, statusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchBatches = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/super/cards/batches${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      if (Array.isArray(data.batches)) setBatches(data.batches);
    } catch {
      // keep previous
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    const t = setTimeout(() => fetchBatches(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchBatches]);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/super/cards/batches/${id}`);
      const data = await res.json();
      if (data.batch) {
        const b = data.batch as BatchDetail;
        setDetail(b);
        setBusinessName(b.design_json.businessName ?? "");
        setLogoUrl(b.design_json.logoUrl ?? null);
        setTheme(b.theme);
        setHeadline(b.design_json.headline);
        setBackTitle(b.design_json.backTitle);
        setBackLine1(b.design_json.backLine1);
        setBackLine2(b.design_json.backLine2);
        setContactLine(b.design_json.contactLine);
        setQuantity(b.quantity);
        setGenCount(Math.min(500, Math.max(1, b.quantity || 25)));
      }
    } catch {
      // ignore
    }
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
    else setDetail(null);
  }, [selectedId, fetchDetail]);

  // Live preview via server generator
  useEffect(() => {
    if (!selectedId) {
      setFrontSvg("");
      setBackSvg("");
      return;
    }
    setPreviewLoading(true);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/super/cards/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme,
            card_id: detail?.cards?.[0]?.card_id ?? "QS-8921",
            design: {
              businessName,
              logoUrl,
              headline,
              backTitle,
              backLine1,
              backLine2,
              contactLine,
            },
          }),
        });
        const data = await res.json();
        if (data.front && data.back) {
          setFrontSvg(data.front);
          setBackSvg(data.back);
        }
      } catch {
        // keep previous preview
      }
      setPreviewLoading(false);
    }, 300);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [selectedId, theme, businessName, logoUrl, headline, backTitle, backLine1, backLine2, contactLine, detail?.cards]);

  // Autosave design edits
  const queueSave = useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedId) return;
      setSaveStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await fetch(`/api/super/cards/batches/${selectedId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          });
          setSaveStatus("saved");
          fetchBatches(search);
        } catch {
          setSaveStatus("idle");
        }
      }, 600);
    },
    [selectedId, fetchBatches, search]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/super/cards/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          theme: newTheme,
          quantity: Math.min(500, Math.max(1, newQty)),
          design: { theme: newTheme },
        }),
      });
      const data = await res.json();
      if (data.batch) {
        setShowNew(false);
        setNewName("");
        await fetchBatches();
        setSelectedId(data.batch.id);
        showToast(`Created draft batch "${data.batch.name}"`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleLogoFile(file: File) {
    setUploadError(null);
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      setUploadError("Logo must be PNG, JPEG, WEBP, or SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024 || file.size === 0) {
      setUploadError("Logo must be under 2 MB.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      const res = await fetch("/api/super/cards/upload-logo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setLogoUrl(data.url);
      queueSave({ design: { businessName, logoUrl: data.url, headline, backTitle, backLine1, backLine2, contactLine } });
      showToast("Logo uploaded successfully");
    } catch (err) {
      try {
        const supabase = getSupabaseBrowserClient();
        const ext = file.name.split(".").pop() || "png";
        const path = `qr/card-logo_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("images").upload(path, file, { cacheControl: "3600", upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);
        setLogoUrl(publicUrl);
        queueSave({ design: { businessName, logoUrl: publicUrl, headline, backTitle, backLine1, backLine2, contactLine } });
        showToast("Logo uploaded to storage");
      } catch {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      }
    }
    setUploading(false);
  }

  async function handleGenerate() {
    if (!selectedId) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/super/cards/batches/${selectedId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Math.min(500, Math.max(1, genCount)) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generate failed");
      setReveals(data.reveals);
      setSavedConfirm(false);
      await fetchDetail(selectedId);
      await fetchBatches(search);
      showToast(`Generated ${data.reveals.length} cards with one-time claim tokens.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generate failed");
    }
    setGenerating(false);
  }

  async function handleExport() {
    if (!selectedId) return;
    setActionBusy("export");
    try {
      const res = await fetch(`/api/super/cards/batches/${selectedId}/export?format=zip`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrslice-cards-${detail?.name.replace(/[^a-z0-9-_]+/gi, "-") ?? selectedId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await fetchDetail(selectedId);
      await fetchBatches(search);
      showToast("Print-ready ZIP exported successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed");
    }
    setActionBusy(null);
  }

  async function handleManufactured() {
    if (!selectedId) return;
    setActionBusy("manufactured");
    try {
      const res = await fetch(`/api/super/cards/batches/${selectedId}/manufactured`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      await fetchDetail(selectedId);
      await fetchBatches(search);
      showToast("Batch marked as MANUFACTURED");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
    setActionBusy(null);
  }

  async function handleDisable() {
    if (!selectedId) return;
    if (!confirm("Disable every card in this batch? Active cards will stop redirecting until reactivated.")) return;
    setActionBusy("disable");
    try {
      const res = await fetch(`/api/super/cards/batches/${selectedId}/disable`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Disable failed");
      await fetchDetail(selectedId);
      await fetchBatches(search);
      showToast("All cards in this batch have been disabled.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Disable failed");
    }
    setActionBusy(null);
  }

  useEffect(() => {
    if (!showSheetModal || !selectedId) return;
    let cancelled = false;
    setSheetLoading(true);
    const sheetParam = `${sheetFormat}_${sheetSide}`;
    fetch(`/api/super/cards/batches/${selectedId}/export?sheet=${sheetParam}&page=${sheetPage}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load sheet SVG");
        return res.text();
      })
      .then((svg) => {
        if (!cancelled) setSheetSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setSheetSvg("");
      })
      .finally(() => {
        if (!cancelled) setSheetLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showSheetModal, selectedId, sheetFormat, sheetSide, sheetPage]);

  async function downloadSheetSvg(format: "a4" | "sra3", side: "front" | "back", page = 1) {
    if (!selectedId) return;
    const sheetParam = `${format}_${side}`;
    const url = `/api/super/cards/batches/${selectedId}/export?sheet=${sheetParam}&page=${page}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to download gang sheet");
      }
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `gang-sheet-${format.toUpperCase()}-${side.toUpperCase()}-page${page}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      showToast(`Downloaded ${format.toUpperCase()} ${side.toUpperCase()} Sheet (Page ${page})`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Download failed");
    }
  }

  function copyReveals() {
    if (!reveals) return;
    const lines = [
      "card_id,claim_token,activation_url",
      ...reveals.map((r) => `${r.card_id},${r.claim_token},${r.activation_url}`),
    ];
    navigator.clipboard?.writeText(lines.join("\n")).then(() => {
      showToast("Copied all tokens as CSV to clipboard!");
    });
  }

  const copyCardUrl = (cardId: string, url: string) => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedCardId(cardId);
      setTimeout(() => setCopiedCardId(null), 2000);
      showToast(`Copied activation link for ${cardId}`);
    });
  };

  // KPI Calculations
  const totalCardsInSystem = batches.reduce((acc, b) => acc + (b.card_count || 0), 0);
  const manufacturedBatches = batches.filter((b) => b.status === "manufactured");
  const exportedBatches = batches.filter((b) => b.status === "exported");
  const draftBatches = batches.filter((b) => b.status === "draft");

  const filteredBatches = batches.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  const filteredCards = detail?.cards.filter((c) => {
    if (!cardSearch.trim()) return true;
    return c.card_id.toLowerCase().includes(cardSearch.toLowerCase().trim());
  }) || [];

  return (
    <div ref={containerRef} className="space-y-8 font-[family-name:var(--font-plus-jakarta)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#221040] text-white text-xs font-mono font-bold shadow-2xl border border-violet-400/30 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Super Header Banner with Double-Bezel Architecture */}
      <div className="p-1.5 rounded-[2.5rem] bg-gradient-to-b from-white/20 via-violet-900/10 to-transparent border border-white/40 shadow-2xl">
        <div className="rounded-[2.25rem] bg-gradient-to-r from-[#1A0B33] via-[#2A1650] to-[#4C1D95] text-white p-6 sm:p-8 relative overflow-hidden border border-violet-900/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <Link
                href="/super"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-violet-200 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-xs w-fit active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Super Admin Platform</span>
              </Link>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-violet-200 shadow-inner">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-sora)] font-extrabold tracking-tight">
                    CR80 Smart NFC Card Studio
                  </h1>
                  <p className="text-xs sm:text-sm text-violet-200/80 font-medium">
                    Authoritative ISO/IEC 7810 ID-1 card design engine, cryptographically secure batch generator &amp; factory SVG exporter.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchBatches(search)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] cursor-pointer shadow-inner"
                title="Refresh all batches"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {/* Nested Button-in-Button CTA */}
              <button
                onClick={() => setShowNew(true)}
                className="group pl-5 pr-2 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#221040] font-black text-xs transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 cursor-pointer shadow-lg hover:shadow-xl font-[family-name:var(--font-sora)]"
              >
                <span>Create New Batch</span>
                <div className="w-7 h-7 rounded-full bg-[#221040]/10 group-hover:bg-[#221040]/20 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-90">
                  <Plus className="w-4 h-4 text-[#221040]" />
                </div>
              </button>
            </div>
          </div>

          {/* Studio KPI Stats with Nested Concentric Bezels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-300 hover:scale-[1.01]">
              <div className="text-[10px] font-mono text-violet-200/70 font-semibold uppercase tracking-wider">Total Batches</div>
              <div className="text-2xl font-mono font-extrabold text-white mt-0.5">{batches.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-300 hover:scale-[1.01]">
              <div className="text-[10px] font-mono text-violet-200/70 font-semibold uppercase tracking-wider">Cards Minted</div>
              <div className="text-2xl font-mono font-extrabold text-amber-300 mt-0.5">{totalCardsInSystem}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-300 hover:scale-[1.01]">
              <div className="text-[10px] font-mono text-violet-200/70 font-semibold uppercase tracking-wider">Manufactured Stock</div>
              <div className="text-2xl font-mono font-extrabold text-emerald-300 mt-0.5">{manufacturedBatches.length} batches</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-300 hover:scale-[1.01]">
              <div className="text-[10px] font-mono text-violet-200/70 font-semibold uppercase tracking-wider">Exported Runs</div>
              <div className="text-2xl font-mono font-extrabold text-sky-300 mt-0.5">{exportedBatches.length} runs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Selector & Filter Grid */}
      <div className="rounded-3xl bg-white border border-[#E4DBF7] shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF5FF] border border-[#E4DBF7] text-xs font-mono">
            {[
              { id: "all", label: "All Batches", count: batches.length },
              { id: "draft", label: "Drafts", count: draftBatches.length },
              { id: "exported", label: "Exported", count: exportedBatches.length },
              { id: "manufactured", label: "Manufactured", count: manufacturedBatches.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#221040] text-white shadow-xs"
                    : "text-[#5B4A85] hover:text-[#221040]"
                }`}
              >
                {tab.label} <span className="opacity-60 text-[10px]">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#5B4A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch or card ID (QS-…)"
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF5FF] border border-[#E4DBF7] text-xs font-mono text-[#2A1650] placeholder-[#5B4A85]/60 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B4A85] hover:text-[#2A1650]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Batches Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E4DBF7]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5FF] border-b border-[#E4DBF7] text-[#5B4A85] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Batch Identity &amp; Theme</th>
                <th className="py-3.5 px-4 text-center">Batch Size</th>
                <th className="py-3.5 px-4 text-center">Lifecycle Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Studio Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DBF7]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#5B4A85] font-mono">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#7C3AED]" />
                      <span>Loading manufacturing batches…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#5B4A85] font-mono">
                    <Boxes className="w-8 h-8 text-[#E4DBF7] mx-auto mb-2" />
                    <p className="font-bold text-[#2A1650]">No batches match your filter.</p>
                    <p className="text-[11px] text-[#5B4A85] mt-0.5">Click &quot;Create New Batch&quot; above to begin a fresh card production run.</p>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => {
                  const isSelected = selectedId === b.id;
                  const themeMeta = THEME_METADATA[b.theme];
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedId(b.id)}
                      className={`card-batch-row transition-all cursor-pointer ${
                        isSelected
                          ? "bg-violet-100/60 font-medium"
                          : "hover:bg-[#FAF8FF]"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-5 rounded border border-black/20 shadow-2xs shrink-0 flex items-center justify-center text-[7px] font-bold font-mono"
                            style={{ background: themeMeta.bg, color: themeMeta.ink }}
                          >
                            CR80
                          </div>
                          <div>
                            <div className="font-bold text-[#2A1650] flex items-center gap-2">
                              <span>{b.name}</span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-[#7C3AED] text-white text-[9px] font-mono font-bold">
                                  EDITING
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#5B4A85] font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{themeMeta.name}</span>
                              <span>•</span>
                              <span className="font-bold text-[#7C3AED]">{b.card_count} minted</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#2A1650]">
                        {b.quantity} cards
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border ${
                            b.status === "manufactured"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : b.status === "exported"
                              ? "bg-sky-50 text-sky-800 border-sky-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          {b.status === "manufactured" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {b.status === "exported" && <Download className="w-3 h-3 text-sky-600" />}
                          {b.status === "draft" && <Sliders className="w-3 h-3 text-amber-600" />}
                          {b.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#5B4A85] font-mono text-[11px]">
                        {new Date(b.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(b.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#221040] text-white shadow-xs"
                              : "bg-[#FAF5FF] border border-[#E4DBF7] text-[#5B21B6] hover:bg-violet-100"
                          }`}
                        >
                          {isSelected ? "Open Studio ✓" : "Open Studio →"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDIO DESIGNER SUITE (3 Zones) */}
      {selectedId && (
        <div className="rounded-3xl bg-white border border-[#E4DBF7] shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
          {/* Studio Top Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E4DBF7] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-violet-100 text-[#5B21B6] border border-violet-200">
                  STUDIO WORKSPACE
                </span>
                <span className="text-xs font-mono text-[#5B4A85]">
                  ID: <span className="font-bold text-[#2A1650]">{detail?.id.slice(0, 13)}…</span>
                </span>
                {saveStatus === "saving" && (
                  <span className="text-[11px] font-mono text-amber-600 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Saving changes…
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-bold">
                    <Check className="w-3 h-3" /> Saved to Cloud
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-[family-name:var(--font-sora)] font-extrabold text-[#2A1650]">
                {detailLoading ? "Loading Batch Design…" : detail?.name || "Batch Designer"}
              </h2>
            </div>

            {/* Main Action Hub */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FAF5FF] border border-[#E4DBF7] shadow-inner">
                <span className="text-[11px] font-mono font-bold text-[#5B4A85] pl-2.5">Mint:</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-full bg-white border border-[#E4DBF7] font-mono text-xs font-bold text-[#2A1650] text-center focus:outline-none focus:border-[#7C3AED]"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="group pl-3.5 pr-2 py-1.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-mono font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>{generating ? "Minting…" : "Generate Cards"}</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                    {generating ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowSheetModal(true)}
                className="group pl-4 pr-2 py-2 rounded-full bg-[#FAF5FF] hover:bg-violet-100 text-[#5B21B6] border border-[#E4DBF7] text-xs font-mono font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-2.5 shadow-xs"
                title="Preview & Export Multi-Up Print Gang Sheets"
              >
                <span>Gang Sheets</span>
                <div className="w-6 h-6 rounded-full bg-violet-200/60 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                  <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                </div>
              </button>

              <button
                onClick={handleExport}
                disabled={actionBusy === "export"}
                className="group pl-5 pr-2.5 py-2 rounded-full bg-[#221040] hover:bg-[#321760] text-white text-xs font-mono font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2.5 shadow-md"
              >
                <span>Export Factory ZIP</span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                  {actionBusy === "export" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                  )}
                </div>
              </button>

              <button
                onClick={handleManufactured}
                disabled={actionBusy === "manufactured" || detail?.status === "manufactured"}
                className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white text-xs font-mono font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Manufactured</span>
              </button>

              <button
                onClick={handleDisable}
                disabled={actionBusy === "disable"}
                className="p-2.5 rounded-full bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-mono font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] cursor-pointer shadow-xs"
                title="Deactivate all cards in this batch"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3-Zone Interactive Studio Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr_320px] gap-6 items-start">
            {/* ZONE A: Controls & Copywriting Studio */}
            <div className="space-y-4 p-5 rounded-3xl bg-[#FAF5FF] border border-[#E4DBF7] shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#2A1650]">
                    Zone A · Design System
                  </span>
                </div>
              </div>

              {/* Designer Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white border border-[#E4DBF7] text-xs font-mono font-bold shadow-inner">
                <button
                  onClick={() => setActiveDesignerTab("brand")}
                  className={`py-1.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                    activeDesignerTab === "brand"
                      ? "bg-[#7C3AED] text-white shadow-xs"
                      : "text-[#5B4A85] hover:text-[#2A1650]"
                  }`}
                >
                  Brand
                </button>
                <button
                  onClick={() => setActiveDesignerTab("copy")}
                  className={`py-1.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                    activeDesignerTab === "copy"
                      ? "bg-[#7C3AED] text-white shadow-xs"
                      : "text-[#5B4A85] hover:text-[#2A1650]"
                  }`}
                >
                  Copy
                </button>
                <button
                  onClick={() => setActiveDesignerTab("batch")}
                  className={`py-1.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                    activeDesignerTab === "batch"
                      ? "bg-[#7C3AED] text-white shadow-xs"
                      : "text-[#5B4A85] hover:text-[#2A1650]"
                  }`}
                >
                  Config
                </button>
              </div>

              {/* Tab 1: Brand & Theme */}
              {activeDesignerTab === "brand" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-mono font-bold text-[#2A1650] block mb-1">
                      Establishment / Brand Name *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        queueSave({
                          design: {
                            businessName: e.target.value,
                            logoUrl,
                            headline,
                            backTitle,
                            backLine1,
                            backLine2,
                            contactLine,
                          },
                        });
                      }}
                      placeholder="e.g. Curry Leaf Artisan Kitchen"
                      maxLength={80}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#E4DBF7] text-xs font-mono text-[#2A1650] focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-[#2A1650] block mb-1">
                      Brand Logo Vector / PNG (≤ 2 MB)
                    </label>
                    <div className="p-3 rounded-2xl bg-white border border-dashed border-[#E4DBF7] space-y-2 text-center">
                      {logoUrl ? (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF5FF] border border-[#E4DBF7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logoUrl}
                            alt="Brand Logo"
                            className="h-8 max-w-[120px] object-contain rounded bg-white p-1 border border-[#E4DBF7]"
                          />
                          <button
                            onClick={() => {
                              setLogoUrl(null);
                              queueSave({
                                design: {
                                  businessName,
                                  logoUrl: null,
                                  headline,
                                  backTitle,
                                  backLine1,
                                  backLine2,
                                  contactLine,
                                },
                              });
                            }}
                            className="text-[11px] font-mono font-bold text-rose-600 hover:text-rose-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleLogoFile(f);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5FF] border border-[#E4DBF7] text-xs font-mono font-bold text-[#5B21B6] hover:bg-violet-100 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select Logo File</span>
                          </label>
                        </div>
                      )}
                      {uploading && <p className="text-[11px] font-mono text-[#7C3AED]">Uploading logo…</p>}
                      {uploadError && <p className="text-[11px] font-mono text-rose-600">{uploadError}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-[#2A1650] block mb-2">
                      CR80 Finish Theme (13 Market Presets)
                    </label>
                    <div className="space-y-2">
                      {CARD_THEME_IDS.map((t) => {
                        const meta = THEME_METADATA[t];
                        const isCurrent = theme === t;
                        return (
                          <div
                            key={t}
                            onClick={() => {
                              setTheme(t);
                              queueSave({
                                theme: t,
                                design: {
                                  businessName,
                                  logoUrl,
                                  headline,
                                  backTitle,
                                  backLine1,
                                  backLine2,
                                  contactLine,
                                  theme: t,
                                },
                              });
                            }}
                            className={`p-3 rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99] cursor-pointer flex items-center justify-between ${
                              isCurrent
                                ? "bg-white border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs"
                                : "bg-white/80 border-[#E4DBF7] hover:border-violet-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-7 rounded-lg border border-black/15 shadow-2xs shrink-0 flex items-center justify-center font-mono font-bold text-[8px]"
                                style={{ background: meta.bg, color: meta.ink }}
                              >
                                CR80
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#2A1650]">{meta.name}</div>
                                <div className="text-[10px] text-[#5B4A85] leading-tight">{meta.description}</div>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#5B21B6] border border-[#E4DBF7]">
                              {meta.tag}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Copywriting */}
              {activeDesignerTab === "copy" && (
                <div className="space-y-3.5 pt-1 font-mono text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#2A1650]">Front Card Headline</label>
                      <span className="text-[10px] text-[#5B4A85]">{headline.length}/140</span>
                    </div>
                    <textarea
                      rows={2}
                      value={headline}
                      onChange={(e) => {
                        setHeadline(e.target.value);
                        queueSave({
                          design: {
                            businessName,
                            logoUrl,
                            headline: e.target.value,
                            backTitle,
                            backLine1,
                            backLine2,
                            contactLine,
                          },
                        });
                      }}
                      maxLength={140}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#E4DBF7] text-xs text-[#2A1650] focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#2A1650] block mb-1">Back Title</label>
                    <input
                      type="text"
                      value={backTitle}
                      onChange={(e) => {
                        setBackTitle(e.target.value);
                        queueSave({
                          design: {
                            businessName,
                            logoUrl,
                            headline,
                            backTitle: e.target.value,
                            backLine1,
                            backLine2,
                            contactLine,
                          },
                        });
                      }}
                      placeholder="Back title"
                      maxLength={80}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#E4DBF7] text-xs text-[#2A1650] focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#2A1650] block mb-1">Back Body Line 1</label>
                    <input
                      type="text"
                      value={backLine1}
                      onChange={(e) => {
                        setBackLine1(e.target.value);
                        queueSave({
                          design: {
                            businessName,
                            logoUrl,
                            headline,
                            backTitle,
                            backLine1: e.target.value,
                            backLine2,
                            contactLine,
                          },
                        });
                      }}
                      placeholder="e.g. Your words keep us cooking."
                      maxLength={120}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#E4DBF7] text-xs text-[#2A1650] focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#2A1650] block mb-1">Back Body Line 2</label>
                    <input
                      type="text"
                      value={backLine2}
                      onChange={(e) => {
                        setBackLine2(e.target.value);
                        queueSave({
                          design: {
                            businessName,
                            logoUrl,
                            headline,
                            backTitle,
                            backLine1,
                            backLine2,
                            contactLine,
                          },
                        });
                      }}
                      placeholder="e.g. Scan or tap to rate on Google."
                      maxLength={120}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#E4DBF7] text-xs text-[#2A1650] focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#2A1650] block mb-1">Contact / Address Footer Line</label>
                    <input
                      type="text"
                      value={contactLine}
                      onChange={(e) => {
                        setContactLine(e.target.value);
                        queueSave({
                          design: {
                            businessName,
                            logoUrl,
                            headline,
                            backTitle,
                            backLine1,
                            backLine2,
                            contactLine,
                          },
                        });
                      }}
                      placeholder="e.g. hello@curryleaf.in • Indiranagar, Bengaluru"
                      maxLength={120}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#E4DBF7] text-xs text-[#2A1650] focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Batch Config */}
              {activeDesignerTab === "batch" && (
                <div className="space-y-4 pt-1 font-mono text-xs">
                  <div>
                    <label className="font-bold text-[#2A1650] block mb-1">Card ID Prefix</label>
                    <input
                      value="QS-"
                      readOnly
                      className="w-full p-2.5 rounded-2xl bg-[#E4DBF7]/40 border border-[#E4DBF7] text-[#5B21B6] font-bold"
                    />
                    <p className="text-[10px] text-[#5B4A85] mt-1">Standard 5-character high-readability alphabet (e.g. QS-8921)</p>
                  </div>

                  <div>
                    <label className="font-bold text-[#2A1650] block mb-1">Target Production Run Quantity (1–500)</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={quantity}
                      onChange={(e) => {
                        const v = Math.min(500, Math.max(1, Number(e.target.value)));
                        setQuantity(v);
                        queueSave({ quantity: v });
                      }}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#E4DBF7] font-bold text-[#2A1650]"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E4DBF7] space-y-2">
                    <div className="font-bold text-[#2A1650] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Security Standard</span>
                    </div>
                    <p className="text-[11px] text-[#5B4A85] leading-relaxed">
                      Every card in this batch receives a cryptographically generated UUID claim token that is SHA-256 hashed in database storage.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ZONE B: Live Studio Preview & Mockup Stage with Double-Bezel Architecture */}
            <div className="p-1.5 rounded-[2.25rem] bg-gradient-to-b from-violet-700/30 via-violet-950/40 to-black/80 border border-violet-700/40 shadow-2xl">
              <div className="rounded-[2rem] bg-[#0F0826] p-5 sm:p-6 space-y-4 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                {/* Studio Stage Header Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-white">
                      Zone B · Live Studio Rendering {previewLoading ? "· (rendering…)" : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-bold">
                    {/* Side Switch */}
                    <div className="flex items-center p-0.5 rounded-xl bg-white/10 border border-white/10">
                      {(["both", "front", "back"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setActiveSide(s)}
                          className={`px-2.5 py-1 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                            activeSide === s ? "bg-white text-[#221040] shadow-xs font-black" : "text-violet-200 hover:text-white"
                          }`}
                        >
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Bleed Overlay Toggle */}
                    <button
                      onClick={() => setShowBleed((v) => !v)}
                      className={`px-2.5 py-1.5 rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                        showBleed
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/40 font-bold"
                          : "bg-white/10 text-white/70 border-white/10 hover:bg-white/15"
                      }`}
                      title="Toggle 3mm Bleed & Safe Area Guides"
                    >
                      Bleed Guides
                    </button>

                    {/* True 1:1 Scale */}
                    <button
                      onClick={() => setActualSize((v) => !v)}
                      className={`px-2.5 py-1.5 rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                        actualSize
                          ? "bg-violet-500/30 text-violet-200 border-violet-400 font-bold"
                          : "bg-white/10 text-white/70 border-white/10 hover:bg-white/15"
                      }`}
                      title="Toggle 1:1 Exact Physical Size (85.6mm)"
                    >
                      1:1 Scale
                    </button>
                  </div>
                </div>

                {/* Physical Dimension Meta Ribbon */}
                <div className="flex items-center justify-between text-[11px] font-mono text-violet-200/60 px-1">
                  <span>
                    CR80 Dimensions: 53.98 × 85.60 mm (Portrait) (3.18mm Corner Radius)
                  </span>
                  <span>
                    Bleed Canvas: 60.00 × 91.60 mm
                  </span>
                </div>

              {/* SVG Mockup Stage Canvas */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[radial-gradient(#2A1650_1px,transparent_1px)] [background-size:16px_16px] bg-[#160B33] border border-white/10 min-h-[380px] flex items-center justify-center">
                <div
                  className={`w-full ${
                    activeSide === "both"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[680px] mx-auto"
                      : "max-w-[320px] mx-auto"
                  }`}
                >
                  {(activeSide === "both" || activeSide === "front") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-violet-300 font-bold px-1">
                        <span>FRONT FACE</span>
                        <span className="text-[10px] opacity-60">Icon &amp; NFC Tap Zone</span>
                      </div>
                      <div className="relative rounded-3xl p-3 bg-gradient-to-b from-white/12 via-white/5 to-transparent border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex justify-center overflow-hidden transition-all duration-300 hover:border-violet-400/40 group">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 mix-blend-overlay rounded-3xl transition-opacity duration-300 group-hover:opacity-75 z-10" />
                        {frontSvg ? (
                          <div
                            className="relative [&>svg]:h-auto [&>svg]:w-full transition-all duration-300 group-hover:scale-[1.015] rounded-[18px] overflow-hidden shadow-2xl ring-1 ring-white/20"
                            style={
                              actualSize
                                ? { width: "60.0mm" }
                                : { width: "100%", maxWidth: 300 }
                            }
                            dangerouslySetInnerHTML={{ __html: frontSvg }}
                          />
                        ) : (
                          <div className="text-xs font-mono text-violet-300/40 py-20">Rendering Front Face…</div>
                        )}
                        {showBleed && frontSvg && (
                          <div className="pointer-events-none absolute inset-2 rounded-xl z-20">
                            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-amber-400/70" title="3mm Bleed Edge" />
                            <div className="absolute rounded border border-dashed border-violet-300/70" style={{ inset: "6% 5%" }} title="Safe Printing Zone" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(activeSide === "both" || activeSide === "back") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-violet-300 font-bold px-1">
                        <span>BACK FACE</span>
                        <span className="text-[10px] opacity-60">High-Contrast QR Code</span>
                      </div>
                      <div className="relative rounded-3xl p-3 bg-gradient-to-b from-white/12 via-white/5 to-transparent border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex justify-center overflow-hidden transition-all duration-300 hover:border-violet-400/40 group">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 mix-blend-overlay rounded-3xl transition-opacity duration-300 group-hover:opacity-75 z-10" />
                        {backSvg ? (
                          <div
                            className="relative [&>svg]:h-auto [&>svg]:w-full transition-all duration-300 group-hover:scale-[1.015] rounded-[18px] overflow-hidden shadow-2xl ring-1 ring-white/20"
                            style={
                              actualSize
                                ? { width: "60.0mm" }
                                : { width: "100%", maxWidth: 300 }
                            }
                            dangerouslySetInnerHTML={{ __html: backSvg }}
                          />
                        ) : (
                          <div className="text-xs font-mono text-violet-300/40 py-20">Rendering Back Face…</div>
                        )}
                        {showBleed && backSvg && (
                          <div className="pointer-events-none absolute inset-2 rounded-xl z-20">
                            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-amber-400/70" title="3mm Bleed Edge" />
                            <div className="absolute rounded border border-dashed border-violet-300/70" style={{ inset: "6% 5%" }} title="Safe Printing Zone" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-violet-200/60 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Vector SVGs freeze at export time (re-export is 100% byte-identical).
                </span>
                <span className="font-bold text-amber-300">30 mil Matte PVC Quality</span>
              </div>
            </div>
          </div>

          {/* ZONE C: Hardware Inspector & Spec Sheet */}
            <div className="space-y-4 p-5 rounded-3xl bg-[#FAF5FF] border border-[#E4DBF7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#2A1650]">
                    Zone C · Spec Sheet
                  </span>
                </div>
              </div>

              {/* Vendor Specs Summary */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E4DBF7] space-y-2 text-xs font-mono">
                <div className="font-bold text-[#2A1650] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>ISO/IEC 7810 ID-1 Spec</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#5B4A85] leading-relaxed">
                  <p>• <strong>Size:</strong> 85.60 × 53.98 × 0.76 mm</p>
                  <p>• <strong>Material:</strong> 30 mil Matte PVC</p>
                  <p>• <strong>Inlay:</strong> NXP NTAG213 (144 bytes)</p>
                  <p>• <strong>QR:</strong> EC-H (30% error correction)</p>
                  <p>• <strong>Bleed:</strong> 3 mm bleed on all 4 edges</p>
                </div>
              </div>

              {/* Factory Gang Sheet Imposition Card */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E4DBF7] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between font-bold text-[#2A1650]">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Gang Sheet Imposition</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Duplex Ready
                  </span>
                </div>

                <p className="text-[11px] text-[#5B4A85] leading-relaxed">
                  Dual Standard multi-up print gang sheets with corner crop marks, 3mm bleed, and column-mirrored duplex backs.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-[#FAF5FF] border border-[#E4DBF7] space-y-1.5">
                    <div className="font-bold text-[#2A1650] text-[11px] flex items-center justify-between">
                      <span>A4 (8-Up)</span>
                      <span className="text-[9px] text-[#5B4A85]">2×4 Grid</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadSheetSvg("a4", "front", 1)}
                        className="flex-1 py-1 rounded-lg bg-white border border-[#E4DBF7] text-[10px] font-bold text-[#5B21B6] hover:bg-violet-50 cursor-pointer text-center"
                        title="Download A4 Front Sheet"
                      >
                        Front
                      </button>
                      <button
                        onClick={() => downloadSheetSvg("a4", "back", 1)}
                        className="flex-1 py-1 rounded-lg bg-white border border-[#E4DBF7] text-[10px] font-bold text-[#5B21B6] hover:bg-violet-50 cursor-pointer text-center"
                        title="Download A4 Back Sheet (Duplex Mirrored)"
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF5FF] border border-[#E4DBF7] space-y-1.5">
                    <div className="font-bold text-[#2A1650] text-[11px] flex items-center justify-between">
                      <span>SRA3 (21-Up)</span>
                      <span className="text-[9px] text-[#5B4A85]">3×7 Grid</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadSheetSvg("sra3", "front", 1)}
                        className="flex-1 py-1 rounded-lg bg-white border border-[#E4DBF7] text-[10px] font-bold text-[#5B21B6] hover:bg-violet-50 cursor-pointer text-center"
                        title="Download SRA3 Front Sheet"
                      >
                        Front
                      </button>
                      <button
                        onClick={() => downloadSheetSvg("sra3", "back", 1)}
                        className="flex-1 py-1 rounded-lg bg-white border border-[#E4DBF7] text-[10px] font-bold text-[#5B21B6] hover:bg-violet-50 cursor-pointer text-center"
                        title="Download SRA3 Back Sheet (Duplex Mirrored)"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSheetModal(true)}
                  className="w-full py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Gang Sheet Preview</span>
                </button>
              </div>

              {/* Cards in this Batch Inspector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-[#2A1650]">
                  <span>Minted Cards ({detail?.cards.length || 0})</span>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 text-[#5B4A85] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    placeholder="Filter cards (QS-…)"
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E4DBF7] text-[11px] font-mono text-[#2A1650] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto rounded-2xl border border-[#E4DBF7] divide-y divide-[#E4DBF7] bg-white text-xs font-mono">
                  {filteredCards.length === 0 ? (
                    <div className="p-6 text-center text-[#5B4A85] text-[11px]">
                      No cards minted yet. Click &quot;Generate Cards&quot; in the toolbar above.
                    </div>
                  ) : (
                    filteredCards.map((c) => (
                      <div key={c.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-[#FAF8FF]">
                        <div>
                          <div className="font-bold text-[#2A1650]">{c.card_id}</div>
                          <div className="text-[10px] text-[#5B4A85]">{c.status}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyCardUrl(c.card_id, c.activation_url)}
                            className="p-1.5 rounded-lg bg-[#FAF5FF] border border-[#E4DBF7] text-[#5B21B6] hover:bg-violet-100 cursor-pointer"
                            title="Copy Activation Link"
                          >
                            {copiedCardId === c.card_id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={c.activation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#FAF5FF] border border-[#E4DBF7] text-[#5B21B6] hover:bg-violet-100 cursor-pointer"
                            title="Simulate NFC Tap"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Batch Creation Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white border border-[#E4DBF7] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-[#7C3AED] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-[family-name:var(--font-sora)] font-extrabold text-[#2A1650]">
                  New Manufacturing Batch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="p-1 rounded-full text-[#5B4A85] hover:bg-violet-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5B4A85] font-medium leading-relaxed">
              Initialize a fresh CR80 review card batch. You will configure the visual artwork and mint one-time claim tokens in the Studio.
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="font-bold text-[#2A1650] block mb-1">Batch Production Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. BATCH-2026-OCT-A (Retail Cards)"
                  maxLength={120}
                  className="w-full p-3 rounded-2xl bg-[#FAF5FF] border border-[#E4DBF7] text-xs font-bold text-[#2A1650] focus:border-[#7C3AED] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#2A1650] block mb-1">Initial Theme Preset</label>
                <select
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value as ThemeId)}
                  className="w-full p-3 rounded-2xl bg-[#FAF5FF] border border-[#E4DBF7] text-xs font-bold text-[#2A1650] focus:border-[#7C3AED]"
                >
                  {CARD_THEME_IDS.map((t) => (
                    <option key={t} value={t}>
                      {THEME_METADATA[t].name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#2A1650] block mb-1">Planned Card Quantity (1–500)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl bg-[#FAF5FF] border border-[#E4DBF7] text-xs font-bold text-[#2A1650] focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4DBF7]">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-mono font-bold text-[#5B4A85] hover:bg-violet-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {creating ? "Creating Draft…" : "Create & Launch Studio"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* One-Time Secure Token Reveal Modal */}
      {reveals && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DBF7] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-[family-name:var(--font-sora)] font-extrabold text-[#2A1650]">
                  One-Time Secret Claim Tokens
                </h3>
                <p className="text-xs text-[#5B4A85]">
                  Shown only once upon generation. Stored as cryptographic SHA-256 hashes in database.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              ⚠️ <strong>Factory Programmer Alert:</strong> Save these raw claim tokens now. When customers scan their physical CR80 card or package, this token authorizes them to attach the hardware to their QRslice restaurant.
            </div>

            <div className="max-h-60 overflow-y-auto rounded-2xl border border-[#E4DBF7] divide-y divide-[#E4DBF7] text-xs bg-[#FAF5FF]">
              {reveals.map((r) => (
                <div key={r.card_id} className="p-3 space-y-1">
                  <div className="font-bold text-[#2A1650] flex items-center justify-between">
                    <span>Card ID: {r.card_id}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      READY TO BURN
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5B4A85] break-all">
                    Claim Token: <span className="font-bold text-[#221040]">{r.claim_token}</span>
                  </div>
                  <div className="text-[10px] text-[#7C3AED] break-all">
                    NFC Burn URL: {r.activation_url}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 text-xs text-[#2A1650] cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedConfirm}
                  onChange={(e) => setSavedConfirm(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E4DBF7] text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <span className="font-bold">I have exported / safely stored these claim tokens for hardware packaging.</span>
              </label>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E4DBF7]">
                <button
                  onClick={copyReveals}
                  className="px-4 py-2.5 rounded-2xl bg-[#221040] text-white text-xs font-bold hover:bg-[#321760] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All as CSV</span>
                </button>

                <button
                  onClick={() => savedConfirm && setReveals(null)}
                  disabled={!savedConfirm}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Confirm &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Factory Gang Sheet Imposition Inspector Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in-50 duration-200">
          <div className="bg-[#0F0826] border border-violet-900/60 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-white font-mono">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-[#160B33]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-600/30 text-amber-300 border border-violet-500/40 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-[family-name:var(--font-sora)] font-extrabold text-white flex items-center gap-2">
                    <span>Factory Gang Sheet Imposition</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      ISO/IEC 7810 Ready
                    </span>
                  </h3>
                  <p className="text-xs text-violet-300/70">
                    Dual Standard Imposition (A4 8-Up &amp; SRA3 21-Up) with Duplex Column Mirroring &amp; Cut Crop Marks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSheetModal(false)}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls Bar */}
            <div className="px-5 sm:px-6 py-3.5 border-b border-white/10 bg-[#12092B] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Format Selector */}
                <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/10">
                  <button
                    onClick={() => {
                      setSheetFormat("a4");
                      setSheetPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      sheetFormat === "a4" ? "bg-white text-[#221040] shadow-xs" : "text-violet-200 hover:text-white"
                    }`}
                  >
                    A4 (8-Up · 2×4)
                  </button>
                  <button
                    onClick={() => {
                      setSheetFormat("sra3");
                      setSheetPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      sheetFormat === "sra3" ? "bg-white text-[#221040] shadow-xs" : "text-violet-200 hover:text-white"
                    }`}
                  >
                    SRA3 (21-Up · 3×7)
                  </button>
                </div>

                {/* Side Selector */}
                <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/10">
                  <button
                    onClick={() => setSheetSide("front")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      sheetSide === "front" ? "bg-amber-400 text-[#221040] shadow-xs" : "text-violet-200 hover:text-white"
                    }`}
                  >
                    Front Face
                  </button>
                  <button
                    onClick={() => setSheetSide("back")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      sheetSide === "back" ? "bg-amber-400 text-[#221040] shadow-xs" : "text-violet-200 hover:text-white"
                    }`}
                  >
                    Back Face (Mirrored)
                  </button>
                </div>

                {/* Page Navigation */}
                {(() => {
                  const totalCards = detail?.cards?.length || detail?.quantity || 1;
                  const cardsPerPage = sheetFormat === "a4" ? 8 : 21;
                  const totalPages = Math.max(1, Math.ceil(totalCards / cardsPerPage));
                  if (totalPages <= 1) return null;
                  return (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/10 border border-white/10 text-[11px]">
                      <button
                        onClick={() => setSheetPage((p) => Math.max(1, p - 1))}
                        disabled={sheetPage <= 1}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer"
                      >
                        ←
                      </button>
                      <span>
                        Page {sheetPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setSheetPage((p) => Math.min(totalPages, p + 1))}
                        disabled={sheetPage >= totalPages}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer"
                      >
                        →
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadSheetSvg(sheetFormat, sheetSide, sheetPage)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
                <button
                  onClick={handleExport}
                  disabled={actionBusy === "export"}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                  <span>Export All ZIP</span>
                </button>
              </div>
            </div>

            {/* SVG Sheet Viewport Stage */}
            <div className="flex-1 min-h-[420px] max-h-[560px] overflow-auto p-6 bg-[radial-gradient(#2A1650_1px,transparent_1px)] [background-size:16px_16px] bg-[#0A041B] flex items-center justify-center">
              {sheetLoading ? (
                <div className="text-center space-y-3 py-20 text-violet-300">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-300" />
                  <p className="text-xs font-bold">Compiling Factory Imposition Sheet…</p>
                </div>
              ) : sheetSvg ? (
                <div
                  className="w-full max-w-[760px] shadow-2xl rounded-lg overflow-hidden bg-white p-2 transition-all duration-200 [&>svg]:w-full [&>svg]:h-auto border border-white/20"
                  dangerouslySetInnerHTML={{ __html: sheetSvg }}
                />
              ) : (
                <div className="text-center space-y-2 py-20 text-violet-300/60">
                  <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
                  <p className="text-xs">No vector data returned for this sheet.</p>
                </div>
              )}
            </div>

            {/* Sheet Metadata Ribbon */}
            <div className="px-5 sm:px-6 py-3 bg-[#160B33] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-violet-200/70">
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  📐 <strong>Sheet Dimensions:</strong>{" "}
                  {sheetFormat === "a4" ? "210.00 × 297.00 mm (A4)" : "320.00 × 450.00 mm (SRA3)"}
                </span>
                <span>
                  ✂️ <strong>Crop Marks:</strong> 5mm Offset (3mm Bleed Protected)
                </span>
                <span>
                  🔄 <strong>Duplex:</strong>{" "}
                  {sheetSide === "back" ? "Col-Mirrored (Aligned)" : "Standard Column 0→N"}
                </span>
              </div>
              <div className="text-amber-300 font-bold">
                {detail?.cards?.length || 0} Cards in Run · {Math.ceil((detail?.cards?.length || 1) / (sheetFormat === "a4" ? 8 : 21))} Sheet(s)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
