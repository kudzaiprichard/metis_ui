export default function PatientsLoading() {
    return (
        <div className="animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-5 mb-6">
                <div className="space-y-2">
                    <div className="h-7 w-44 rounded-md bg-white/[0.06]" />
                    <div className="h-3.5 w-72 rounded bg-white/[0.04]" />
                </div>
                <div className="flex gap-2.5">
                    <div className="h-9 w-28 rounded-lg bg-white/[0.05]" />
                    <div className="h-9 w-32 rounded-lg bg-white/[0.05]" />
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            {/* Summary card row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="h-20 rounded-lg bg-white/[0.04] border border-white/[0.08]" />
                <div className="h-20 rounded-lg bg-white/[0.04] border border-white/[0.08]" />
            </div>

            {/* Controls bar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <div className="h-9 w-24 rounded-lg bg-white/[0.04]" />
                    <div className="h-9 flex-1 max-w-[420px] rounded-lg bg-white/[0.04]" />
                </div>
                <div className="h-9 w-20 rounded-lg bg-white/[0.04]" />
            </div>

            {/* Card grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/[0.06]" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 rounded bg-white/[0.06]" />
                                <div className="h-3 w-20 rounded bg-white/[0.04]" />
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="h-3 w-full rounded bg-white/[0.04]" />
                            <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
                            <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
