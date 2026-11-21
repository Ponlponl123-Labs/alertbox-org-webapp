"use client"

import * as React from "react"
import { useStore } from "zustand"
import { coreStore } from "@/hooks/store/core"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { CaretLeftIcon, CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react"
import * as PaginationPrimitive from '@animate-ui/react/primitives/pagination'

function Pagination({
  className,
  ...props
}: React.ComponentProps<typeof PaginationPrimitive.Root>) {
  const lang = useStore(coreStore, (state) => state.lang)
  return (
    <PaginationPrimitive.Root
      role="navigation"
      aria-label={lang.data.common.aria.pagination}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  )
}

function PaginationPrevious({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const lang = useStore(coreStore, (state) => state.lang)
  const label = text ?? lang.data.common.previous
  return (
    <PaginationLink
      aria-label={lang.data.common.aria.prev_page}
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <CaretLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{label}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const lang = useStore(coreStore, (state) => state.lang)
  const label = text ?? lang.data.common.next
  return (
    <PaginationLink
      aria-label={lang.data.common.aria.next_page}
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{label}</span>
      <CaretRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const lang = useStore(coreStore, (state) => state.lang)
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <DotsThreeIcon
      />
      <span className="sr-only">{lang.data.common.aria.more_pages}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
