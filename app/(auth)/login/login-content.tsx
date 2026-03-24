'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { LoginForm } from '@/src/features/auth/components/LoginForm';
import { useToast } from '@/src/components/shared/ui/toast';
import { BrandShowcase } from '../_components/BrandShowcase';

function LoginInner() {
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const hasShownToast = useRef(false);

    useEffect(() => {
        const error = searchParams.get('error');
        if (error && !hasShownToast.current) {
            showToast('Authentication Required', error, 'error');
            hasShownToast.current = true;
        }
    }, [searchParams, showToast]);

    return (
        <div className="grid min-h-screen lg:grid-cols-[1.2fr_1fr]">
            {/* Brand panel — visible from lg upward */}
            <BrandShowcase />

            {/* Form panel — fully transparent. No card, no frosted layer.
                The animated grid runs edge to edge; only a soft primary-tinted
                radial halo sits behind the form to draw the eye. The inputs
                themselves carry punchier borders (see LoginForm.tsx) so each
                field reads as a cut-out against the live background. */}
            <section
                aria-label="Sign in"
                className="relative flex items-center justify-center px-6 sm:px-10 py-10"
            >
                {/* Divider — anchored to the form column's left edge.
                    Top/bottom inset is `80px` so the line starts on the same
                    y-coordinate as the animated grid's first horizontal line
                    (the grid is an 80×80 px pattern with origin at viewport
                    0,0). The `bg-divider-drift` class drifts it +160 px on Y
                    over 60 s linear, exactly matching the grid's
                    `bg-grid-drift` keyframe so the line stays locked to the
                    same horizontal grid lines as they scroll past. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-[80px] bottom-[80px] left-0 hidden lg:block w-px z-20 bg-divider-drift"
                    style={{
                        background:
                            'linear-gradient(to bottom, transparent 0px, rgba(255,255,255,0.22) 12px, rgba(255,255,255,0.22) calc(100% - 12px), transparent 100%)',
                    }}
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 hidden lg:block"
                    style={{
                        background:
                            'radial-gradient(36rem 32rem at 50% 50%, rgba(16,185,129,0.18), rgba(16,185,129,0.06) 38%, transparent 68%)',
                    }}
                />
                <div className="relative z-10 w-full max-w-md">
                    <LoginForm />
                </div>
            </section>
        </div>
    );
}

export function LoginContent() {
    return (
        <Suspense fallback={<div className="text-foreground p-10">Loading…</div>}>
            <LoginInner />
        </Suspense>
    );
}
