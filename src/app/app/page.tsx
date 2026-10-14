"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { useStore } from "zustand";
import { orgStore, selectActiveOrg, selectActiveStreamer } from "@/hooks/store/org";
import { Spinner } from "@/components/ui/spinner";

function Page() {
  const router = useRouter();
  const { userInfo } = useUserContext();
  const activeOrg = useStore(orgStore, selectActiveOrg);
  const activeStreamer = useStore(orgStore, selectActiveStreamer);
  const isOrgMode = useStore(orgStore, (s) => s.isOrgMode);

  useEffect(() => {
    if (!userInfo) return;

    if (!userInfo.memberships || userInfo.memberships.length === 0) {
      router.replace("/app/onboarding");
      return;
    }

    if (!activeOrg) return;

    const orgKey = activeOrg.slug || activeOrg.id;
    if (isOrgMode) {
      router.replace(`/app/${orgKey}`);
    } else if (activeStreamer) {
      const streamerKey = activeStreamer.name || activeStreamer.id;
      router.replace(`/app/${orgKey}/${streamerKey}`);
    } else {
      router.replace(`/app/${orgKey}`);
    }
  }, [userInfo, activeOrg, activeStreamer, isOrgMode, router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Spinner />
    </div>
  );
}

export default Page;
