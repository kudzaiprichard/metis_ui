'use client';

interface PredictionSkeletonProps {
    variant?: 'card' | 'table' | 'detail';
    count?: number;
}

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`bg-white/10 rounded-lg animate-pulse ${className || ''}`} />;
}

export function PredictionSkeleton({ variant = 'card', count = 1 }: PredictionSkeletonProps) {
    const items = Array.from({ length: count }, (_, i) => i);

    if (variant === 'card') {
        return (
            <>
                {items.map((i) => (
                    <div key={i} className="border border-white/10 bg-white/[0.04] rounded-lg p-4 animate-pulse">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3.5 pb-3 border-b border-white/[0.08]">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <SkeletonBlock className="h-4 w-[120px]" />
                                <SkeletonBlock className="h-3 w-[80px]" />
                            </div>
                            <SkeletonBlock className="h-6 w-[60px]" />
                        </div>

                        {/* Treatment */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 mb-3 flex flex-col gap-2">
                            <SkeletonBlock className="h-2.5 w-[100px]" />
                            <SkeletonBlock className="h-[18px] w-[180px]" />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2.5 mb-3">
                            {[0, 1, 2, 3].map((j) => (
                                <div key={j} className="flex flex-col gap-1.5 p-2.5 bg-white/[0.02] rounded-lg">
                                    <SkeletonBlock className="h-2.5 w-[60px]" />
                                    <SkeletonBlock className="h-3.5 w-[50px]" />
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center">
                            <SkeletonBlock className="h-3 w-[100px]" />
                            <SkeletonBlock className="h-7 w-[100px]" />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (variant === 'table') {
        return (
            <>
                {items.map((i) => (
                    <div key={i} className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 py-3.5 border-b border-white/[0.04] items-center animate-pulse">
                        <div className="flex items-center gap-3">
                            <SkeletonBlock className="h-9 w-9 flex-shrink-0" />
                            <div className="flex flex-col gap-1">
                                <SkeletonBlock className="h-3.5 w-[120px]" />
                                <SkeletonBlock className="h-2.5 w-[80px]" />
                            </div>
                        </div>
                        <SkeletonBlock className="h-7 w-[160px]" />
                        <SkeletonBlock className="h-3.5 w-[60px]" />
                        <SkeletonBlock className="h-7 w-[70px]" />
                        <SkeletonBlock className="h-3.5 w-[100px]" />
                        <div className="flex gap-2 justify-end">
                            <SkeletonBlock className="h-8 w-8" />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    // Detail variant
    return (
        <div className="animate-pulse flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-6 w-[200px]" />
                <SkeletonBlock className="h-4 w-[300px]" />
            </div>
            {[0, 1].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                    <SkeletonBlock className="h-5 w-[150px]" />
                    <SkeletonBlock className="h-[120px] w-full border border-white/10" />
                </div>
            ))}
        </div>
    );
}