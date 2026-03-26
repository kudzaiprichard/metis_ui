export default function SimilarPatientsLoading() {
    return (
        <div className="animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-5 mb-6">
                <div className="space-y-2">
                    <div className="h-7 w-56 rounded-md bg-white/[0.06]" />
                    <div className="h-3.5 w-80 rounded bg-white/[0.04]" />
                </div>
                <div className="h-9 w-32 rounded-lg bg-white/[0.05]" />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            {/* Filters bar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="h-9 flex-1 max-w-[420px] rounded-lg bg-white/[0.04]" />
                <div className="h-9 w-32 rounded-lg bg-white/[0.04]" />
                <div className="h-9 w-32 rounded-lg bg-white/[0.04]" />
            </div>

            {/* Result rows */}
            <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 py-4 border-b border-white/[0.04] items-center"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
                            <div className="space-y-1.5">
                                <div className="h-3.5 w-28 rounded bg-white/[0.06]" />
                                <div className="h-3 w-16 rounded bg-white/[0.04]" />
                            </div>
                        </div>
                        <div className="h-4 w-32 rounded bg-white/[0.05]" />
                        <div className="h-4 w-16 rounded bg-white/[0.05]" />
                        <div className="h-4 w-20 rounded bg-white/[0.05]" />
                        <div className="h-3.5 w-24 rounded bg-white/[0.04]" />
                        <div className="flex gap-2 justify-end">
                            <div className="h-8 w-8 rounded-lg bg-white/[0.04]" />
                            <div className="h-8 w-8 rounded-lg bg-white/[0.04]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
