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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import { TrashIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import { getCookie } from "cookies-next/client";
import { useState } from "react";
import { useStore } from "zustand";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout } = useUserContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!userInfo || !userInfo.id || isDeleting) return;
    setIsDeleting(true);
    const accessToken = atob(getCookie("USRSS") || "");
    const r = await fetch("/api/v1/me", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
    if (r.status === 401) return logout();
    if (r.ok) {
      window.location.href = "/";
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
      {userInfo && (
        <div className="flex gap-1.75 items-center">
          <Avatar size="sm">
            {userInfo.avatar && <AvatarImage src={userInfo.avatar} />}
            <AvatarFallback>{getFallbackInitial(userInfo.name)}</AvatarFallback>
          </Avatar>
          <span className="text-foreground/40">@{userInfo?.name}</span>
        </div>
      )}
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.danger.title}
      </h1>
      <p className="mt-1.5 text-sm text-foreground/40">
        {lang.data.app.danger.description}
      </p>
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
            <AlertDialogContent size="sm" className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 p-2 size-12 rounded-xl text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <TrashIcon weight="fill" size={12} />
                </AlertDialogMedia>
                <AlertDialogTitle className={"text-lg"}>
                  {lang.data.app.danger.delete_account.title}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {lang.data.app.danger.delete_account.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  variant="secondary"
                  className="rounded-xl"
                  disabled={isDeleting}
                >
                  {lang.data.app.danger.delete_account.cancel}
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
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
    </div>
  );
}

export default Page;
