/**
 * PredictionResult — stacks the four result sections of a
 * PredictionWithExplanationResponse.
 *
 * Section order follows clinical reading flow: decision → safety →
 * patient context → fairness → explanation. Spec §5 "Module: Inference"
 * DTOs are rendered faithfully; see each panel for field mappings.
 */

'use client';

import { PredictionWithExplanationResponse } from '../../api/inference.types';
import { DecisionPanel } from './DecisionPanel';
import { SafetyPanel } from './SafetyPanel';
import { FairnessPanel } from './FairnessPanel';
import { ExplanationPanel } from './ExplanationPanel';
import { PatientSummary } from './PatientSummary';

interface PredictionResultProps {
    result: PredictionWithExplanationResponse;
}

export function PredictionResult({ result }: PredictionResultProps) {
    return (
        <div className="space-y-4">
            <DecisionPanel decision={result.decision} />
            <SafetyPanel safety={result.safety} recommendedTreatment={result.decision.recommendedTreatment} />
            <PatientSummary patient={result.patient} />
            <FairnessPanel fairness={result.fairness} />
            <ExplanationPanel explanation={result.explanation} />
        </div>
    );
}
