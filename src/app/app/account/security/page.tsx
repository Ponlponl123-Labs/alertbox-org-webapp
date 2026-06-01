"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import {
  ClockUserIcon,
  PaperPlaneTiltIcon,
  PenIcon,
} from "@phosphor-icons/react";
import { useStore } from "zustand";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo } = useUserContext();

  return (
    <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
      {userInfo && (
        <div className="flex gap-1.75 items-center">
          <Avatar size="sm">
            {userInfo.avatar && <AvatarImage src={userInfo.avatar} />}
            <AvatarFallback>{getFallbackInitial(userInfo.name)}</AvatarFallback>
          </Avatar>
          <span className="text-foreground/40">@{userInfo?.name}</span>
        </div>
      )}
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.security.title}
      </h1>
      <p className="mt-1.5 text-sm text-foreground/40">
        {lang.data.app.security.description}
      </p>
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-4">
        {[
          {
            icon: (
              <ClockUserIcon
                size={22}
                className="text-foreground/60"
                weight="fill"
              />
            ),
            title: lang.data.app.security.registered,
            value: userInfo?.time
              ? new Date(userInfo.time).toLocaleDateString(lang.key, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "Unknown",
          },
          {
            icon: (
              <PenIcon size={22} className="text-foreground/60" weight="fill" />
            ),
            title: lang.data.app.security.registered_with,
            value: userInfo?.create_with?.toWellFormed() || "Not set",
          },
          {
            icon: (
              <PaperPlaneTiltIcon
                size={22}
                className="text-foreground/60"
                weight="fill"
              />
            ),
            title: lang.data.app.security.email.title,
            description: lang.data.app.security.email.description,
            value: userInfo?.email || "Not set",
          },
        ].map((item, i) => (
          <div className="w-full bg-card p-4 rounded-2xl group" key={i}>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.25">
                {item.icon}
                <h1 className="text-lg font-semibold">{item.title}</h1>
              </div>
              {item?.description && (
                <p className="text-foreground/40 text-xs">{item.description}</p>
              )}
              <div className="flex items-center gap-1.5 w-full flex-1 min-w-0 mt-1.5 max-sm:flex-col px-2 py-1.5 rounded-lg bg-foreground/5 text-sm text-foreground/80 group-hover:bg-foreground/10 select-none pointer-events-none">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
