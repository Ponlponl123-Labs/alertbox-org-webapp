"use client";
import React from "react";
import { useUserContext } from "@/contexts/user";
import { StorefrontIcon } from "@phosphor-icons/react";

export default function OrgTransactionsPage() {
  const { activeOrg } = useUserContext();

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full py-4">
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
          <StorefrontIcon size={16} weight="bold" />
          <span>Financials</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          Transactions & Payouts
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Consolidated donation transactions across all channels in {activeOrg?.name}.
        </p>
      </div>

      <div className="p-8 rounded-xl border border-border bg-card text-center text-muted-foreground text-xs">
        No platform payouts pending. All direct donations process in real-time through connected provider accounts.
      </div>
    </div>
  );
}
