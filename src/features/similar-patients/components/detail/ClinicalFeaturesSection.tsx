'use client';

import { Card } from '@/src/components/shadcn/card';
import { ClinicalFeatures, ClinicalCategories } from '../../api/similar-patients.types';
import {
    Tags,
    Weight,
    Droplet,
    HeartPulse,
    ChartLine,
    FlaskConical,
    Check,
    X,
} from 'lucide-react';

interface ClinicalFeaturesSectionProps {
    features: ClinicalFeatures;
    categories: ClinicalCategories;
}

export function ClinicalFeaturesSection({ features, categories }: ClinicalFeaturesSectionProps) {
    const categoryItems = [
        { icon: Weight, label: 'BMI Category', value: categories.bmi_category },
        { icon: Droplet, label: 'HbA1c Severity', value: categories.hba1c_severity },
        { icon: HeartPulse, label: 'Kidney Function', value: categories.kidney_function },
    ];

    const sections = [
        {
            title: 'Diabetes Profile',
            icon: ChartLine,
            fields: [
                { label: 'HbA1c Baseline', value: `${features.hba1c_baseline}%` },
                { label: 'Diabetes Duration', value: `${features.diabetes_duration} yrs` },
                { label: 'Fasting Glucose', value: `${features.fasting_glucose} mg/dL` },
                { label: 'C-Peptide', value: `${features.c_peptide} ng/mL` },
                {
                    label: 'Previous Prediabetes',
                    value: features.previous_prediabetes,
                    isBool: true,
                },
            ],
        },
        {
            title: 'Metabolic & Cardiovascular',
            icon: HeartPulse,
            fields: [
                { label: 'eGFR', value: `${features.egfr} mL/min/1.73m²` },
                { label: 'BMI', value: `${features.bmi} kg/m²` },
                { label: 'BP Systolic', value: `${features.bp_systolic} mmHg` },
                { label: 'BP Diastolic', value: `${features.bp_diastolic} mmHg` },
            ],
        },
        {
            title: 'Liver & Lipid Profile',
            icon: FlaskConical,
            fields: [
                { label: 'ALT', value: `${features.alt} U/L` },
                { label: 'LDL', value: `${features.ldl} mg/dL` },
                { label: 'HDL', value: `${features.hdl} mg/dL` },
                { label: 'Triglycerides', value: `${features.triglycerides} mg/dL` },
            ],
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            {/* Clinical Categories */}
            <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                    <Tags className="h-3.5 w-3.5" />
                    Clinical Categories
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {categoryItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-none">
                            <div className="w-10 h-10 rounded-none bg-primary/[0.12] border border-primary/20 flex items-center justify-center flex-shrink-0">
                                <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                    {item.label}
                                </span>
                                <span className="text-[13px] font-semibold text-foreground truncate">
                                    {item.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Data Sections */}
            {sections.map((section) => {
                const Icon = section.icon;
                return (
                    <Card key={section.title} className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                        <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            {section.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {section.fields.map((f) => (
                                <div key={f.label} className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                                        {f.label}
                                    </span>
                                    {'isBool' in f && f.isBool ? (
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[12px] font-semibold ${f.value ? 'bg-primary/[0.12] text-primary' : 'bg-white/[0.06] text-muted-foreground/60'}`}>
                                            {f.value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            {f.value ? 'Yes' : 'No'}
                                        </span>
                                    ) : (
                                        <span className="text-[13px] font-semibold text-foreground block">
                                            {f.value as string}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}