'use client';

import { ArrowLeft } from 'lucide-react';
import { TOKENS } from '../lib/tokens';
import type { QueryPatient } from '../lib/types';

interface ContextStripProps {
    queryPatient: QueryPatient;
    filtersApplied: string[];
    similarityRange: { min: number; max: number };
    resultCount: number;
    loading?: boolean;
    /**
     * Optional. When provided, renders a back-arrow button at the top-left
     * that calls this on click. The graph view sets it to navigate back to
     * the Similar Patients search.
     */
    onBack?: () => void;
}

export function ContextStrip({
    queryPatient,
    filtersApplied,
    similarityRange,
    resultCount,
    loading = false,
    onBack,
}: ContextStripProps) {
    const range = Math.max(1, similarityRange.max - similarityRange.min);
    const fillPct = Math.min(100, range);
    const offsetPct = Math.max(0, similarityRange.min - 70) / 0.3;

    return (
        <div
            style={{
                background: '#060d0a',
                borderBottom: `1px solid #0f1a14`,
                padding: '0 14px',
                height: 42,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0,
                overflow: 'hidden',
            }}
        >
            {onBack && (
                <button
                    onClick={onBack}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        height: 28,
                        padding: '0 10px',
                        background: 'transparent',
                        border: `1px solid ${TOKENS.border2}`,
                        borderRadius: 4,
                        color: TOKENS.mid,
                        cursor: 'pointer',
                        fontFamily: TOKENS.fontSans,
                        fontSize: 12,
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(46,196,176,0.06)';
                        e.currentTarget.style.color = TOKENS.text;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = TOKENS.mid;
                    }}
                    aria-label="Back to Similar Patients"
                >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                </button>
            )}

            {onBack && <Divider />}

            <span style={mono(TOKENS.dim, 11)}>COMPARING</span>

            {loading ? (
                <div
                    style={{
                        background: TOKENS.card,
                        border: `1px solid ${TOKENS.border}`,
                        borderRadius: 3,
                        padding: '4px 10px',
                        width: 320,
                        height: 28,
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div className="gv-shimmer" />
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        background: TOKENS.card,
                        border: `1px solid ${TOKENS.border}`,
                        borderRadius: 3,
                        padding: '4px 10px',
                        flexShrink: 0,
                    }}
                >
                    <span style={{ fontSize: 12, fontWeight: 600, color: TOKENS.text }}>
                        Current Patient
                    </span>
                    <span style={mono(TOKENS.dim, 11)}>{queryPatient.id}</span>
                    {(
                        [
                            ['HbA1c', queryPatient.hba1c],
                            ['BMI', queryPatient.bmi],
                            ['Age', queryPatient.age],
                            ['Dx', queryPatient.dx],
                        ] as const
                    ).map(([k, v]) => (
                        <span key={k} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: TOKENS.dim }}>{k}</span>
                            <span style={mono(TOKENS.text, 11)}>{v}</span>
                        </span>
                    ))}
                </div>
            )}

            <Divider />

            <span style={mono(TOKENS.dim, 11)}>FILTERS</span>
            {filtersApplied.length === 0 ? (
                <span style={mono(TOKENS.muted, 11)}>none</span>
            ) : (
                filtersApplied.map(f => (
                    <span
                        key={f}
                        style={{
                            padding: '3px 8px',
                            borderRadius: 3,
                            background: TOKENS.card,
                            border: `1px solid ${TOKENS.border}`,
                            fontSize: 11,
                            color: TOKENS.mid,
                            fontFamily: TOKENS.fontMono,
                            flexShrink: 0,
                        }}
                    >
                        {f}
                    </span>
                ))
            )}

            <Divider />

            <span style={mono(TOKENS.dim, 11)}>SIMILARITY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={mono(TOKENS.dim, 11)}>{Math.round(similarityRange.min)}%</span>
                <div
                    style={{
                        width: 64,
                        height: 4,
                        background: TOKENS.border,
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            marginLeft: `${offsetPct}%`,
                            width: `${fillPct}%`,
                            height: '100%',
                            background: `linear-gradient(90deg,${TOKENS.border2},${TOKENS.green})`,
                            borderRadius: 2,
                        }}
                    />
                </div>
                <span style={mono(TOKENS.green, 11)}>{Math.round(similarityRange.max)}%</span>
            </div>

            <div style={{ flex: 1 }} />
            <span style={mono(TOKENS.mid, 11)}>{resultCount} results</span>

            <style jsx>{`
                .gv-shimmer {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(46, 196, 176, 0.08),
                        transparent
                    );
                    animation: gv-shimmer 1.4s linear infinite;
                }
                @keyframes gv-shimmer {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}

function Divider() {
    return (
        <div style={{ width: 1, height: 20, background: TOKENS.border, flexShrink: 0 }} />
    );
}

function mono(color: string, size: number): React.CSSProperties {
    return { fontSize: size, color, fontFamily: TOKENS.fontMono, flexShrink: 0 };
}
