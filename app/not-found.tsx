import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/src/components/shadcn/button";

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center px-6 text-foreground">
            <div className="max-w-md w-full text-center bg-card/80 border border-border rounded-lg backdrop-blur-[20px] p-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <FileQuestion className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                    Error 404
                </p>
                <h1 className="text-2xl font-semibold tracking-tight mb-3">
                    Page not found
                </h1>
                <p className="text-md text-muted-foreground mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been
                    moved.
                </p>
                <Button asChild className="rounded-lg">
                    <Link href="/login">Back to login</Link>
                </Button>
            </div>
        </main>
    );
}
