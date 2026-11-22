"use client";

import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { PublicProfileData } from "./PublicProfileClient";
import { LanguageSwitcher } from "@/components/shared";
import { ReportStreamerDialog } from "@/components/features/modals/report-streamer-dialog";

export default function Footer({
  username,
  initialData,
}: {
  username?: string;
  initialData: PublicProfileData | null;
}) {
  const lang = useStore(coreStore, (state) => state.lang);
  return (
    <footer className="px-6 pt-24 pb-12 text-foreground/40 text-xs w-full flex flex-col items-center gap-3 mt-auto select-none">
      <div className="flex items-center gap-3">
        <ReportStreamerDialog
          username={username}
          streamerName={initialData?.displayName || initialData?.name}
        />
        <LanguageSwitcher showLabel={true} />
      </div>
      <div className="flex gap-3 items-center">
        <Link href={"https://law.ponlponl123.com/privacy"} target="_blank" rel="noopener noreferrer">
          {lang.data.footer.links.legal.privacy}
        </Link>
        <Link href={"https://law.ponlponl123.com/tos"} target="_blank" rel="noopener noreferrer">
          {lang.data.footer.links.legal.tos}
        </Link>
        <Link
          href={"https://law.ponlponl123.com/additional/alertbox.org"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {lang.data.footer.links.legal.additional}
        </Link>
      </div>
      <span>
        {lang.data.footer.copyright
          .replace(
            "{year}",
            new Date().toLocaleString(lang.key, {
              year: "numeric",
            }),
          )
          .replace("{name}", initialData?.displayName || "")}
      </span>
    </footer>
  );
}
