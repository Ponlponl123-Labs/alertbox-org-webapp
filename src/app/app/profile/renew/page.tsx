"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { coreStore } from "@/hooks/store/core";
import { isValidUri } from "@/lib/utils";
import {
  CheckCircleIcon,
  HandWavingIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Input } from "react-smooth-input";
import { useStore } from "zustand";
import { getCookie } from "cookies-next";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

import { useUserContext } from "@/contexts/user";
import { useRouter } from "next/navigation";

function RegisURIPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, patchUserInfo } = useUserContext();
  const router = useRouter();
  const [isRegistrable, setIsRegistrable] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUriInputValue, setCurrentUriInputValue] = useState<string>("");

  const handleRegisURI = async () => {
    if (!currentUriInputValue || !isRegistrable || isRefreshing || isSubmitting)
      return;

    setIsSubmitting(true);
    try {
      const authCookie = getCookie("USRSS");
      if (!authCookie) return;

      const res = await fetch(getApiUrl("/api/v1/me/profile"), {
        method: "PATCH",
        headers: {
          authorization: "Bearer " + atob(authCookie as string),
        },
        body: currentUriInputValue.trim().toLowerCase(),
      });

      if (res.ok) {
        const newUri = currentUriInputValue.trim().toLowerCase();
        const nextCooldown = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (userInfo?.profile) {
          patchUserInfo({
            profile: {
              ...userInfo.profile,
              uri: newUri,
              uriCooldownEnd: nextCooldown.toISOString(),
            },
          });
        }
        router.push("/app/profile");
      } else {
        const errorText = await res.text();
        if (res.status === 429) {
          toast.warning(
            lang.data.app.profile.get_started.reset_in.replace("{time}", ``),
            {
              description: new Date(
                Number(errorText.split("Please retry again after ")[1]),
              ).toLocaleDateString(lang.key, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            },
          );
          return;
        }
        console.error("Failed to register URI:", errorText);
      }
    } catch (err) {
      console.error("Error registering URI:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!currentUriInputValue) return;

    let active = true;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        if (!isValidUri(currentUriInputValue)) {
          setIsRegistrable(false);
          return;
        }

        const res = await fetch(
          getApiUrl(`/api/v1/profile/${encodeURIComponent(currentUriInputValue)}`),
          { signal: controller.signal },
        );

        if (!active) return;

        if (res.status === 404) {
          setIsRegistrable(true);
        } else {
          setIsRegistrable(false);
        }
      } catch (err) {
        if (!active) return;
        if (err instanceof Error && err.name === "AbortError") return;
        console.error(err);
        setIsRegistrable(false);
      } finally {
        if (active) {
          setIsRefreshing(false);
        }
      }
    }, 1000);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [currentUriInputValue]);

  const handleUriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isValidUri(value) && value !== "") return;
    setCurrentUriInputValue(value);

    if (!isValidUri(value)) return;

    if (!value) {
      setIsRefreshing(false);
      setIsRegistrable(false);
    } else {
      setIsRefreshing(true);
    }
  };

  return (
    <div className="w-full text-center flex flex-col items-center justify-center min-h-0 bg-foreground/5 mt-6 py-12 rounded-4xl flex-1 border-2 border-dashed border-foreground/10">
      <div className="bg-indigo/10 flex items-center justify-center size-12 mx-auto mb-4 rounded-xl text-amber-500 bg-amber-500/10">
        <HandWavingIcon weight="fill" className="m-auto" size={24} />
      </div>
      <h2 className="text-xl font-bold mb-2">
        {lang.data.app.profile.get_started.title}
      </h2>
      <p className="mb-4 text-xs text-foreground/40 max-w-sm">
        {lang.data.app.profile.get_started.description}
      </p>
      <div className="min-w-0 w-full h-max flex items-center justify-center">
        <Input
          type="text"
          startContent={
            <span className="text-xs font-baijamjuree translate-y-0.5 ml-2 relative flex -mr-2.75 text-foreground/40">
              tip-to.me/@
            </span>
          }
          endContent={
            <>
              {!currentUriInputValue.trim() ? null : isRefreshing ? (
                <Spinner className="size-4 text-foreground/40" />
              ) : isRegistrable ? (
                <CheckCircleIcon
                  weight="fill"
                  className="size-4 text-emerald-500"
                />
              ) : (
                <XCircleIcon
                  weight="fill"
                  className="size-4 text-destructive"
                />
              )}
            </>
          }
          fontStyle={{
            fontFamily: "var(--font-baijamjuree)",
            fontSize: "12px",
          }}
          value={currentUriInputValue}
          onChange={handleUriChange}
          maxLength={50}
          pattern="^[a-zA-Z0-9_]+$"
          placeholder={lang.data.pages.index.actions.yourname}
          classNames={{
            base: "h-10 rounded-full supports-backdrop-filter:backdrop-blur-xs",
            container: "min-w-0 max-w-64 max-md:min-w-88 flex-1",
          }}
        />
      </div>
      <Button
        variant="default"
        className="rounded-2xl p-2.5 text-[10px] font-semibold mt-4"
        onClick={handleRegisURI}
        disabled={
          !currentUriInputValue.trim() ||
          !isRegistrable ||
          isRefreshing ||
          isSubmitting
        }
      >
        {isSubmitting ? (
          <Spinner className="mr-2" />
        ) : (
          lang.data.app.profile.get_started.regis
        )}
      </Button>
    </div>
  );
}

export default RegisURIPage;
