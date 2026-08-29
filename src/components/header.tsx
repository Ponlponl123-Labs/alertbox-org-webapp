"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStore } from "zustand";
import { Button } from "./ui/button";
import ThemeSwitcher from "./theme-switcher";
import { usePathname } from "next/navigation";
import { coreStore } from "@/hooks/store/core";
import LanguageSwitcher from "./language-switcher";
import {
  CaretLeftIcon,
  GithubLogoIcon,
  HandHeartIcon,
  ListIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import CurrentUserChip from "./current-user-chip";
import { useUserContext } from "@/contexts/user";

function Nav({
  classNames,
}: {
  classNames?: {
    link?: string;
    button?: string;
  };
}) {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo } = useUserContext();
  return (
    <>
      <Link href={"/about"}>
        <Button
          variant="ghost"
          size={"sm"}
          className={cn("rounded-lg p-2 w-full", classNames?.link)}
        >
          {lang.data.header.links.about}
        </Button>
      </Link>
      <Link href={"/pricing"}>
        <Button
          variant="ghost"
          size={"sm"}
          className={cn("rounded-lg p-2 w-full", classNames?.link)}
        >
          {lang.data.header.links.pricing}
        </Button>
      </Link>
      <div className="md:hidden my-auto" />
      <Link
        href={"https://github.com/Ponlponl123-Labs/alertbox-org"}
        target="_blank"
      >
        <Button
          variant="secondary"
          className={cn("rounded-xl p-4 w-full", classNames?.button)}
        >
          <GithubLogoIcon size={18} weight="fill" />
          Github
        </Button>
      </Link>
      {!userInfo && (
        <Link href={"/app"}>
          <Button
            variant="default"
            className={cn("rounded-xl p-4 w-full", classNames?.button)}
          >
            {lang.data.header.actions.get_started}
          </Button>
        </Link>
      )}
    </>
  );
}

function Header() {
  const pathname = usePathname();
  const [isNavActive, setIsNavActive] = useState(false);
  const isSidebarCollapsed = useStore(
    coreStore,
    (state) => state.isSidebarCollapsed,
  );
  const isSidebarHiddenOnMobile = useStore(
    coreStore,
    (state) => state.isSidebarHiddenOnMobile,
  );
  const setSidebarHiddenOnMobile = useStore(
    coreStore,
    (state) => state.setSidebarHiddenOnMobile,
  );

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsNavActive(false);
  }

  if (pathname.startsWith("/@")) return null;

  return (
    <>
      <motion.header
        initial={{
          height: pathname.startsWith("/app") ? 48 : 64,
          padding: pathname.startsWith("/app") ? 8 : 16,
        }}
        animate={{
          height: pathname.startsWith("/app") ? 48 : 64,
          padding: pathname.startsWith("/app") ? 8 : 16,
        }}
        className={cn(
          "h-16 flex items-center justify-between px-4 absolute top-0 left-0 right-0 z-50",
          pathname === "/"
            ? "border-transparent"
            : "supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-sm border-border border-b border-solid ",
          pathname.startsWith("/app") &&
            "border-0 bg-transparent bg-none supports-backdrop-filter:bg-transparent/80 supports-backdrop-filter:backdrop-blur-none",
        )}
      >
        <AnimatePresence>
          <motion.div
            initial={{
              maxWidth: pathname.startsWith("/app") ? "100vw" : 1448,
            }}
            animate={{
              maxWidth: pathname.startsWith("/app") ? "100vw" : 1448,
            }}
            className={cn(
              "flex-1 min-w-0 max-w-362 mx-auto w-full flex items-center justify-between gap-4",
              pathname.startsWith("/app") && "max-w-none",
            )}
            id="header-main"
          >
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {pathname.startsWith("/app") && (
                  <motion.div
                    id="header-app-back"
                    layoutId="header-app-back"
                    exit={{ opacity: 0, marginRight: -24, marginLeft: 0 }}
                    animate={{
                      opacity: 1,
                      marginRight: isSidebarCollapsed ? 16 : -4,
                    }}
                    initial={{
                      opacity: 0,
                      marginRight: -24,
                      marginLeft: 0,
                    }}
                  >
                    <Link href={"/"} className="max-md:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-foreground/40"
                        aria-hidden="true"
                      >
                        <CaretLeftIcon
                          size={16}
                          weight="bold"
                          className="size-3"
                        />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl md:hidden text-foreground/40"
                      aria-hidden="true"
                      onClick={() =>
                        setSidebarHiddenOnMobile(!isSidebarHiddenOnMobile)
                      }
                    >
                      <ListIcon size={16} weight="bold" className="size-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div className="flex items-center gap-3">
                <Link
                  href={pathname.startsWith("/app") ? "/app" : "/"}
                  className={cn("flex items-center gap-2.5")}
                >
                  <HandHeartIcon size={24} weight="fill" />
                  <motion.h1
                    initial={{
                      fontWeight: pathname.startsWith("/app") ? 500 : 600,
                      opacity: pathname.startsWith("/app") ? 0.8 : 1,
                    }}
                    animate={{
                      fontWeight: pathname.startsWith("/app") ? 500 : 600,
                      opacity: pathname.startsWith("/app") ? 0.8 : 1,
                    }}
                    className="text-base font-semibold font-sans"
                  >
                    AlertBox
                    <span className="text-sm opacity-60 ml-0.5 font-light tracking-wider">
                      .org
                    </span>
                  </motion.h1>
                </Link>
                <div className="mt-0.75 -ml-1.5">
                  <LanguageSwitcher />
                </div>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {!pathname.startsWith("/app") && (
                  <motion.div
                    id="header-nav"
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    className="max-md:hidden flex items-center gap-2"
                  >
                    <Nav />
                  </motion.div>
                )}
              </AnimatePresence>
              <CurrentUserChip />
              <ThemeSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-xl md:hidden",
                  pathname.startsWith("/app") && "hidden",
                )}
                aria-hidden="true"
                onClick={() => setIsNavActive((prev) => !prev)}
              >
                <ListIcon size={20} weight="bold" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.header>
      <AnimatePresence>
        {isNavActive && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="header-nav-mobile"
            className="fixed flex flex-col gap-3 top-0 left-0 size-full bg-background supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-3xl z-40 p-6 pt-22 overflow-y-auto"
          >
            <Nav
              classNames={{
                link: "justify-start p-6",
                button: "p-6",
              }}
            />
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
