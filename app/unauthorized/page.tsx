'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <main className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-[16px] border border-white/20 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
                <div className="p-7 sm:p-8 flex flex-col items-center text-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <CircleAlert className="h-8 w-8 text-destructive" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Access Denied
                    </h1>

                    <p className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-sm">
                        You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>

                    <Button
                        onClick={() => router.back()}
                        className="w-full h-11 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>

                    <p className="text-xs text-foreground/40">
                        Error Code: 403 - Forbidden
                    </p>
                </div>
            </div>
        </main>
    );
}
