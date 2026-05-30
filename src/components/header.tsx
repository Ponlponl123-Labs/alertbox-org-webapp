"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import ThemeSwitcher from "./theme-switcher";
import { GithubLogoIcon, HandHeartIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

function Header() {
  const pathname = usePathname();
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <header
      className={cn(
        "h-16 flex items-center justify-between px-4 border-b border-solid absolute top-0 left-0 right-0 z-50",
        pathname === "/"
          ? "bg-linear-0 to-white dark:to-black from-transparent border-transparent"
          : "bg-background/80 backdrop-blur-sm border-border",
      )}
    >
      <div className="flex-1 min-w-0 max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
        <div>
          <Link href={"/"} className="flex items-center gap-2.5">
            <HandHeartIcon size={26} weight="fill" />
            <h1 className="text-lg font-semibold tracking-tight">
              AlertBox.org
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href={"/about"}>
            <Button variant="ghost" size={"sm"} className="rounded-lg p-2">
              {lang.data.header.links.about}
            </Button>
          </Link>
          <Link href={"/pricing"}>
            <Button variant="ghost" size={"sm"} className="rounded-lg p-2">
              {lang.data.header.links.pricing}
            </Button>
          </Link>
          <Link
            href={"https://github.com/Ponlponl123-Labs/alertbox-org"}
            target="_blank"
          >
            <Button variant="secondary" className="rounded-xl p-4">
              <GithubLogoIcon size={18} weight="fill" />
              Github
            </Button>
          </Link>
          <Link href={"/app"}>
            <Button variant="default" className="rounded-xl p-4">
              {lang.data.header.actions.get_started}
            </Button>
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Header;
