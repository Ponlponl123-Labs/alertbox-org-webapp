"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { orgStore } from "@/hooks/store/org";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  ShieldCheck,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

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

interface JoinOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode?: string;
}

export function JoinOrgDialog({ open, onOpenChange, initialCode }: JoinOrgDialogProps) {
  const router = useRouter();
  const { authFetch, patchUserInfo } = useUserContext();

  const [otp, setOtp] = useState<string[]>(() =>
    initialCode && initialCode.length === 8 ? initialCode.split("") : Array(8).fill(""),
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [verifiedInfo, setVerifiedInfo] = useState<VerifiedOrgInfo | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus initial input when opened
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRefs.current[0]?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOtp(Array(8).fill(""));
      setVerifyError(null);
      setVerifiedInfo(null);
    }
    onOpenChange(nextOpen);
  };

  const verifyCode = useCallback(async (codeToVerify: string) => {
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
  }, [authFetch]);

  // Countdown timer for 5-minute expiry
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
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }

    const next = [...otp];
    // If multiple characters (e.g. mobile auto-fill), distribute
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

      // Sync fresh user data and active organization
      const meRes = await authFetch(getApiUrl("/api/v1/me"));
      if (meRes.ok) {
        const freshUser = await meRes.json();
        patchUserInfo(freshUser);
        orgStore.getState().syncFromMemberships(freshUser.memberships);
        orgStore.getState().setActiveOrgId(joinResult.orgId);
      }

      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-2xl">
        {!verifiedInfo ? (
          // Step 1: 8-digit OTP code input
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                <KeyRound className="size-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Join Organization
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Enter the 8-digit invitation code generated by your organization admin.
                Codes expire after 5 minutes and are single-use.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex items-center gap-1.5 sm:gap-2 justify-center w-full">
                {otp.map((digit, idx) => (
                  <React.Fragment key={idx}>
                    {idx === 4 && (
                      <span className="text-muted-foreground/60 font-semibold px-0.5">-</span>
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
                        "size-10 sm:size-11 rounded-xl text-center text-lg font-bold font-mono transition-all duration-150 outline-none select-none",
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
                <div className="flex items-center gap-1.5 text-xs text-destructive font-medium mt-1">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>

            <DialogFooter className="mt-2 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={fullCode.length !== 8 || isVerifying}
                onClick={() => verifyCode(fullCode)}
                className="rounded-xl text-xs gap-2 font-semibold"
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
            </DialogFooter>
          </div>
        ) : (
          // Step 2: Confirmation Dialog
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Confirm Invitation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                You’ve been invited to join this organization. Please review the details below before accepting.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-2xl border border-border bg-accent/30 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-xl border border-border shrink-0">
                  <AvatarImage src={verifiedInfo.organization.avatar || undefined} />
                  <AvatarFallback className="rounded-xl bg-blue-600 text-white font-bold text-sm">
                    {getFallbackInitial(verifiedInfo.organization.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-sm text-foreground truncate">
                    {verifiedInfo.organization.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    @{verifiedInfo.organization.slug || verifiedInfo.organization.id}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary shrink-0 capitalize">
                  <ShieldCheck className="size-3.5" />
                  <span>{verifiedInfo.role.toLowerCase()}</span>
                </div>
              </div>

              <div className="h-px bg-border/60 -mx-1" />

              <div className="grid grid-cols-2 gap-2 text-xs">
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
                    Code Expiration
                  </span>
                  <div className="flex items-center gap-1 font-mono font-medium text-amber-500">
                    <Clock className="size-3" />
                    <span>{timeLeft}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-2 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setVerifiedInfo(null)}
                className="rounded-xl text-xs"
                disabled={isJoining}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleConfirmJoin}
                disabled={isJoining || timeLeft === "Expired"}
                className="rounded-xl text-xs gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
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
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default JoinOrgDialog;
