import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers/Providers";
import { ToastBridge } from "@/src/components/shared/ui/toast";
import { AnimatedBackdrop } from "@/src/components/shared/AnimatedBackdrop";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Diabetes Treatment System",
    description: "AI-powered diabetes treatment optimization platform",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Browser extensions (Dark Reader, Grammarly, password managers, etc.)
        // routinely inject attributes onto <html> and <body>, which surface as
        // hydration mismatches even when the React tree is consistent.
        // `suppressHydrationWarning` only silences the warning at this single
        // element, not its descendants.
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            suppressHydrationWarning
        >
        {/* System-wide animated backdrop: drifting molecular grid + spotlight.
            Sits behind every page (z-0) via `fixed inset-0` so each route
            inherits the same atmosphere. */}
        <AnimatedBackdrop />
        <Providers>
            {/* Global ToastBridge - Automatically shows toasts queued during navigation */}
            <ToastBridge />
            {children}
        </Providers>
        </body>
        </html>
    );
}
