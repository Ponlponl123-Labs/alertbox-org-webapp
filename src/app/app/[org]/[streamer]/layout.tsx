"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { orgStore } from "@/hooks/store/org";
import { useStore } from "zustand";

export default function StreamerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const orgParam = params?.org as string | undefined;
  const streamerParam = params?.streamer as string | undefined;
  const organizations = useStore(orgStore, (s) => s.organizations);

  useEffect(() => {
    if (!streamerParam || !organizations.length) return;
    const currentOrg = organizations.find((o) => String(o.id) === orgParam || o.slug === orgParam);
    const targetStreamer = currentOrg?.streamers?.find(
      (s) => String(s.id) === streamerParam || s.name === streamerParam || s.uri === streamerParam,
    );
    if (targetStreamer) {
      const state = orgStore.getState();
      if (String(targetStreamer.id) !== String(state.activeStreamerId)) {
        state.setActiveStreamerId(String(targetStreamer.id));
      }
      if (state.isOrgMode) {
        state.setOrgMode(false);
      }
    }
  }, [orgParam, streamerParam, organizations]);

  return <>{children}</>;
}
