"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getFallbackInitial } from "./utils";
import { BroadcastIcon } from "@phosphor-icons/react";
import { getApiUrl } from "./api";
import { useUserContext } from "@/contexts/user";
import { BoundedLruCache } from "@/lib/lru-cache";
import { isSafePathSegment } from "@/lib/security";

export interface TinyUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface TinyStreamer {
  id: string;
  name: string;
  displayName: string | null;
  avatar: string | null;
}

const POSITIVE_TTL_MS = 5 * 60 * 1000;
const NEGATIVE_TTL_MS = 15 * 1000;

const userCache = new BoundedLruCache<TinyUser | null>({
  maxEntries: 200,
  defaultTtlMs: POSITIVE_TTL_MS,
  storageKey: "ab_tiny_users_cache_v3",
});

const streamerCache = new BoundedLruCache<TinyStreamer | null>({
  maxEntries: 200,
  defaultTtlMs: POSITIVE_TTL_MS,
  storageKey: "ab_tiny_streamers_cache_v3",
});

const inflightUsers = new Map<string, Promise<TinyUser | null>>();
const inflightStreamers = new Map<string, Promise<TinyStreamer | null>>();

function makeScopedKey(orgTarget: string | undefined, id: string): string {
  return `${orgTarget || "_"}:${id}`;
}

export function hasCachedTinyUser(userId?: string | null, orgTarget?: string): boolean {
  if (!userId) return false;
  return userCache.has(makeScopedKey(orgTarget, String(userId)));
}

export function getCachedTinyUser(userId?: string | null, orgTarget?: string): TinyUser | null {
  if (!userId) return null;
  return userCache.get(makeScopedKey(orgTarget, String(userId))) ?? null;
}

export async function fetchTinyUser(
  authFetch: (url: string, init?: RequestInit) => Promise<Response>,
  _apiUrl: string,
  orgTarget: string,
  userId: string,
): Promise<TinyUser | null> {
  if (!isSafePathSegment(orgTarget) || !isSafePathSegment(userId)) return null;
  const key = makeScopedKey(orgTarget, userId);
  if (userCache.has(key)) return userCache.get(key) ?? null;

  const existing = inflightUsers.get(key);
  if (existing) return existing;

  const reqPromise = (async () => {
    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${encodeURIComponent(orgTarget)}/users/${encodeURIComponent(userId)}/tiny`),
      );
      if (res.ok) {
        const data = (await res.json()) as TinyUser;
        if (data?.id) {
          userCache.set(key, data, POSITIVE_TTL_MS);
          return data;
        }
      }
      if (res.status === 404) {
        userCache.set(key, null, NEGATIVE_TTL_MS);
      }
      return null;
    } catch {
      return null;
    } finally {
      inflightUsers.delete(key);
    }
  })();

  inflightUsers.set(key, reqPromise);
  return reqPromise;
}

export function useTinyUser(
  authFetch: ((url: string, init?: RequestInit) => Promise<Response>) | undefined,
  apiUrl: string,
  orgTarget: string | undefined,
  userId: string | null | undefined,
  enabled: boolean = false,
) {
  const cachedUser = userId ? getCachedTinyUser(userId, orgTarget) : null;
  const [fetchedUser, setFetchedUser] = useState<TinyUser | null>(null);
  const [loading, setLoading] = useState(false);

  const user = cachedUser || fetchedUser;

  useEffect(() => {
    if (!userId || !enabled || !authFetch || !orgTarget) return;
    if (hasCachedTinyUser(userId, orgTarget)) return;

    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });

    fetchTinyUser(authFetch, apiUrl, orgTarget, userId)
      .then((res) => {
        if (active && res) setFetchedUser(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, enabled, authFetch, apiUrl, orgTarget]);

  return { user, loading };
}

export function UserMentionChip({
  user,
  userId,
  email,
  fallbackText,
  loading = false,
}: {
  user?: { name?: string | null; email?: string | null; avatar?: string | null } | null;
  userId?: string | null;
  email?: string | null;
  fallbackText?: string;
  loading?: boolean;
}) {
  const displayName =
    user?.name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    (email ? email.split("@")[0] : null);
  const avatar = user?.avatar;
  const initial = displayName ? getFallbackInitial(displayName) : "U";

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/60 text-muted-foreground text-xs font-medium animate-pulse select-none align-middle">
        <span className="size-3.5 rounded-full bg-muted-foreground/30" />
        <span>Loading...</span>
      </span>
    );
  }

  return (
    <span
      title={user?.email || email || (userId ? `User ID: ${userId}` : undefined)}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/80 text-foreground text-xs font-medium hover:bg-secondary transition-colors select-none align-middle cursor-default"
    >
      <span className="size-4 rounded-full bg-blue-600/90 text-white text-[9px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
        {avatar ? (
          <Image
            src={avatar}
            alt={displayName || "User"}
            width={16}
            height={16}
            className="size-full object-cover pointer-events-none"
            unoptimized
          />
        ) : (
          initial
        )}
      </span>
      <span className="truncate max-w-40 font-medium">
        {displayName || fallbackText || (userId ? `@user_${userId}` : "@user")}
      </span>
    </span>
  );
}

export function hasCachedTinyStreamer(streamerId?: string | null, orgTarget?: string): boolean {
  if (!streamerId) return false;
  return streamerCache.has(makeScopedKey(orgTarget, String(streamerId)));
}

export function getCachedTinyStreamer(
  streamerId?: string | null,
  orgTarget?: string,
): TinyStreamer | null {
  if (!streamerId) return null;
  return streamerCache.get(makeScopedKey(orgTarget, String(streamerId))) ?? null;
}

export async function fetchTinyStreamer(
  authFetch: (url: string, init?: RequestInit) => Promise<Response>,
  _apiUrl: string,
  orgTarget: string,
  streamerId: string,
): Promise<TinyStreamer | null> {
  if (!isSafePathSegment(orgTarget) || !isSafePathSegment(streamerId)) return null;
  const key = makeScopedKey(orgTarget, streamerId);
  if (streamerCache.has(key)) return streamerCache.get(key) ?? null;

  const existing = inflightStreamers.get(key);
  if (existing) return existing;

  const reqPromise = (async () => {
    try {
      const res = await authFetch(
        getApiUrl(
          `/api/v1/org/${encodeURIComponent(orgTarget)}/streamers/${encodeURIComponent(streamerId)}/tiny`,
        ),
      );
      if (res.ok) {
        const data = (await res.json()) as TinyStreamer;
        if (data?.id) {
          streamerCache.set(key, data, POSITIVE_TTL_MS);
          return data;
        }
      }
      if (res.status === 404) {
        streamerCache.set(key, null, NEGATIVE_TTL_MS);
      }
      return null;
    } catch {
      return null;
    } finally {
      inflightStreamers.delete(key);
    }
  })();

  inflightStreamers.set(key, reqPromise);
  return reqPromise;
}

export function useTinyStreamer(
  authFetch: ((url: string, init?: RequestInit) => Promise<Response>) | undefined,
  apiUrl: string,
  orgTarget: string | undefined,
  streamerId: string | null | undefined,
  enabled: boolean = false,
) {
  const cachedStreamer = streamerId ? getCachedTinyStreamer(streamerId, orgTarget) : null;
  const [fetchedStreamer, setFetchedStreamer] = useState<TinyStreamer | null>(null);
  const [loading, setLoading] = useState(false);

  const streamer = cachedStreamer || fetchedStreamer;

  useEffect(() => {
    if (!streamerId || !enabled || !authFetch || !orgTarget) return;
    if (hasCachedTinyStreamer(streamerId, orgTarget)) return;

    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });

    fetchTinyStreamer(authFetch, apiUrl, orgTarget, streamerId)
      .then((res) => {
        if (active && res) setFetchedStreamer(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [streamerId, enabled, authFetch, apiUrl, orgTarget]);

  return { streamer, loading };
}

export function RoleMentionChip({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-wider select-none align-middle">
      <span className="size-1.5 rounded-full bg-purple-400 shrink-0" />
      <span>{role}</span>
    </span>
  );
}

export function ChannelMentionChip({
  streamer,
  name,
  displayName,
  avatar,
  loading = false,
}: {
  streamer?: { name?: string | null; displayName?: string | null; avatar?: string | null } | null;
  name?: string | null;
  displayName?: string | null;
  avatar?: string | null;
  loading?: boolean;
}) {
  const channelName = streamer?.name || name;
  const titleName = streamer?.displayName || displayName || channelName;
  const avatarUrl = streamer?.avatar || avatar;

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-500/10 text-muted-foreground text-xs font-medium animate-pulse select-none align-middle">
        <span className="size-3.5 rounded-full bg-muted-foreground/30" />
        <span>Loading...</span>
      </span>
    );
  }

  return (
    <span
      title={titleName && channelName ? `${titleName} (@${channelName})` : `@${channelName || "channel"}`}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-medium hover:bg-sky-500/15 transition-colors select-none align-middle cursor-default"
    >
      <span className="size-4 rounded-full bg-sky-600/90 text-white text-[9px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={titleName || "Channel"}
            width={16}
            height={16}
            className="size-full object-cover pointer-events-none"
            unoptimized
          />
        ) : (
          <BroadcastIcon size={10} weight="bold" />
        )}
      </span>
      <span className="truncate max-w-40 font-sans">@{channelName || "channel"}</span>
    </span>
  );
}

export function StreamerMentionChip({
  streamerId,
  orgTarget,
  fallbackName,
}: {
  streamerId: string;
  orgTarget?: string;
  fallbackName?: string;
}) {
  const { authFetch, activeOrg } = useUserContext();
  const target = orgTarget || activeOrg?.id || activeOrg?.slug;
  const { streamer, loading } = useTinyStreamer(authFetch, "", target, streamerId, true);

  return (
    <ChannelMentionChip
      streamer={streamer}
      name={streamer?.name || fallbackName || (streamerId ? `channel_${streamerId}` : "channel")}
      displayName={streamer?.displayName}
      avatar={streamer?.avatar}
      loading={loading}
    />
  );
}

export function MemberMentionChip({
  userId,
  orgTarget,
  email,
  fallbackText,
}: {
  userId?: string | null;
  orgTarget?: string;
  email?: string | null;
  fallbackText?: string;
}) {
  const { authFetch, activeOrg } = useUserContext();
  const target = orgTarget || activeOrg?.id || activeOrg?.slug;
  const { user, loading } = useTinyUser(authFetch, "", target, userId, true);

  return (
    <UserMentionChip
      user={user}
      userId={userId}
      email={email}
      fallbackText={fallbackText}
      loading={loading}
    />
  );
}
