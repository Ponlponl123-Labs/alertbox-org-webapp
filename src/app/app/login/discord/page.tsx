"use client";
import PreParing from "../preparing";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { useEffect, useRef, useState, Suspense } from "react";
import ErrorView from "../error";
import Success from "../success";
import { constantTimeEqual } from "@/lib/security";
import { getDiscordRedirectUri } from "@/lib/api";
import { DISCORD_CLIENT_ID, OAUTH_STATE_KEY } from "@/consts/oauth";
import { consumeOAuthState, getOrCreateOAuthState } from "@/lib/oauth";

function DiscordLoginContent() {
  const { login } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginSuccess, setIsLoginSuccess] = useState<undefined | boolean>(undefined);
  const isCalled = useRef(false);
  const redirectStarted = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (oauthError) {
      try {
        sessionStorage.removeItem(OAUTH_STATE_KEY);
      } catch { }
      queueMicrotask(() => setIsLoginSuccess(false));
      return;
    }

    if (!code) {
      if (redirectStarted.current) return;
      redirectStarted.current = true;

      const state = getOrCreateOAuthState();
      const urlBuilder = new URL("https://discord.com/oauth2/authorize");
      urlBuilder.searchParams.append("client_id", DISCORD_CLIENT_ID);
      urlBuilder.searchParams.append("response_type", "code");
      urlBuilder.searchParams.append("scope", "email identify");
      urlBuilder.searchParams.append("state", state);
      urlBuilder.searchParams.append("redirect_uri", getDiscordRedirectUri());

      window.location.assign(urlBuilder.toString());
      return;
    }

    if (isCalled.current) return;
    isCalled.current = true;

    const expectedState = consumeOAuthState();
    if (!returnedState || !expectedState || !constantTimeEqual(returnedState, expectedState)) {
      queueMicrotask(() => setIsLoginSuccess(false));
      return;
    }

    (async () => {
      try {
        const result = await login(code);
        setIsLoginSuccess(result);
        if (result) {
          redirectTimerRef.current = setTimeout(() => {
            router.replace("/app");
          }, 1000);
        }
      } catch {
        setIsLoginSuccess(false);
      }
    })();

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [code, returnedState, oauthError, login, router]);

  if (isLoginSuccess === undefined) return <PreParing />;

  return isLoginSuccess ? <Success /> : <ErrorView />;
}

export default function Page() {
  return (
    <Suspense fallback={<PreParing />}>
      <DiscordLoginContent />
    </Suspense>
  );
}
