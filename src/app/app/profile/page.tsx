"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "zustand";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, patchUserInfo } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUriCooldown =
    (userInfo?.uri_cooldown &&
      new Date(userInfo?.uri_cooldown).getTime() > new Date().getTime()) ||
    false;

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch("/api/v1/me/profile", {
        method: "POST",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
      });

      if (res.ok) {
        patchUserInfo({ published: new Date() });
      }
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    setIsSubmitting(true);
    try {
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch("/api/v1/me/profile", {
        method: "DELETE",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
      });

      if (res.ok) {
        patchUserInfo({ published: null });
      }
    } catch (err) {
      console.error("Failed to unpublish:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 z-10 relative">
        <div className="flex flex-col">
          <span className="tracking-wider text-xs mt-1.5 text-foreground/40">
            {lang.data.app.profile.my_uri}:{" "}
            <Link
              href={`https://tip-to.me/@${userInfo?.uri}`}
              className="text-blue-500"
              target="_blank"
            >
              tip-to.me/@{userInfo?.uri}
              <ArrowUpRightIcon
                className="inline ml-px"
                weight="bold"
                size={12}
              />
            </Link>
          </span>
          {isUriCooldown && (
            <span className="tracking-wider text-xs mt-1.5 text-foreground/40">
              {userInfo?.uri_cooldown &&
                lang.data.app.profile.get_started.reset_in.replace(
                  "{time}",
                  new Date(userInfo?.uri_cooldown).toLocaleDateString(
                    lang.key,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    },
                  ),
                )}
            </span>
          )}
        </div>
        <div>
          <Link
            href={"/app/profile/renew"}
            className={cn(isUriCooldown && "pointer-events-none")}
          >
            <Button
              variant="default"
              className="rounded-2xl p-2.5 text-[10px] font-semibold mt-4"
              disabled={isUriCooldown}
            >
              {lang.data.app.profile.get_started.change}
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full flex items-center bg-foreground/5 mt-3 px-3 py-1.5 rounded-2xl gap-1.5 z-10 relative">
        <strong className="text-xs text-foreground/40">
          {lang.data.app.profile.manage.title}
        </strong>
        {userInfo?.published ? (
          <Button
            variant="destructive"
            className="rounded-xl p-2.5 text-[10px] font-semibold h-8"
            onClick={handleUnpublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner className="mr-1" />
            ) : (
              lang.data.app.profile.manage.unpublish
            )}
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="rounded-xl p-2.5 text-[10px] font-semibold bg-emerald-400/10 hover:bg-emerald-400/15 text-emerald-400 h-8"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner className="mr-1" />
            ) : (
              lang.data.app.profile.manage.publish
            )}
          </Button>
        )}
      </div>
      <div className="w-full flex flex-col items-center justify-center min-h-0 bg-foreground/5 mt-6 rounded-4xl flex-1 border-2 border-dashed border-foreground/10 z-10 relative"></div>
    </>
  );
}

export default Page;
