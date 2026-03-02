'use client';

import { Card } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { SafetyWarning } from '../../api/recommendations.types';
import {
    ShieldAlert, AlertTriangle, CircleAlert, Info,
    UserCheck, HandHeart, Lightbulb,
} from 'lucide-react';

interface SafetyWarningsSectionProps {
    warnings: SafetyWarning[];
}

export function SafetyWarningsSection({ warnings }: SafetyWarningsSectionProps) {
    const getSeverityConfig = (severity: string) => {
        const level = severity.toLowerCase();
        if (level === 'high' || level === 'critical') {
            return { bg: 'bg-red-500/[0.08]', border: 'border-red-500/20', color: 'text-red-500', icon: CircleAlert };
        }
        if (level === 'medium' || level === 'moderate') {
            return { bg: 'bg-amber-400/[0.08]', border: 'border-amber-400/20', color: 'text-amber-400', icon: AlertTriangle };
        }
        return { bg: 'bg-blue-400/[0.08]', border: 'border-blue-400/20', color: 'text-blue-400', icon: Info };
    };

    const sortedWarnings = [...warnings].sort((a, b) => {
        const order: Record<string, number> = { high: 0, critical: 0, medium: 1, moderate: 1, low: 2, info: 2 };
        return (order[a.severity.toLowerCase()] ?? 2) - (order[b.severity.toLowerCase()] ?? 2);
    });

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none p-5 mb-5">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-amber-400" />
                    Safety Warnings & Considerations
                </h2>
                <Badge
                    variant="secondary"
                    className="rounded-none text-[12px] font-semibold px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400"
                >
                    <AlertTriangle className="h-3 w-3 mr-1.5" />
                    {warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}
                </Badge>
            </div>

            <div className="flex flex-col gap-4">
                {sortedWarnings.map((warning) => {
                    const config = getSeverityConfig(warning.severity);
                    const SeverityIcon = config.icon;

                    return (
                        <div
                            key={warning.id}
                            className={`p-4.5 rounded-none border transition-colors hover:-translate-y-0.5 ${config.bg} ${config.border}`}
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4 pb-3.5 border-b border-white/[0.08]">
                                <Badge
                                    variant="secondary"
                                    className={`rounded-none text-[11px] font-bold uppercase tracking-wider px-3 py-1 border ${config.bg} ${config.border} ${config.color}`}
                                >
                                    <SeverityIcon className="h-3 w-3 mr-1.5" />
                                    {warning.severity}
                                </Badge>
                                <span className={`text-[15px] font-semibold flex-1 ${config.color}`}>
                                    {warning.concern}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col gap-3.5">
                                {[
                                    { label: 'Patient Factor', text: warning.patient_factor, icon: UserCheck },
                                    { label: 'Mitigation Strategy', text: warning.mitigation, icon: HandHeart },
                                    ...(warning.reason ? [{ label: 'Clinical Reasoning', text: warning.reason, icon: Lightbulb }] : []),
                                ].map((detail) => (
                                    <div key={detail.label} className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                                            <detail.icon className="h-3 w-3 text-muted-foreground/60" />
                                            {detail.label}
                                        </div>
                                        <p className="text-[13px] text-foreground/85 leading-relaxed pl-[18px]">
                                            {detail.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}