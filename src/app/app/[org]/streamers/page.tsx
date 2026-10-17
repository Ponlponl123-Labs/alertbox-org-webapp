"use client";
import { useUserContext } from "@/contexts/user";
import { Button } from "@/components/ui/button";
import { BroadcastIcon, PlusIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";
import { getFallbackInitial } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { hasPermission } from "@/lib/rbac";
import { OrgPerm } from "@/consts/permission";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function OrgStreamersPage() {
  const { activeOrg, isSelfHosted } = useUserContext();
  const router = useRouter();
  const orgKey = activeOrg?.slug || activeOrg?.id || "org";
  const role = (activeOrg?.role || "").toLowerCase();
  const isOwner = role === "owner";
  const isOwnerOrAdmin = isOwner || role === "admin";
  const streamers = activeOrg?.streamers || [];
  const isEnterprise = activeOrg?.type === "ENTERPRISE";
  const isChannelLimitReached = !isSelfHosted && !isEnterprise && streamers.length >= 1;
  const canCreateStreamer = (isOwnerOrAdmin || hasPermission(activeOrg?.permissions, OrgPerm.STREAMER_CREATE)) && !isChannelLimitReached;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <BroadcastIcon size={16} weight="bold" />
            <span>Organization Channels</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground my-3">
            Streamer Channels
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all streaming profiles and public channels belonging to {activeOrg?.name}.
          </p>
        </div>

        {canCreateStreamer && (
          <Link href={`/app/${orgKey}/streamers/new`}>
            <Button size="sm" className="gap-2 rounded-xl text-xs font-semibold p-3 h-max">
              <PlusIcon size={14} weight="bold" />
              <span>Create Channel</span>
            </Button>
          </Link>
        )}
      </div>

      {!isSelfHosted && !isEnterprise && streamers.length >= 1 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-medium">
          This is a Community organization which is limited to 1 streamer channel. Enterprise organizations or Self-hosted have unlimited channels.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {streamers.map((s) => (
          <Button
            key={s.id}
            variant={"secondary"}
            onClick={() => router.push(`/app/${orgKey}/${s.name}`)}
            className="p-4 rounded-xl flex flex-col justify-between gap-4 h-max"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="size-12 rounded-lg bg-blue-600/90 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {s.avatar ? (
                  <Image
                    src={s.avatar}
                    alt={s.name}
                    width={40}
                    height={40}
                    className="size-full rounded-lg object-cover pointer-events-none"
                    unoptimized
                  />
                ) : (
                  getFallbackInitial(s.displayName || s.name)
                )}
              </div>
              <div className="grid leading-tight min-w-0 text-start">
                <span className="truncate font-semibold text-foreground text-base">
                  {s.displayName || s.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  @{s.uri || s.name}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs w-full">
              <span className="text-muted-foreground text-[11px]">
                {s.widgets?.length || 1} Active Alertbox Widget
              </span>
              <div className="flex items-center gap-3">
                {s.uri && (
                  <Link
                    href={`/@${s.uri}`}
                    target="_blank"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ArrowSquareOutIcon size={14} />
                    <span>Public</span>
                  </Link>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
