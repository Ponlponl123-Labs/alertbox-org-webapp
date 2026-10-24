"use client"

import { Toaster } from "@/components/custom-ui/toast"

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <Toaster progressBar={false}>
            {children}
        </Toaster>
    )
}