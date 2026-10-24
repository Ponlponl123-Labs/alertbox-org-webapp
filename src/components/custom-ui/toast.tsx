"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@animate-ui/react/primitives/base-ui/toast"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Alert02Icon, Cancel01Icon, CheckmarkCircle02Icon, InformationCircleIcon, Loading03Icon, MultiplicationSignCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const rawToastManager = ToastPrimitive.createToastManager()

export interface ToastOptions {
    id?: string
    description?: React.ReactNode
    duration?: number
    timeout?: number
    priority?: "low" | "high"
    actionProps?: React.ComponentPropsWithoutRef<"button">
    action?: {
        label: React.ReactNode
        onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    }
    onClose?: () => void
    onRemove?: () => void
    data?: unknown
    [key: string]: unknown
}

function normalizeOptions(options?: ToastOptions) {
    if (!options) return {}
    const { duration, timeout, action, actionProps, ...rest } = options
    const resolvedActionProps = action
        ? {
              ...actionProps,
              children: action.label,
              onClick: action.onClick,
          }
        : actionProps
    return {
        ...rest,
        timeout: duration ?? timeout,
        actionProps: resolvedActionProps,
    }
}

type RawToastManager = ReturnType<typeof ToastPrimitive.createToastManager>

interface ToastFunction extends RawToastManager {
    (message: React.ReactNode, options?: ToastOptions): string
    success: (message: React.ReactNode, options?: ToastOptions) => string
    error: (message: React.ReactNode, options?: ToastOptions) => string
    info: (message: React.ReactNode, options?: ToastOptions) => string
    warning: (message: React.ReactNode, options?: ToastOptions) => string
    loading: (message: React.ReactNode, options?: ToastOptions) => string
    dismiss: (id?: string) => void
}

const toast = Object.assign(
    (message: React.ReactNode, options?: ToastOptions) => {
        return rawToastManager.add({
            title: message,
            ...normalizeOptions(options),
        })
    },
    rawToastManager,
    {
        success: (message: React.ReactNode, options?: ToastOptions) => {
            return rawToastManager.add({
                title: message,
                type: "success",
                ...normalizeOptions(options),
            })
        },
        error: (message: React.ReactNode, options?: ToastOptions) => {
            return rawToastManager.add({
                title: message,
                type: "error",
                ...normalizeOptions(options),
            })
        },
        info: (message: React.ReactNode, options?: ToastOptions) => {
            return rawToastManager.add({
                title: message,
                type: "info",
                ...normalizeOptions(options),
            })
        },
        warning: (message: React.ReactNode, options?: ToastOptions) => {
            return rawToastManager.add({
                title: message,
                type: "warning",
                ...normalizeOptions(options),
            })
        },
        loading: (message: React.ReactNode, options?: ToastOptions) => {
            return rawToastManager.add({
                title: message,
                type: "loading",
                ...normalizeOptions(options),
            })
        },
        dismiss: (id?: string) => {
            rawToastManager.close(id)
        },
    }
) as unknown as ToastFunction

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
    return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
    return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
    return (
        <ToastPrimitive.Viewport
            data-slot="toast-viewport"
            className={cn(
                "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
                className
            )}
            {...props}
        />
    )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
    return (
        <ToastPrimitive.Root
            data-slot="toast"
            className={cn(
                "rounded-2xl group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))]",
                "h-(--height)",
                "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
                "data-expanded:h-(--toast-height)",
                "data-limited:opacity-0",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                className
            )}
            {...props}
        />
    )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
    return (
        <ToastPrimitive.Content
            data-slot="toast-content"
            className={cn(
                "flex h-full items-center gap-3 overflow-hidden p-4 data-behind:opacity-0 data-expanded:opacity-100",
                className
            )}
            {...props}
        />
    )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
    return (
        <ToastPrimitive.Title
            data-slot="toast-title"
            className={cn("text-sm font-medium", className)}
            {...props}
        />
    )
}

function ToastDescription({
    className,
    ...props
}: ToastPrimitive.Description.Props) {
    return (
        <ToastPrimitive.Description
            data-slot="toast-description"
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

function ToastAction({
    className,
    render = <Button variant="outline" size="sm" />,
    ...props
}: ToastPrimitive.Action.Props) {
    return (
        <ToastPrimitive.Action
            data-slot="toast-action"
            render={render}
            className={cn("shrink-0", className)}
            {...props}
        />
    )
}

function ToastClose({
    className,
    children,
    render = <Button variant="ghost" size="icon-sm" />,
    ...props
}: ToastPrimitive.Close.Props) {
    return (
        <ToastPrimitive.Close
            data-slot="toast-close"
            aria-label="Close toast"
            render={render}
            className={cn(
                "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
                className
            )}
            {...props}
        >
            {children ?? (
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2}
                    aria-hidden="true"
                />
            )}
        </ToastPrimitive.Close>
    )
}

function ToastIcon({ type }: { type: string | undefined }) {
    let icon: React.ReactNode = null

    if (type === "success") {
        icon = (
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2}
                aria-hidden="true"
            />
        )
    }

    if (type === "info") {
        icon = (
            <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2}
                aria-hidden="true"
            />
        )
    }

    if (type === "warning") {
        icon = (
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2}
                aria-hidden="true"
            />
        )
    }

    if (type === "error") {
        icon = (
            <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2}
                className="text-destructive"
                aria-hidden="true"
            />
        )
    }

    if (type === "loading") {
        icon = (
            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2}
                className="animate-spin"
                aria-hidden="true"
            />
        )
    }

    if (!icon) {
        return null
    }

    return (
        <span
            data-slot="toast-icon"
            className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
        >
            {icon}
        </span>
    )
}

function ToastList() {
    const { toasts } = ToastPrimitive.useToastManager()

    return toasts.map((toastItem) => (
        <Toast key={toastItem.id} toast={toastItem}>
            <ToastContent>
                <ToastIcon type={toastItem.type} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <ToastTitle />
                    <ToastDescription />
                </div>
                <ToastAction />
                <ToastClose />
            </ToastContent>
        </Toast>
    ))
}

function Toaster({
    children,
    toastManager = rawToastManager,
    ...props
}: ToastPrimitive.Provider.Props) {
    return (
        <ToastProvider toastManager={toastManager} {...props}>
            {children}
            <ToastPortal>
                <ToastViewport>
                    <ToastList />
                </ToastViewport>
            </ToastPortal>
        </ToastProvider>
    )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
    Toaster,
    Toast,
    ToastAction,
    ToastClose,
    ToastContent,
    ToastDescription,
    ToastPortal,
    ToastProvider,
    ToastTitle,
    ToastViewport,
    createToastManager,
    toast,
    useToastManager,
}