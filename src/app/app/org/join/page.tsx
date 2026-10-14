"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { orgStore } from "@/hooks/store/org";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFallbackInitial, cn } from "@/lib/utils";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface VerifiedOrgInfo {
  code: string;
  role: string;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string | null;
    avatar: string | null;
  };
  inviter: {
    name: string | null;
    avatar: string | null;
  };
}

export default function JoinOrgPage() {
  const router = useRouter();
  const { authFetch, patchUserInfo } = useUserContext();

  const [otp, setOtp] = useState<string[]>(Array(8).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [verifiedInfo, setVerifiedInfo] = useState<VerifiedOrgInfo | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const verifyCode = useCallback(
    async (codeToVerify: string) => {
      if (codeToVerify.length !== 8) return;
      setIsVerifying(true);
      setVerifyError(null);

      try {
        const res = await authFetch(getApiUrl("/api/v1/org/invites/verify"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeToVerify }),
        });

        if (!res.ok) {
          const msg = await res.text();
          setVerifyError(msg || "Invalid or expired invitation code");
          return;
        }

        const data: VerifiedOrgInfo = await res.json();
        setVerifiedInfo(data);
      } catch {
        setVerifyError("Network error verifying invitation code");
      } finally {
        setIsVerifying(false);
      }
    },
    [authFetch],
  );

  useEffect(() => {
    if (!verifiedInfo) return;
    const calculateTime = () => {
      const diff = new Date(verifiedInfo.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs.toString().padStart(2, "0")}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [verifiedInfo]);

  const handleInputChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }

    const next = [...otp];
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 8 - index).split("");
      chars.forEach((c, i) => {
        if (index + i < 8) next[index + i] = c;
      });
      setOtp(next);
      const nextIndex = Math.min(index + chars.length, 7);
      inputRefs.current[nextIndex]?.focus();

      const full = next.join("");
      if (full.length === 8) verifyCode(full);
      return;
    }

    next[index] = cleaned[0] || "";
    setOtp(next);

    if (index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    const full = next.join("");
    if (full.length === 8) {
      verifyCode(full);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;

    const next = Array(8).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);

    const focusIdx = Math.min(pasted.length, 7);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === 8) {
      verifyCode(pasted);
    }
  };

  const handleConfirmJoin = async () => {
    if (!verifiedInfo) return;
    setIsJoining(true);

    try {
      const res = await authFetch(getApiUrl("/api/v1/org/invites/accept"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifiedInfo.code }),
      });

      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to accept invitation");
        return;
      }

      const joinResult = await res.json();
      toast.success(`Joined ${joinResult.orgName} successfully!`);

      const meRes = await authFetch(getApiUrl("/api/v1/me"));
      if (meRes.ok) {
        const freshUser = await meRes.json();
        patchUserInfo(freshUser);
        orgStore.getState().syncFromMemberships(freshUser.memberships);
        orgStore.getState().setActiveOrgId(joinResult.orgId);
      }

      const targetSlug = joinResult.orgSlug || joinResult.orgId;
      router.push(`/app/${targetSlug}`);
    } catch {
      toast.error("Network error joining organization");
    } finally {
      setIsJoining(false);
    }
  };

  const fullCode = otp.join("");

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
        <Link href="/app/org/create">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs text-primary font-medium hover:underline"
          >
            Want to create an organization instead?
          </Button>
        </Link>
      </div>

      <div className="w-full p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl flex flex-col gap-6">
        {!verifiedInfo ? (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                <KeyRound className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Join Organization
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your 8-digit invitation code. The code is single-use, valid for 5 minutes, and strictly bound to your account email.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-3">
              <div className="flex items-center gap-1.5 sm:gap-2.5 justify-center w-full">
                {otp.map((digit, idx) => (
                  <React.Fragment key={idx}>
                    {idx === 4 && (
                      <span className="text-muted-foreground/60 font-semibold px-0.5 sm:px-1">-</span>
                    )}
                    <input
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className={cn(
                        "size-10 sm:size-12 rounded-xl text-center text-lg sm:text-xl font-bold font-mono transition-all duration-150 outline-none select-none",
                        "border bg-background/80 text-foreground",
                        digit
                          ? "border-primary/70 bg-primary/5 text-primary shadow-xs"
                          : "border-border hover:border-foreground/30",
                        "focus:border-primary focus:ring-2 focus:ring-primary/20",
                        verifyError && "border-destructive text-destructive",
                      )}
                    />
                  </React.Fragment>
                ))}
              </div>

              {verifyError && (
                <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <Button
                type="button"
                disabled={fullCode.length !== 8 || isVerifying}
                onClick={() => verifyCode(fullCode)}
                className="rounded-xl px-6 text-xs font-semibold gap-2"
              >
                {isVerifying ? (
                  <>
                    <Spinner />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Confirm Invitation
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confirm joining this organization with the assigned permissions below.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-accent/30 flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar className="size-14 rounded-2xl border border-border shrink-0">
                  <AvatarImage src={verifiedInfo.organization.avatar || undefined} />
                  <AvatarFallback className="rounded-2xl bg-blue-600 text-white font-bold text-base">
                    {getFallbackInitial(verifiedInfo.organization.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-base text-foreground truncate">
                    {verifiedInfo.organization.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    @{verifiedInfo.organization.slug || verifiedInfo.organization.id}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary shrink-0 capitalize">
                  <ShieldCheck className="size-3.5" />
                  <span>{verifiedInfo.role.toLowerCase()}</span>
                </div>
              </div>

              <div className="h-px bg-border/60 -mx-1" />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Invited By
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {verifiedInfo.inviter.name || "Organization Admin"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Time Remaining
                  </span>
                  <div className="flex items-center gap-1 font-mono font-medium text-amber-500">
                    <Clock className="size-3.5" />
                    <span>{timeLeft}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setVerifiedInfo(null)}
                className="rounded-xl text-xs"
                disabled={isJoining}
              >
                Back to Code
              </Button>
              <Button
                type="button"
                onClick={handleConfirmJoin}
                disabled={isJoining || timeLeft === "Expired"}
                className="rounded-xl px-6 text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isJoining ? (
                  <>
                    <Spinner />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="size-4" />
                    <span>Confirm & Join</span>
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
