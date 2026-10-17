"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { useStore } from "zustand";
import { orgStore, selectActiveOrg, selectActiveStreamer } from "@/hooks/store/org";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  KeyRound,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function WorkspaceZonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceZone = searchParams?.get("zone") === "true";

  const { userInfo, organizations, authFetch, patchUserInfo, setActiveOrgId, setActiveStreamerId } =
    useUserContext();
  const activeOrg = useStore(orgStore, selectActiveOrg);
  const activeStreamer = useStore(orgStore, selectActiveStreamer);
  const isOrgMode = useStore(orgStore, (s) => s.isOrgMode);

  const [orgName, setOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Auto-redirect existing users with active organizations unless forceZone
  useEffect(() => {
    if (!userInfo) return;
    if (forceZone) return;
    if (!userInfo.memberships || userInfo.memberships.length === 0) return;
    if (!activeOrg) return;

    const orgKey = activeOrg.slug || activeOrg.id;
    if (isOrgMode || !activeStreamer) {
      router.replace(`/app/${orgKey}`);
    } else {
      const streamerKey = activeStreamer.name || activeStreamer.id;
      router.replace(`/app/${orgKey}/${streamerKey}`);
    }
  }, [userInfo, activeOrg, activeStreamer, isOrgMode, router, forceZone]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setCreateError(null);

    try {
      const res = await authFetch(getApiUrl("/api/v1/org"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName.trim(),
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setCreateError(msg || "Failed to create organization");
        return;
      }

      const created = await res.json();
      toast.success(`Organization "${created.name}" created!`);

      // Refresh user context & memberships
      const meRes = await authFetch(getApiUrl("/api/v1/me"));
      if (meRes.ok) {
        const freshUser = await meRes.json();
        patchUserInfo(freshUser);
        orgStore.getState().syncFromMemberships(freshUser.memberships);
        orgStore.getState().setActiveOrgId(String(created.id));
        orgStore.getState().setActiveStreamerId("org");
      }

      const orgSlug = created.slug || created.id;
      router.push(`/app/${orgSlug}`);
    } catch {
      setCreateError("Network error while creating organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  // If user has organizations and is being redirected
  if (!forceZone && organizations.length > 0 && activeOrg) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col py-10 px-4 md:px-8 max-w-5xl mx-auto w-full gap-8">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold w-fit">
          <Sparkles className="size-3.5" />
          <span>Workspace Zone</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {userInfo.name ? `Welcome, ${userInfo.name}` : "Welcome to AlertBox"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Manage your organization workspaces, create a new team studio, or join an existing organization using an invite code.
        </p>
      </div>

      {organizations.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Your Organizations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {organizations.map((org) => {
              const orgKey = org.slug || org.id;
              return (
                <div
                  key={org.id}
                  onClick={() => {
                    setActiveOrgId(org.id);
                    setActiveStreamerId("org");
                    router.push(`/app/${orgKey}`);
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {org.avatar ? (
                        <Image
                          src={org.avatar}
                          alt={org.name}
                          width={40}
                          height={40}
                          className="size-full rounded-xl object-cover"
                          unoptimized
                        />
                      ) : (
                        <Building2 className="size-5" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                        {org.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {org.role?.toLowerCase() || "member"} · {org.streamers?.length || 0} channels
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 md:p-7 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="size-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Building2 className="size-6 text-blue-600" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-foreground">Create Organization</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Start a fresh organization workspace for your studio or agency. Streaming channels can be provisioned later.
              </p>
            </div>

            <form onSubmit={handleCreateOrg} className="flex flex-col gap-3.5 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/85">
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Studio, Vitality Agency"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  maxLength={64}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {createError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !orgName.trim()}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 mt-1 w-full justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    <span>Creating Organization...</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    <span>Create Organization</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <span>You will be assigned as Organization Owner</span>
          </div>
        </div>

        <div className="p-6 md:p-7 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="size-12 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center">
              <KeyRound className="size-6 text-amber-600" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-foreground">Join Organization</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Got an invite code from your organization owner or admin? Enter it below to join the team workspace.
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <Users className="size-4 text-primary shrink-0" />
                  <span>Team Collaboration</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Join via an 8-character invite code. Your role and streamer permissions will be automatically assigned based on the invite.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/app/org/join")}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold gap-2 mt-2 w-full justify-center border-border hover:bg-accent"
              >
                <KeyRound className="size-4" />
                <span>Enter Invite Code</span>
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
            <span>Invite codes expire after 7 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
