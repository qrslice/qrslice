// Copyright (c) 2026 QRslice. All rights reserved.
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { CardsClient } from "../CardsClient";

export const dynamic = "force-dynamic";

export default async function SuperCardBatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const user = await requireSuperAdmin();
  if (!user) {
    redirect("/sign-in");
  }
  const { batchId } = await params;

  return (
    <div className="min-h-screen bg-[#FAF5FF] text-[#1E0E38] p-4 sm:p-6 lg:p-10 font-[family-name:var(--font-plus-jakarta)]">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <CardsClient initialBatchId={batchId} />
      </div>
    </div>
  );
}
