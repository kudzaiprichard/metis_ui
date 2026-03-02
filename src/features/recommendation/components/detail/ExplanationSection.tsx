'use client';

import { useState } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { Button } from '@/src/components/shadcn/button';
import { PredictionExplanation } from '../../api/recommendations.types';
import {
    Lightbulb, Award, FileText, Flag, BarChart3, Brain,
    ArrowUp, ArrowDown, Minus, Ruler, Quote, CheckCircle, XCircle, GitBranch,
} from 'lucide-react';

interface ExplanationSectionProps {
    explanation: PredictionExplanation;
}

export function ExplanationSection({ explanation }: ExplanationSectionProps) {
    const [activeTab, setActiveTab] = useState<'features' | 'reasoning'>('features');

    const sortedFeatures = [...explanation.features].sort((a, b) => a.rank - b.rank);

    const getFeatureImpact = (shapValue: string) => {
        const v = parseFloat(shapValue);
        if (v > 0) return { label: 'Positive', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: ArrowUp };
        if (v < 0) return { label: 'Negative', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: ArrowDown };
        return { label: 'Neutral', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: Minus };
    };

    const getConfidenceColor = () => {
        const level = explanation.confidence_level.toLowerCase();
        if (level === 'high') return 'text-emerald-400 border-emerald-400/30';
        if (level === 'medium') return 'text-blue-400 border-blue-400/30';
        return 'text-amber-400 border-amber-400/30';
    };

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none p-5 mb-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2.5">
                    <Lightbulb className="h-4.5 w-4.5 text-primary" />
                    Clinical Explanation
                </h2>
                <Badge
                    variant="secondary"
                    className={`rounded-none text-[12px] font-semibold px-3 py-1 bg-white/5 border ${getConfidenceColor()}`}
                >
                    <Award className="h-3 w-3 mr-1.5" />
                    {explanation.confidence_level} Confidence
                </Badge>
            </div>

            {/* Summary */}
            <div className="mb-5">
                <div className="flex gap-3 p-4 bg-blue-400/[0.08] border border-blue-400/15 rounded-none mb-3">
                    <FileText className="h-4.5 w-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[14px] text-foreground/90 leading-relaxed">{explanation.summary_text}</p>
                </div>
                <Badge
                    variant="secondary"
                    className="rounded-none text-[12px] font-semibold px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400"
                >
                    <Flag className="h-3 w-3 mr-1.5" />
                    Priority: {explanation.clinical_priority}
                </Badge>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-none mb-5">
                {([
                    { key: 'features' as const, label: `Key Features (${sortedFeatures.length})`, icon: BarChart3 },
                    { key: 'reasoning' as const, label: 'Clinical Reasoning', icon: Brain },
                ]).map((tab) => (
                    <Button
                        key={tab.key}
                        variant="ghost"
                        className={`flex-1 rounded-none h-9 text-[13px] font-medium gap-2 ${
                            activeTab === tab.key
                                ? 'bg-primary/15 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Features Tab */}
            {activeTab === 'features' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sortedFeatures.map((feature) => {
                        const impact = getFeatureImpact(feature.shap_value);
                        return (
                            <div key={feature.id} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-none hover:bg-white/[0.05] transition-colors">
                                {/* Feature Header */}
                                <div className="flex items-center gap-2.5 mb-3">
                                    <Badge variant="secondary" className="rounded-none w-7 h-7 flex items-center justify-center text-[12px] font-bold p-0 bg-primary/15 border-primary/20 text-primary">
                                        #{feature.rank}
                                    </Badge>
                                    <span className="text-[14px] font-semibold text-foreground flex-1">{feature.feature_name}</span>
                                    <Badge variant="secondary" className={`rounded-none text-[10px] font-semibold px-2 py-0.5 border ${impact.bg} ${impact.color}`}>
                                        <impact.icon className="h-2.5 w-2.5 mr-1" />
                                        {impact.label}
                                    </Badge>
                                </div>

                                {/* Values */}
                                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                                    <div className="flex flex-col gap-1 p-2 bg-white/[0.02] rounded-none">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Patient Value</span>
                                        <span className="text-[14px] font-bold text-foreground">{parseFloat(feature.raw_value).toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 p-2 bg-white/[0.02] rounded-none">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">SHAP Impact</span>
                                        <span className={`text-[14px] font-bold ${impact.color}`}>{parseFloat(feature.shap_value).toFixed(4)}</span>
                                    </div>
                                </div>

                                {/* Reference Range */}
                                {feature.reference_range && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/[0.08] border border-purple-500/15 rounded-none text-[11px] text-purple-400 mb-2.5">
                                        <Ruler className="h-2.5 w-2.5" />
                                        Reference: {feature.reference_range}
                                    </div>
                                )}

                                {/* Interpretation */}
                                <div className="flex gap-2.5 p-2.5 bg-white/[0.02] border-l-[3px] border-l-primary rounded-none">
                                    <Quote className="h-2.5 w-2.5 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">{feature.interpretation}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reasoning Tab */}
            {activeTab === 'reasoning' && (
                <div className="flex flex-col gap-4">
                    {[
                        { title: 'Why This Treatment?', text: explanation.why_this_treatment, icon: CheckCircle },
                        { title: 'Why Not Alternatives?', text: explanation.why_not_alternatives, icon: XCircle },
                        ...(explanation.feature_interactions
                            ? [{ title: 'Feature Interactions', text: explanation.feature_interactions, icon: GitBranch }]
                            : []),
                    ].map((box) => (
                        <div key={box.title} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-none">
                            <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-2.5">
                                <box.icon className="h-3.5 w-3.5 text-primary" />
                                {box.title}
                            </h3>
                            <p className="text-[13px] text-muted-foreground leading-relaxed">{box.text}</p>
                        </div>
                    ))}

                    {/* Model Values */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-primary/[0.06] border border-primary/10 rounded-none">
                        {[
                            { label: 'Base Value', value: parseFloat(explanation.base_value).toFixed(4) },
                            { label: 'Prediction Value', value: parseFloat(explanation.prediction_value).toFixed(4) },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col gap-1.5">
                                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</span>
                                <span className="text-[16px] font-bold text-primary">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}