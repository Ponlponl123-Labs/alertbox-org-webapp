"use client";
import { useUserContext } from "@/contexts/user";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { formatI18n } from "@/lib/i18n";
import { HandCoinsIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/rbac";
import { OrgPerm } from "@/consts/permission";
import { motion } from "motion/react";

export default function OrgBillingPage() {
  const { activeOrg } = useUserContext();
  const lang = useStore(coreStore, (s) => s.lang);
  const ob = lang.data.app.org.billing;

  const role = (typeof activeOrg?.role === "string" ? activeOrg.role : "").toLowerCase();
  const isOwnerOrAdmin = role === "owner" || role === "admin";
  const canManageBilling = isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.ORG_MANAGE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10"
    >
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
          <HandCoinsIcon size={16} weight="bold" />
          <span>{ob.eyebrow}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          {ob.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {formatI18n(ob.subtitle, { org: activeOrg?.name || "" })}
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {ob.active_tier_enterprise}
          </span>
          <h2 className="text-lg font-bold text-foreground mt-2">{ob.plan_title}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {ob.plan_desc}
          </p>
        </div>
        {canManageBilling ? (
          <Button variant="outline" size="sm">
            {ob.manage_portal}
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
            {ob.manage_portal_readonly}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
