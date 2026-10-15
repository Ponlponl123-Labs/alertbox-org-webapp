"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { orgStore } from "@/hooks/store/org";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateOrgPage() {
  const router = useRouter();
  const { authFetch, patchUserInfo } = useUserContext();

  const [orgName, setOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

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
        setError(msg || "Failed to create organization");
        return;
      }

      const created = await res.json();
      toast.success(`Organization "${created.name}" created!`);

      // Refresh user context & organizations
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
      setError("Network error while creating organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 max-w-xl mx-auto w-full">
      <div className="w-full flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back</span>
        </Button>
        <Link href="/app/org/join">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs text-primary font-medium hover:underline"
          >
            Have an invite code? Join here
          </Button>
        </Link>
      </div>

      <div className="w-full p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="size-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-1">
            <Building2 className="size-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Organization
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create a dedicated organization workspace for your streaming team, studio, or agency.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/85">
              Organization Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Studio, Team Vitality"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              maxLength={64}
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-input bg-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              autoFocus
            />
          </div>


          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting || !orgName.trim()}
              className="rounded-xl px-5 text-xs font-semibold gap-2"
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
          </div>
        </form>
      </div>
    </div>
  );
}
