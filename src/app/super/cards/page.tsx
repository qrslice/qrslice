// Copyright (c) 2026 QRslice. All rights reserved.
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { CardsClient } from "./CardsClient";

export const dynamic = "force-dynamic";

export default async function SuperCardsPage() {
  const user = await requireSuperAdmin();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full space-y-6">
      <CardsClient />
    </div>
  );
}
