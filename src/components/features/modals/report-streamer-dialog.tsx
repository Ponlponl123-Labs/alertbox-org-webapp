"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "zustand";
import { FlagIcon } from "@phosphor-icons/react";
import { coreStore } from "@/hooks/store/core";
import { getApiUrl } from "@/lib/api";
import { formatI18n } from "@/lib/i18n";
import { safeDecodeURIComponent } from "@/lib/security";
import HoldButton from "@/components/HoldButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/custom-ui/select";
import { toast } from "@/components/custom-ui/toast";

const REPORT_TOPICS = [
  "INAPPROPRIATE_CONTENT",
  "IMPERSONATION",
  "FRAUD_SCAM",
  "HARASSMENT",
  "SPAM",
  "OTHER",
] as const;

type ReportTopic = (typeof REPORT_TOPICS)[number];

export function ReportStreamerDialog({
  username,
  streamerName,
}: {
  username?: string;
  streamerName?: string;
}) {
  const lang = useStore(coreStore, (s) => s.lang);
  const rp = lang.data.app.profile.report;
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<ReportTopic>("INAPPROPRIATE_CONTENT");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [mxStatus, setMxStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const decoded = username ? safeDecodeURIComponent(username) ?? "" : "";
  const uri = decoded.startsWith("@") ? decoded.slice(1) : decoded;

  useEffect(() => {
    if (!uri) return;
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          getApiUrl(`/api/v1/profile/${encodeURIComponent(uri)}/report/check-email?email=${encodeURIComponent(trimmed)}`),
          { signal: controller.signal },
        );
        if (!res.ok) {
          setMxStatus("invalid");
          return;
        }
        const data = (await res.json()) as { valid?: boolean };
        setMxStatus(data.valid ? "valid" : "invalid");
      } catch {
        if (!controller.signal.aborted) {
          setMxStatus("invalid");
        }
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [email, uri]);

  if (!uri) return null;

  const resetForm = () => {
    setTopic("INAPPROPRIATE_CONTENT");
    setMessage("");
    setEmail("");
    setMxStatus("idle");
  };

  const submitReport = async () => {
    if (isSubmitting) return;
    const trimmedMessage = message.trim();
    const trimmedEmail = email.trim();
    if (trimmedMessage.length < 10) {
      toast.error(rp.message_too_short);
      return;
    }
    if (!trimmedEmail || mxStatus !== "valid") {
      toast.error(mxStatus === "invalid" ? rp.email_mx_invalid : rp.email_required);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/profile/${encodeURIComponent(uri)}/report`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          message: trimmedMessage,
          email: trimmedEmail,
        }),
      });

      if (res.ok) {
        toast.success(rp.submitted);
        setOpen(false);
        resetForm();
        return;
      }

      if (res.status === 429) {
        toast.error(rp.rate_limited);
        return;
      }

      const errText = await res.text();
      toast.error(errText || rp.submit_failed);
    } catch {
      toast.error(rp.network_error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="rounded-lg text-foreground/60 hover:text-destructive border-0"
          />
        }
      >
        <FlagIcon size={14} weight="bold" />
        <span className="text-xs">{rp.trigger}</span>
      </DialogTrigger>

      <DialogContent className="max-w-sm!" showCloseButton={false}>
        <DialogHeader className="items-center text-center gap-1.5">
          <div className="mb-1 inline-flex size-12 items-center justify-center text-destructive">
            <FlagIcon weight="regular" className="size-9" />
          </div>
          <DialogTitle>
            {formatI18n(rp.title, { name: streamerName || `@${uri}` })}
          </DialogTitle>
          <DialogDescription className="text-balance">
            {rp.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3.5 mt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              {rp.topic_label}
            </label>
            <Select value={topic} onValueChange={(v) => setTopic(v as ReportTopic)}>
              <SelectTrigger className="w-full h-10! border-2 rounded-md text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full -translate-x-5 -translate-y-2">
                <SelectGroup>
                  {REPORT_TOPICS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {rp.topics[key]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              {rp.message_label}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={rp.message_placeholder}
              rows={3}
              minLength={10}
              maxLength={2000}
              required
              className="rounded-md border-2 text-xs resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              {rp.email_label}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                const next = e.target.value;
                setEmail(next);
                setMxStatus(
                  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(next.trim().toLowerCase())
                    ? "checking"
                    : "idle",
                );
              }}
              placeholder={rp.email_placeholder}
              maxLength={320}
              required
              className="h-10 rounded-md border-2 text-xs"
            />
            {mxStatus !== "idle" && (
              <p
                className={
                  mxStatus === "valid"
                    ? "text-[11px] text-emerald-500"
                    : mxStatus === "invalid"
                      ? "text-[11px] text-destructive"
                      : "text-[11px] text-muted-foreground flex items-center gap-1.5"
                }
              >
                {mxStatus === "checking" && <Spinner className="size-3" />}
                <span>
                  {mxStatus === "checking"
                    ? rp.email_checking
                    : mxStatus === "valid"
                      ? rp.email_mx_valid
                      : rp.email_mx_invalid}
                </span>
              </p>
            )}
          </div>

          <DialogFooter className="mt-1 grid! grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
              className="rounded-xl p-3 h-max w-full cursor-pointer"
            >
              {lang.data.common.cancel}
            </Button>
            <HoldButton
              doneLabel={lang.data.common.done}
              backgroundColor="var(--muted)"
              fillColor="#f43f5e"
              textColor="var(--muted-foreground)"
              fillTextColor="#ffffff"
              size="sm"
              radius={12}
              fillDirection="right"
              className="h-max p-3 text-xs w-full"
              holdTime={1500}
              releaseTime={200}
              pressScale={1}
              wave
              waveAmplitude={6}
              glow={false}
              resetAfter={1200}
              disabled={isSubmitting || message.trim().length < 10 || mxStatus !== "valid"}
              onHold={() => {
                void submitReport();
              }}
            >
              {isSubmitting && <Spinner className="size-4" />}
              <span>{rp.hold_to_submit}</span>
            </HoldButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
