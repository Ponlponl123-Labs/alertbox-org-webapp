"use client";
import React, { useState } from "react";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import {
  BuildingsIcon,
  BroadcastIcon,
  UserCircleGearIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { orgStore } from "@/hooks/store/org";

export default function OnboardingPage() {
  const { authFetch, patchUserInfo } = useUserContext();
  const router = useRouter();

  const [orgName, setOrgName] = useState("");
  const [streamerName, setStreamerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await authFetch(getApiUrl("/api/v1/org"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName.trim(),
          streamerName: streamerName.trim() || undefined,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        toast.success(`Organization "${created.name}" created!`);

        // Fetch fresh user data to populate memberships
        const meRes = await authFetch(getApiUrl("/api/v1/me"));
        if (meRes.ok) {
          const freshUser = await meRes.json();
          patchUserInfo(freshUser);
          orgStore.getState().syncFromMemberships(freshUser.memberships);
          orgStore.getState().setActiveOrgId(String(created.id));
        }

        const orgSlug = created.slug || created.id;
        const channelSlug = streamerName.trim() || "streamer";
        router.push(`/app/${orgSlug}/${channelSlug}`);
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to create organization");
      }
    } catch {
      toast.error("Network error while creating organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
      <div className="w-full flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
          <SparkleIcon size={14} weight="bold" />
          <span>Welcome to Alertbox Organization Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Let’s set up your first organization
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl">
          Alertbox organizes streaming operations by Organizations, Streamer Channels, and Personal Accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
        <div className="p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm flex flex-col gap-2">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BuildingsIcon size={20} weight="bold" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">1. Organization</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your studio, agency, or team umbrella for centralized billing, members, and multi-channel permissions.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm flex flex-col gap-2">
          <div className="size-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <BroadcastIcon size={20} weight="bold" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">2. Channels</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Individual streaming brands with dedicated public donation handles, alertbox widgets, and OBS overlays.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm flex flex-col gap-2">
          <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <UserCircleGearIcon size={20} weight="bold" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">3. User Account</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your personal operator identity, login credentials, and global security settings across all organizations.
          </p>
        </div>
      </div>

      <div className="w-full max-w-lg p-6 rounded-2xl border border-border bg-card shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Organization Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Acme Esports, Solopreneur Media"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Primary Channel Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. main-stage, stream-ch1"
              value={streamerName}
              onChange={(e) => setStreamerName(e.target.value)}
              className="w-full text-sm"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              You can create and manage more channels anytime later.
            </span>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full gap-2 text-sm font-medium"
              disabled={isSubmitting || !orgName.trim()}
            >
              <span>{isSubmitting ? "Creating..." : "Launch Organization Workspace"}</span>
              <ArrowRightIcon size={16} weight="bold" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
