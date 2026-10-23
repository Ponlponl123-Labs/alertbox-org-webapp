"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { orgStore } from "@/hooks/store/org";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { UndrawAgreement } from "@/components/svg";
import { Input } from "react-smooth-input";

export default function CreateOrgPage() {
  const router = useRouter();
  const { authFetch, patchUserInfo, userInfo, organizations, isSelfHosted } = useUserContext();

  const userType = userInfo?.type || "REGULAR";
  const isOperator = userType === "OPERATOR";
  const ownedOrgs = organizations.filter((o) => o.role === "OWNER");
  const isOrgLimitReached = !isSelfHosted && !isOperator && ownedOrgs.length >= 1;

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<"COMMUNITY" | "ENTERPRISE">("COMMUNITY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || isSubmitting || isOrgLimitReached) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await authFetch(getApiUrl("/api/v1/org"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName.trim(),
          type: isOperator ? orgType : "COMMUNITY",
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
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 max-w-7xl mx-auto w-full">
      <div>
        <div className="w-full flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl p-2 text-xs h-max gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back</span>
          </Button>
          <Link href="/app/org/join">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl p-2 text-xs h-max text-primary font-medium"
            >
              Have an invite code? Join here
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-12">
          <div className="max-lg:hidden">
            <UndrawAgreement className="size-60 xl:size-96 md:ml-12" />
          </div>
          <div className="w-full flex flex-col gap-3 max-w-md">
            <div className="flex flex-col gap-1.5 my-6">
              <h1 className="text-5xl font-medium mb-3 text-foreground">
                Make your first startup
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
                <Input
                  type="text"
                  placeholder="e.g. Acme Studio, Team Vitality"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  fontStyle={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                  className="w-full"
                  classNames={{ base: "h-9 rounded-xl" }}
                />
              </div>


              {isOperator && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/85">
                    Organization Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrgType("COMMUNITY")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${orgType === "COMMUNITY"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                    >
                      <span className="text-xs font-bold text-foreground">Community</span>
                      <span className="text-[11px] opacity-80">1 channel limit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgType("ENTERPRISE")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${orgType === "ENTERPRISE"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                    >
                      <span className="text-xs font-bold text-foreground">Enterprise</span>
                      <span className="text-[11px] opacity-80">Unlimited channels</span>
                    </button>
                  </div>
                </div>
              )}

              {isOrgLimitReached && (
                <div className="p-3.5 rounded-2xl bg-muted/60 select-none text-xs flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Info className="size-4 shrink-0 text-muted-foreground" />
                    <span>There are no signers</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We can handle only 1 signer right now, but if u want unlimited signers, you can freely self-host your Alertbox!
                  </p>
                  <Link
                    href="https://github.com/Ponlponl123-Labs/alertbox-org#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-foreground hover:underline font-medium transition-colors w-max group"
                  >
                    <span>Learn about self-hosting</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="submit"
                  disabled={isSubmitting || !orgName.trim() || isOrgLimitReached}
                  className="rounded-xl p-3 h-max text-xs font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-4" />
                      <span>Creating Organization...</span>
                    </>
                  ) : isOrgLimitReached ? (
                    <span>Feature unavailable</span>
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
      </div>
    </div>
  );
}
