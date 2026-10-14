"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { orgStore } from "@/hooks/store/org";
import { useStore } from "zustand";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const orgParam = params?.org as string | undefined;
  const streamerParam = params?.streamer as string | undefined;
  const organizations = useStore(orgStore, (s) => s.organizations);

  useEffect(() => {
    if (!orgParam || !organizations.length) return;
    const targetOrg = organizations.find((o) => o.id === orgParam || o.slug === orgParam);
    if (targetOrg) {
      if (targetOrg.id !== orgStore.getState().activeOrgId) {
        orgStore.getState().setActiveOrgId(targetOrg.id);
      }
      if (!streamerParam) {
        orgStore.getState().setOrgMode(true);
      }
    }
  }, [orgParam, streamerParam, organizations]);

  return <>{children}</>;
}
