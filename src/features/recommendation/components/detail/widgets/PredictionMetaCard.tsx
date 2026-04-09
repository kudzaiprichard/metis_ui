'use client';

import { Calendar, FileText, IdCard, RefreshCw } from 'lucide-react';

import type { PredictionResponse } from '../../../api/recommendations.types';

interface PredictionMetaCardProps {
    prediction: PredictionResponse;
}

const formatDateTime = (iso: string) => {
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch {
        return iso;
    }
};

export function PredictionMetaCard({ prediction }: PredictionMetaCardProps) {
    return (
        <section
            aria-labelledby="meta-heading"
            className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4"
        >
            <header className="flex items-center gap-2 mb-3">
                <IdCard className="h-3.5 w-3.5 text-primary" />
                <h3
                    id="meta-heading"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    Record metadata
                </h3>
            </header>

            <dl className="flex flex-col gap-3">
                <Field label="Prediction ID" icon={IdCard} value={prediction.id} mono />
                <Field label="Patient" icon={IdCard} value={prediction.patientId} mono />
                <Field
                    label="Medical record"
                    icon={FileText}
                    value={prediction.medicalRecordId}
                    mono
                />
                <Field
                    label="Created"
                    icon={Calendar}
                    value={formatDateTime(prediction.createdAt)}
                />
                <Field
                    label="Updated"
                    icon={RefreshCw}
                    value={formatDateTime(prediction.updatedAt)}
                />
            </dl>
        </section>
    );
}

function Field({
    label,
    icon: Icon,
    value,
    mono,
}: {
    label: string;
    icon: typeof IdCard;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                <Icon className="h-3 w-3" />
                {label}
            </dt>
            <dd
                className={`text-sm text-foreground break-all ${
                    mono ? 'font-mono text-xs' : ''
                }`}
            >
                {value}
            </dd>
        </div>
    );
}
