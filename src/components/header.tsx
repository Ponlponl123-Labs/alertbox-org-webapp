"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState, useSyncExternalStore } from "react";
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
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import CurrentUserChip from "./current-user-chip";
import { useUserContext } from "@/contexts/user";
import Image from "next/image";

function Nav({
  classNames,
}: {
  classNames?: {
    link?: string;
    button?: string;
  };
}) {
  const lang = useStore(coreStore, (state) => state.lang);
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
    </>
  );
}

function NavActions({
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
  const lang = useStore(coreStore, (state) => state.lang);
  const [isNavActive, setIsNavActive] = useState(false);
  const [instantTop, setInstantTop] = useState(false);

  useEffect(() => {
    if (instantTop) {
      const raf = requestAnimationFrame(() => setInstantTop(false));
      return () => cancelAnimationFrame(raf);
    }
  }, [instantTop]);

  const toggleNav = () => {
    setInstantTop(true);
    setIsNavActive((prev) => !prev);
  };

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 0);
  });
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
  const isIndex = pathname === "/";
  const isApp = pathname.startsWith("/app");
  const isDocs = pathname.startsWith("/docs");
  const isFullHeaderWidth = isApp || isDocs;
  const statusBannerHeight = useStore(
    coreStore,
    (state) => state.statusBannerHeight,
  );

  const headerTop =
    !isNavActive && isIndex && isScrolled
      ? statusBannerHeight + 8
      : isIndex || isDocs || isNavActive
        ? statusBannerHeight
        : 0;

  const windowWidth = useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => window.innerWidth,
    () => 1448,
  );
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsNavActive(false);
    setInstantTop(true);
  }

  const rootMaxWidth =
    isIndex && isScrolled && windowWidth >= 768 ? 760 : windowWidth;

  const childMaxWidth =
    isFullHeaderWidth || (isIndex && !isScrolled)
      ? windowWidth
      : isIndex && isScrolled && windowWidth >= 768
        ? 760
        : Math.min(windowWidth, 1448);

  if (pathname.startsWith("/@")) return null;

  return (
    <>
      <motion.header
        initial={{
          height: isFullHeaderWidth ? 48 : isIndex && isScrolled ? 48 : 64,
          padding: isFullHeaderWidth ? 8 : 16,
          top: headerTop,
          maxWidth: rootMaxWidth,
        }}
        animate={{
          height: isFullHeaderWidth ? 48 : isIndex && isScrolled ? 48 : 64,
          padding: isFullHeaderWidth ? 8 : 16,
          top: headerTop,
          maxWidth: rootMaxWidth,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          top: instantTop
            ? { duration: 0 }
            : { type: "spring", stiffness: 300, damping: 30 },
          maxWidth: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
        className={cn(
          "flex items-center justify-between px-4 inset-x-0 mx-auto z-20001 w-full",
          isDocs
            ? "fixed h-12 bg-background/80 backdrop-blur-md border-b border-border"
            : isIndex
              ? "md:fixed max-md:-mb-2 h-16"
              : "absolute h-16",
          isIndex
            ? "border-transparent"
            : !isDocs && "supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-sm border-border border-b border-solid ",
          isIndex && isScrolled && "md:bg-muted/60 md:backdrop-blur-lg md:rounded-3xl",
          isNavActive && "fixed",
          pathname.startsWith("/app") &&
          "border-0 bg-transparent bg-none supports-backdrop-filter:bg-transparent/80 supports-backdrop-filter:backdrop-blur-none",
        )}
      >
        <AnimatePresence>
          <motion.div
            initial={{
              maxWidth: childMaxWidth,
            }}
            animate={{
              maxWidth: childMaxWidth,
            }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex-1 min-w-0 mx-auto w-full flex items-center justify-between gap-4"
            id="header-main"
          >
            <div className="flex flex-1 items-center gap-3">
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
                  href={isApp ? "/app" : "/"}
                  className={cn("flex items-center gap-2.5")}
                >
                  {pathname.startsWith("/docs") ? (
                    <Image
                      src="/alertbox-colored.png"
                      alt="AlertBox Logo"
                      className="w-7 h-7 object-contain"
                      width={28}
                      height={28}
                    />
                  ) : (
                    <HandHeartIcon size={isApp ? 24 : isIndex ? 20 : 28} className={cn(isIndex && "ml-1")} weight="fill" />
                  )}
                  <motion.h1
                    initial={{
                      fontWeight: isApp ? 500 : 500,
                      opacity: isApp ? 0.8 : 1,
                    }}
                    animate={{
                      fontWeight: isApp ? 500 : 500,
                      opacity: isApp ? 0.8 : 1,
                    }}
                    className="text-base font-semibold tracking-wider -ml-0.5 font-sans flex items-center"
                  >
                    AlertBox
                    <span className="text-sm opacity-60 ml-0.5 font-light tracking-wider">
                      .org
                    </span>
                    {isDocs && (
                      <span className="ml-2 text-sm font-extralight font-sans tracking-wider border-l border-foreground/40 pl-2">
                        {lang.data.header.developers}
                      </span>
                    )}
                  </motion.h1>
                </Link>
                <div className="mt-0.75 -ml-1.5">
                  <LanguageSwitcher />
                </div>
              </motion.div>
            </div>
            <AnimatePresence>
              {!isApp && !isIndex && (
                <div className="flex flex-2 mx-auto justify-center items-center gap-2 max-md:hidden">
                  <motion.div
                    id="header-nav"
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    className="max-md:hidden flex items-center gap-2"
                  >
                    <Nav />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            <div className="flex flex-1 justify-end items-center gap-2">
              <AnimatePresence>
                {!isApp && isIndex && (
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
              <div className="max-md:hidden contents">
                <NavActions />
              </div>
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
                onClick={toggleNav}
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
            className={
              cn(
                "fixed md:hidden! flex flex-col gap-3 top-(--status-banner-height,0px) left-0 w-full h-[calc(100dvh-var(--status-banner-height,0))] bg-background supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-3xl z-20000 p-6 pt-22 overflow-y-auto",
                isDocs && "pt-32"
              )
            }
          >
            <Nav
              classNames={{
                link: "justify-start p-6",
              }}
            />
            <NavActions classNames={{
              button: "p-6",
            }} />
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
