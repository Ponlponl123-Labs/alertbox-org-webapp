"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { TrashIcon, UserIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useStore } from "zustand";
import { getApiUrl } from "@/lib/api";
import { toast } from "@/components/custom-ui/toast";
import { motion } from "motion/react";
import HoldButton from "@/components/HoldButton";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout, authFetch } = useUserContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!userInfo || !userInfo.id || isDeleting) return;
    setIsDeleting(true);
    try {
      const r = await authFetch(getApiUrl("/api/v1/me"), {
        method: "DELETE",
      });
      if (r.status === 401 || r.ok) {
        logout();
        return;
      }
      toast.error(lang.data.app.danger.toasts.delete_failed);
    } catch {
      toast.error(lang.data.app.danger.toasts.delete_network);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-1 flex-col gap-6 z-10"
    >
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
          <UserIcon size={16} weight="bold" />
          <span>{lang.data.app.danger.eyebrow}</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground my-3">
          {lang.data.app.danger.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {lang.data.app.danger.description}
        </p>
      </div>
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1">
        <div className="w-full flex flex-col items-center justify-center min-h-0 bg-foreground/5 rounded-4xl flex-1 border-2 border-dashed border-foreground/10 gap-6 p-6">
          <WarningOctagonIcon size={32} weight="fill" />
          <h2 className="font-semibold text-xl">
            {lang.data.app.danger.delete_account.title}
          </h2>
          <p className="text-center text-sm text-foreground/40 -mt-3 max-w-md">
            {lang.data.app.danger.delete_account.description}
          </p>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" className="rounded-xl p-4">
                  {lang.data.app.danger.delete_account.delete}
                </Button>
              }
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="text-destructive">
                  <TrashIcon weight="regular" className="size-9" />
                </AlertDialogMedia>
                <AlertDialogTitle>
                  {lang.data.app.danger.delete_account.title}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {lang.data.app.danger.delete_account.description}
                </AlertDialogDescription>
                <span className="text-xs text-destructive select-none font-sans">
                  {lang.data.common.action_irreversible}
                </span>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {lang.data.app.danger.delete_account.cancel}
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="rounded-xl p-3.25"
                  render={
                    <HoldButton
                      doneLabel={lang.data.common.deleted}
                      backgroundColor="var(--muted)"
                      fillColor="#f43f5e"
                      textColor="var(--muted-foreground)"
                      fillTextColor="#ffffff"
                      size="sm"
                      radius={14}
                      fillDirection="right"
                      className="h-max p-3.25 text-xs"
                      holdTime={2000}
                      releaseTime={200}
                      pressScale={1}
                      wave
                      waveAmplitude={6}
                      glow={false}
                      resetAfter={1200}
                      disabled={isDeleting}
                      onHold={() => void handleDelete()}
                    />
                  }
                >
                  {isDeleting ? (
                    <Spinner className="size-4" />
                  ) : (
                    lang.data.app.danger.delete_account.delete
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}

export default Page;
