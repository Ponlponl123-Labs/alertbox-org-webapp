"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@/lib/utils";

interface ScrollAreaContextValue {
  canScrollX: boolean;
  canScrollY: boolean;
}

const ScrollAreaContext = React.createContext<ScrollAreaContextValue | null>(null);

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, forwardedRef) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const [canScroll, setCanScroll] = React.useState({ x: false, y: false });

  const checkOverflow = React.useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const el = viewportRef.current;
      if (!el) return;
      const y = el.scrollHeight - el.clientHeight > 2;
      const x = el.scrollWidth - el.clientWidth > 2;
      setCanScroll((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
    });
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    checkOverflow();

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      ro.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [checkOverflow]);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [forwardedRef],
  );

  const contextValue = React.useMemo(
    () => ({ canScrollX: canScroll.x, canScrollY: canScroll.y }),
    [canScroll.x, canScroll.y],
  );

  return (
    <ScrollAreaContext.Provider value={contextValue}>
      <ScrollAreaPrimitive.Root
        data-slot="scroll-area"
        className={cn("relative group/scrollarea", className)}
        onPointerEnter={checkOverflow}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          data-slot="scroll-area-viewport"
          ref={setRefs}
          className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    </ScrollAreaContext.Provider>
  );
});
ScrollArea.displayName = "ScrollArea";

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  const ctx = React.useContext(ScrollAreaContext);
  const isScrollable = ctx ? (orientation === "vertical" ? ctx.canScrollY : ctx.canScrollX) : true;

  if (!isScrollable) {
    return null;
  }

  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-0.5 select-none transition-opacity duration-150 opacity-0 hover:opacity-100 group-hover/scrollarea:opacity-100 data-scrolling:opacity-100",
        orientation === "horizontal"
          ? "h-2.5 flex-col border-t border-t-transparent"
          : "h-full w-2.5 border-l border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative rounded-xl bg-border hover:bg-muted-foreground/40 transition-colors",
          orientation === "vertical" ? "w-full" : "h-full",
        )}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
