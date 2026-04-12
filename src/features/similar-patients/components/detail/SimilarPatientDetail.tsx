/**
 * SimilarPatientDetail — clinical case-file dashboard.
 *
 * Layout choice (deliberately distinct from the prediction page):
 *
 *   1. CaseFileHeader — flat 3-cell banner (outcome stamp · treatment ·
 *      patient archetype). Reads like a case folder cover sheet.
 *   2. TrajectoryRow — twin SVG line charts (HbA1c + BMI). The page's
 *      centrepiece, since "what happened over time" is the unique question
 *      this view answers.
 *   3. Three-act story grid — Patient · Treatment · Outcome columns of
 *      equal weight. No asymmetric sidebar; each act stands as a peer.
 *   4. Reference vitals & labs — wide footer band for the dense numerical
 *      detail that doesn't drive the narrative but is needed for review.
 */

'use client';

import Link from 'next/link';
import { ArrowLeft, CircleAlert, Loader2 } from 'lucide-react';

import { useSimilarPatientDetail } from '../../hooks/useSimilarPatients';
import { CaseFileHeader } from './widgets/CaseFileHeader';
import { ClinicalProfilePanel } from './widgets/ClinicalProfilePanel';
import { OutcomeStoryColumn } from './widgets/OutcomeStoryColumn';
import { PatientStoryColumn } from './widgets/PatientStoryColumn';
import { TrajectoryRow } from './widgets/TrajectoryRow';
import { TreatmentStoryColumn } from './widgets/TreatmentStoryColumn';

interface SimilarPatientDetailProps {
    caseId: string;
}

export function SimilarPatientDetail({ caseId }: SimilarPatientDetailProps) {
    const { data: patientCase, isLoading, error } = useSimilarPatientDetail(caseId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading case file…</span>
            </div>
        );
    }

    if (error || !patientCase) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <CircleAlert className="h-7 w-7 text-destructive" />
                <span>Error loading case file</span>
            </div>
        );
    }

    const subtitle = `Case ${patientCase.patientId.slice(0, 12)}…`;

    return (
        <div className="pb-24 space-y-5">
            <Link
                href="/doctor/similar-patients"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Similar Patients
            </Link>

            <header>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Case file
                </h1>
                <p className="text-base text-muted-foreground mt-1">{subtitle}</p>
            </header>

            {/* 1 — Cover sheet */}
            <CaseFileHeader patientCase={patientCase} />

            {/* 2 — What happened over time (page centrepiece) */}
            <TrajectoryRow patientCase={patientCase} />

            {/* 3 — Three-act story grid: Patient · Treatment · Outcome */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
                <PatientStoryColumn
                    demographics={patientCase.demographics}
                    categories={patientCase.clinicalCategories}
                    comorbidities={patientCase.comorbidities}
                />
                <TreatmentStoryColumn treatment={patientCase.treatment} />
                <OutcomeStoryColumn outcome={patientCase.outcome} />
            </div>

            {/* 4 — Dense reference data, parked at the bottom */}
            <ClinicalProfilePanel features={patientCase.clinicalFeatures} />
        </div>
    );
}
