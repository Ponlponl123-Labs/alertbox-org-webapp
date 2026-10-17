"use client";
import React from "react";
import { useUserContext } from "@/contexts/user";
import { HandCoinsIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/rbac";
import { OrgPerm } from "@/consts/permission";

export default function OrgBillingPage() {
  const { activeOrg } = useUserContext();

  const role = (activeOrg?.role || "").toLowerCase();
  const isOwnerOrAdmin = role === "owner" || role === "admin";
  const canManageBilling = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MANAGE);

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full py-4">
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
          <HandCoinsIcon size={16} weight="bold" />
          <span>Finance & Subscriptions</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          Billing & Plans
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage subscriptions, invoices, and billing tier for {activeOrg?.name}.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            Active Tier: Enterprise
          </span>
          <h2 className="text-lg font-bold text-foreground mt-2">Unlimited Multi-Streamer Plan</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Unlimited channels, 0% platform transaction fees, and team permissions included.
          </p>
        </div>
        {canManageBilling ? (
          <Button variant="outline" size="sm">
            Manage Billing Portal
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
            Manage Billing Portal (Read-only)
          </Button>
        )}
      </div>
    </div>
  );
}
