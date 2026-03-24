'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, TriangleAlert, UsersRound } from 'lucide-react';

import { GraphView } from '@/src/features/graph-view/components/GraphView';
import { adaptGraphResponse } from '@/src/features/graph-view/lib/adapters';
import { TOKENS } from '@/src/features/graph-view/lib/tokens';
import { useAutoSearchSimilarPatientsGraph } from '@/src/features/similar-patients/hooks/useSimilarPatients';
import type { FindSimilarPatientsGraphRequest } from '@/src/features/similar-patients/api/similar-patients.types';

function GraphViewInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientId = searchParams.get('patientId') || undefined;
    const medicalDataId = searchParams.get('medicalDataId') || undefined;
    const limitParam = searchParams.get('limit');
    const minSimilarityParam = searchParams.get('minSimilarity');
    // Multi-value: search page appends one `treatmentFilter` entry per drug.
    // Joined into a stable string so the useMemo dep array stays primitive.
    const treatmentFilterKey = searchParams.getAll('treatmentFilter').join('|');

    const params = useMemo<FindSimilarPatientsGraphRequest>(() => {
        // Filters are forwarded from the Similar Patients search page. Falls
        // back to the same defaults the search form starts with so the page
        // is still usable when opened directly via URL.
        const parsedLimit = limitParam ? parseInt(limitParam, 10) : NaN;
        const parsedMin = minSimilarityParam ? parseFloat(minSimilarityParam) : NaN;
        const treatmentFilter = treatmentFilterKey
            ? treatmentFilterKey.split('|').filter(Boolean)
            : [];
        const out: FindSimilarPatientsGraphRequest = {
            limit: Number.isFinite(parsedLimit) ? parsedLimit : 20,
            min_similarity: Number.isFinite(parsedMin) ? parsedMin : 0.5,
        };
        if (medicalDataId) out.medical_record_id = medicalDataId;
        else if (patientId) out.patient_id = patientId;
        if (treatmentFilter.length > 0) out.treatment_filter = treatmentFilter;
        return out;
    }, [patientId, medicalDataId, limitParam, minSimilarityParam, treatmentFilterKey]);

    const query = useAutoSearchSimilarPatientsGraph(params);

    const adapted = useMemo(() => (query.data ? adaptGraphResponse(query.data) : null), [query.data]);

    if (!patientId && !medicalDataId) {
        return (
            <Shell>
                <EmptyState
                    icon={<UsersRound className="h-7 w-7 text-muted-foreground/40" />}
                    title="No patient selected"
                    body="Open Graph View from the Similar Patients search results to load a cohort."
                    action={
                        <Link
                            href="/doctor/similar-patients"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-white/15 text-sm text-foreground/80 hover:bg-white/[0.06] transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Similar Patients
                        </Link>
                    }
                />
            </Shell>
        );
    }

    if (query.isLoading || (query.isFetching && !adapted)) {
        return (
            <Shell>
                <EmptyState
                    icon={<Loader2 className="h-7 w-7 animate-spin text-primary/70" />}
                    title="Loading graph…"
                    body="Finding similar historical cases."
                />
            </Shell>
        );
    }

    if (query.isError) {
        return (
            <Shell>
                <EmptyState
                    icon={<TriangleAlert className="h-7 w-7 text-red-500/70" />}
                    title="Could not load graph"
                    body="The similar patient graph couldn't be fetched. Try again or return to the search."
                    action={
                        <button
                            onClick={() => query.refetch()}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-white/15 text-sm text-foreground/80 hover:bg-white/[0.06] transition-colors"
                        >
                            Retry
                        </button>
                    }
                />
            </Shell>
        );
    }

    if (!adapted || adapted.patients.length === 0) {
        return (
            <Shell>
                <EmptyState
                    icon={<UsersRound className="h-7 w-7 text-muted-foreground/40" />}
                    title="No similar cases"
                    body="No patients met the similarity threshold for this query."
                    action={
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-white/15 text-sm text-foreground/80 hover:bg-white/[0.06] transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                        </button>
                    }
                />
            </Shell>
        );
    }

    // Forward the same patient context back so refreshing the search page
    // shows the cohort the user was just looking at.
    const handleBack = () => {
        const back = new URLSearchParams();
        if (medicalDataId) back.set('medicalDataId', medicalDataId);
        else if (patientId) back.set('patientId', patientId);
        const qs = back.toString();
        router.push(qs ? `/doctor/similar-patients?${qs}` : '/doctor/similar-patients');
    };

    return <GraphView data={adapted} loading={query.isFetching} onBack={handleBack} />;
}

export function GraphViewContent() {
    // Suspense boundary required because GraphViewInner reads useSearchParams.
    // Mirrors the wrapper shape used by similar-patients-content.tsx.
    return (
        <Suspense fallback={null}>
            <GraphViewInner />
        </Suspense>
    );
}

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                height: '100vh',
                width: '100%',
                background: TOKENS.bg,
                color: TOKENS.text,
                fontFamily: TOKENS.fontSans,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {children}
        </div>
    );
}

function EmptyState({
    icon,
    title,
    body,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center text-center max-w-sm px-6">
            <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground/85 mb-1.5">{title}</h3>
            <p className="text-sm text-muted-foreground/60 mb-4">{body}</p>
            {action}
        </div>
    );
}
