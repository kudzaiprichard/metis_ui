import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers/Providers";
import {ToastBridge} from "@/src/components/shared/ui/toast";

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
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>

        <Providers>
            {/* Global ToastBridge - Automatically shows toasts queued during navigation */}
            <ToastBridge />
            {children}
        </Providers>
        </body>
        </html>
    );
}