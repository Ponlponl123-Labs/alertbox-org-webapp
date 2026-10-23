"use client"

import * as React from "react"
import { cn } from "cn"
import { OTPInput, OTPInputContext } from "@animate-ui/react/primitives/input-otp"
import { MinusIcon } from "@phosphor-icons/react"

const InputOTPPlaceholderContext = React.createContext<string | undefined>(undefined)

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  const placeholder = typeof props.placeholder === "string" ? props.placeholder : undefined

  return (
    <InputOTPPlaceholderContext.Provider value={placeholder}>
      <OTPInput
        data-slot="input-otp"
        containerClassName={cn(
          "cn-input-otp flex items-center has-disabled:opacity-50",
          containerClassName
        )}
        spellCheck={false}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </InputOTPPlaceholderContext.Provider>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-none has-aria-invalid:border-destructive has-aria-invalid:ring-1 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  placeholderChar: customPlaceholder,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
  placeholderChar?: string
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const otpPlaceholder = React.useContext(InputOTPPlaceholderContext)
  const { char, hasFakeCaret, isActive, placeholderChar } =
    inputOTPContext?.slots[index] ?? {}
  const charPlaceholder = otpPlaceholder
    ? (otpPlaceholder[index] ?? (otpPlaceholder.length === 1 ? otpPlaceholder : undefined))
    : undefined
  const displayPlaceholder = customPlaceholder ?? charPlaceholder ?? placeholderChar

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-8 items-center justify-center border-y border-r border-input text-xs transition-all outline-none first:rounded-none first:border-l last:rounded-none aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-1 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      {char}
      {!char && displayPlaceholder && (
        <span className="text-muted-foreground/40">{displayPlaceholder}</span>
      )}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon
      />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
