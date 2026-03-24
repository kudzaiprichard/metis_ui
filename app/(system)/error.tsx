"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/src/components/shadcn/button";

interface SystemErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function SystemError({ error, reset }: SystemErrorProps) {
    useEffect(() => {
        console.error("System segment error boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6 text-foreground">
            <div className="max-w-md w-full text-center bg-card/80 border border-border rounded-lg backdrop-blur-[20px] p-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-lg bg-destructive/15 border border-destructive/30 flex items-center justify-center">
                    <CircleAlert className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight mb-3">
                    Something went wrong
                </h2>
                <p className="text-md text-muted-foreground mb-2 leading-relaxed">
                    We hit an unexpected error loading this page.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground/70 font-mono mb-6">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-3 justify-center flex-wrap mt-6">
                    <Button onClick={reset} className="rounded-lg">
                        <RotateCw className="h-3.5 w-3.5 mr-2" />
                        Try again
                    </Button>
                    <Button asChild variant="outline" className="rounded-lg">
                        <Link href="/login">Back to login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
