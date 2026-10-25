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
import { toast } from "@/components/custom-ui/toast";
import { getApiUrl } from "@/lib/api";
import { AnimatePresence, motion } from "motion/react";

import { useUserContext } from "@/contexts/user";
import { useRouter } from "next/navigation";
import { CircleX } from "@/components/animate-ui/icons/hugeicons/circle-x";
import { Loading03 } from "@/components/animate-ui/icons/hugeicons/loading-03";
import { CheckmarkCircle02 } from "@/components/animate-ui/icons/hugeicons/checkmark-circle-02";
import { Tag } from "@/components/animate-ui/icons/hugeicons/tag";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Link01 } from "@/components/animate-ui/icons/hugeicons/link-01";

function RegisURIPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { authFetch, activeOrg, activeStreamer, patchStreamer } = useUserContext();
  const router = useRouter();
  const [isRegistrable, setIsRegistrable] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUriInputValue, setCurrentUriInputValue] = useState<string>("");

  const orgKey = activeOrg?.slug || activeOrg?.id;
  const streamerKey = activeStreamer?.name || activeStreamer?.id;

  const handleRegisURI = async () => {
    if (!currentUriInputValue || !isRegistrable || isRefreshing || isSubmitting)
      return;

    setIsSubmitting(true);
    try {
      const uriEndpoint = activeOrg && activeStreamer
        ? getApiUrl(`/api/v1/org/${activeOrg.id}/streamers/${activeStreamer.id}/uri`)
        : getApiUrl("/api/v1/me/profile");

      const res = await authFetch(uriEndpoint, {
        method: "PATCH",
        body: currentUriInputValue.trim().toLowerCase(),
      });

      if (res.ok) {
        const newUri = currentUriInputValue.trim().toLowerCase();
        const nextCooldown = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (activeStreamer) {
          patchStreamer(activeStreamer.id, {
            uri: newUri,
            uriCooldownEnd: nextCooldown.toISOString(),
          });
        }
        router.push(orgKey && streamerKey ? `/app/${orgKey}/${streamerKey}/profile` : "/app");
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

    if (!value) {
      setIsRefreshing(false);
      setIsRegistrable(false);
    } else {
      setIsRefreshing(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
      className="w-full mx-auto max-w-384 min-h-0 flex-1 p-12 pb-0 flex flex-col gap-6 z-10"
    >
      <div className="w-full text-center flex flex-col items-center justify-center min-h-0 bg-foreground/5 py-12 rounded-4xl flex-1 border-2 border-dashed border-foreground/10">
        <div className="flex items-center justify-center mx-auto mb-6">
          <Link01 animate delay={1000} className="m-auto text-foreground/60 size-12" />
        </div>
        <h2 className="text-2xl font-bold font-sans mb-2 select-none">
          {lang.data.app.profile.get_started.title}
        </h2>
        <p className="mb-6 text-sm font-sans text-foreground/40 max-w-md select-none">
          {lang.data.app.profile.get_started.description}
        </p>
        <div className="min-w-0 w-full h-max flex items-center justify-center">
          <Input
            type="text"
            fontStyle={{
              fontFamily: "var(--font-sans)",
              fontWeight: "500",
              fontSize: "14px",
            }}
            startContent={
              <span className="text-sm font-sans ml-2 relative flex -mr-2.75 text-foreground/40">
                tip-to.me/@
              </span>
            }
            disabled={isSubmitting}
            value={currentUriInputValue}
            onChange={handleUriChange}
            maxLength={50}
            pattern="^[a-zA-Z0-9_]+$"
            placeholder={lang.data.pages.index.actions.yourname}
            endContent={
              <div className="mr-3 flex items-center justify-center w-4.5 h-4.5">
                <AnimatePresence mode="popLayout">
                  {!currentUriInputValue.trim() ? null : isRefreshing ? (
                    <motion.div
                      key="checking"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="text-foreground"
                    >
                      <Loading03 size={18} animate="default" />
                    </motion.div>
                  ) : isRegistrable ? <motion.div
                    key="available"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="text-emerald-500"
                  >
                    <CheckmarkCircle02 size={18} />
                  </motion.div> : (
                    <motion.div
                      key="taken"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="text-rose-500"
                    >
                      <CircleX size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            }
            customMotion={{
              char: {
                initial: {
                  x: 3,
                  opacity: 0,
                  filter: "blur(6px)"
                },
                animate: {
                  x: 0,
                  opacity: 1,
                  filter: "blur(0px)"
                }
              }
            }}
            className="w-full"
            classNames={{ base: "h-12 rounded-2xl max-w-96 mx-auto" }}
          />
        </div>
        <AnimateIcon animateOnHover>
          <Button
            variant="default"
            className="rounded-2xl p-3 h-max text-xs font-semibold mt-4"
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
              <>
                <Tag />
                {lang.data.app.profile.get_started.regis}
              </>
            )}
          </Button>
        </AnimateIcon>
      </div>
    </motion.div>
  );
}

export default RegisURIPage;
