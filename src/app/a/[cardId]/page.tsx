// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { resolveCard } from "@/lib/card-service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { SmartShowcaseView } from "@/components/showcase/SmartShowcaseView";
import FeedbackClient from "./FeedbackClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ cardId: string }>;
}

export default async function CardResolvePage({ params }: PageProps) {
  const { cardId } = await params;

  // 1. Resolve card server-side
  const supabase = createSupabaseAdmin();
  const card = await resolveCard(cardId, supabase);

  // 2. Uniform 404 for unknown or malformed IDs (anti-enumeration)
  if (card.status === "not_found") {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto text-xl font-bold">
            ?
          </div>
          <h1 className="text-xl font-semibold text-white">Card Not Found</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            This card code could not be found or has not been issued. Please check the printed ID on the card or contact support.
          </p>
        </div>
      </main>
    );
  }

  // 3. Card is manufactured/unclaimed -> Guide owner to activate
  if (card.status === "unclaimed") {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Unclaimed Card
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">This Card Isn't Set Up Yet</h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Are you the restaurant owner? Scratch off the sealed PIN on your packaging sleeve to activate this card in seconds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-mono block">Card ID</span>
            <span className="text-lg font-mono font-semibold text-neutral-200">{card.cardId}</span>
          </div>

          <Link
            href={`/activate?card=${encodeURIComponent(card.cardId)}`}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-neutral-950 font-medium hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5"
          >
            Activate This Card
          </Link>
        </div>
      </main>
    );
  }

  // 4. Card disabled by owner
  if (card.status === "disabled") {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-4">
          <h1 className="text-xl font-semibold text-white">Card Inactive</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            This card has been retired or disabled by the establishment.
          </p>
        </div>
      </main>
    );
  }

  // 5. Card is Active -> Route to destination
  if (card.purpose === "custom_url" && card.destinationUrl) {
    redirect(card.destinationUrl);
  }

  if (card.purpose === "showcase") {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4">
        <SmartShowcaseView
          cardId={card.cardId}
          tenant={card.tenant}
          showcaseData={card.showcaseData}
        />
      </main>
    );
  }

  if (card.purpose === "menu") {
    redirect(`/m/${card.tenant.slug}`);
  }

  // Render client feedback and review screen (feedback-first, Google review link always visible!)
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <FeedbackClient tenant={card.tenant} cardId={card.cardId} />
    </main>
  );
}
