import { GithubLogoIcon, HandHeartIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import ThemeSwitcher from "./theme-switcher";

function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-4 border-b border-solid border-border absolute top-0 left-0 right-0 z-50">
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
          <Link href={"/app"}>
            <Button variant="secondary" className="rounded-xl p-4">
              <GithubLogoIcon size={18} weight="fill" />
              Github
            </Button>
          </Link>
          <Link href={"/app"}>
            <Button variant="default" className="rounded-xl p-4">
              Get started
            </Button>
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Header;
