'use client';

import { useState } from 'react';
import { useSimilarPatientDetail } from '../../hooks/useSimilarPatients';
import { DetailHeader } from './DetailHeader';
import { DemographicsSection } from './DemographicsSection';
import { ClinicalFeaturesSection } from './ClinicalFeaturesSection';
import { TreatmentSection } from './TreatmentSection';
import { OutcomeSection } from './OutcomeSection';
import { Loader2, CircleAlert, User, ClipboardList, Pill, ChartLine } from 'lucide-react';

interface SimilarPatientDetailProps {
    caseId: string;
}

export type TabType = 'demographics' | 'clinical' | 'treatment' | 'outcome';

export function SimilarPatientDetail({ caseId }: SimilarPatientDetailProps) {
    const [activeTab, setActiveTab] = useState<TabType>('demographics');
    const { data: patientCase, isLoading, error } = useSimilarPatientDetail(caseId);

    const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: 'demographics', label: 'Demographics', icon: User },
        { id: 'clinical', label: 'Clinical Features', icon: ClipboardList },
        { id: 'treatment', label: 'Treatment', icon: Pill },
        { id: 'outcome', label: 'Outcome', icon: ChartLine },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading case details...</span>
            </div>
        );
    }

    if (error || !patientCase) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <CircleAlert className="h-7 w-7 text-red-500" />
                <span>Error loading case details</span>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto">
            <DetailHeader patientCase={patientCase} />

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white/[0.04] border border-white/10 rounded-none p-1 mb-5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-none text-[12px] font-semibold transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-primary/15 text-primary'
                                    : 'text-muted-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="mb-24">
                {activeTab === 'demographics' && (
                    <DemographicsSection demographics={patientCase.demographics} comorbidities={patientCase.comorbidities} />
                )}
                {activeTab === 'clinical' && (
                    <ClinicalFeaturesSection features={patientCase.clinical_features} categories={patientCase.clinical_categories} />
                )}
                {activeTab === 'treatment' && patientCase.treatment && (
                    <TreatmentSection treatment={patientCase.treatment} />
                )}
                {activeTab === 'outcome' && patientCase.outcome && (
                    <OutcomeSection outcome={patientCase.outcome} />
                )}
            </div>
        </div>
    );
}