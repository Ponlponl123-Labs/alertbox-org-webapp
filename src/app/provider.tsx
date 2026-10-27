"use client"

import { AnimateUIProvider } from "@animate-ui/react/provider";
import { Toaster } from "@/components/custom-ui/toast"

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <AnimateUIProvider tempo={1.2} checkAnimation="draw">
            <Toaster progressBar={false}>
                {children}
            </Toaster>
        </AnimateUIProvider>
    )
}