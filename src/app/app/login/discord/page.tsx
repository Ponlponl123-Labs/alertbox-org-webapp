"use client";
import PreParing from "../preparing";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { useEffect, useRef, useState, Suspense } from "react";
import ErrorView from "../error";
import Success from "../success";
import { constantTimeEqual, generateOAuthState } from "@/lib/security";
import { getDiscordRedirectUri } from "@/lib/api";

const OAUTH_STATE_KEY = "ab_discord_oauth_state";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const DISCORD_CLIENT_ID =
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1510531382147944488";

function getOrCreateOAuthState(): string {
  try {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { v?: unknown; ts?: unknown };
      if (
        typeof parsed.v === "string" &&
        parsed.v.length >= 16 &&
        typeof parsed.ts === "number" &&
        Date.now() - parsed.ts < 5 * 60 * 1000
      ) {
        return parsed.v;
      }
    }
  } catch {}
  const v = generateOAuthState();
  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ v, ts: Date.now() }));
  } catch {}
  return v;
}

function consumeOAuthState(): string | null {
  try {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { v?: unknown; ts?: unknown };
      if (
        typeof parsed.v === "string" &&
        typeof parsed.ts === "number" &&
        Date.now() - parsed.ts < OAUTH_STATE_TTL_MS
      ) {
        return parsed.v;
      }
      return null;
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

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
      } catch {}
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
