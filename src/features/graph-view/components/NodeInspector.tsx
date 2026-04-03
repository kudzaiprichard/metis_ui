'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OUT_COLOR, OUT_ICON, TOKENS } from '../lib/tokens';
import type { LayoutType, Patient, QueryPatient, QueryVitals, SelectedNode, Treatment } from '../lib/types';
import { CompareDialog } from './CompareDialog';

interface NodeInspectorProps {
    node: SelectedNode | null;
    layout: LayoutType;
    treatments: Treatment[];
    queryPatient: QueryPatient;
    queryVitals: QueryVitals;
    onClose: () => void;
    onSelectPatient: (p: Patient) => void;
}

export function NodeInspector({
    node,
    layout,
    treatments,
    queryPatient,
    queryVitals,
    onClose,
    onSelectPatient,
}: NodeInspectorProps) {
    const router = useRouter();
    const [compareOpen, setCompareOpen] = useState(false);

    if (!node) return null;

    const isPt = node.kind === 'patient';
    const tx = treatments.find((t) => t.id === (isPt ? node.tx : node.id));

    const handleOpenCase = () => {
        if (!isPt) return;
        // Patient node id == case_id == backend patient_id; the existing
        // similar-patient detail page consumes it directly.
        router.push(`/doctor/similar-patients/${node.id}`);
    };

    return (
        <>
            <div
                // `key` rebinds the element each time selection changes, replaying
                // the slide-in animation when the user clicks a different node.
                key={node.id}
                style={{
                    width: 340,
                    background: '#080f0c',
                    borderLeft: `1px solid ${TOKENS.border2}`,
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    overflow: 'hidden',
                    animation: 'gv-inspector-in 200ms ease forwards',
                }}
            >
                <div
                    style={{
                        padding: '14px 18px',
                        borderBottom: `1px solid ${TOKENS.border}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 10,
                    }}
                >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <div
                                style={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: '50%',
                                    background: isPt ? OUT_COLOR[node.out] : TOKENS.teal,
                                    flexShrink: 0,
                                }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.text }}>
                                {isPt ? `Patient ${node.id.slice(0, 8)}` : node.name}
                            </span>
                            {isPt ? (
                                <Badge color={OUT_COLOR[node.out]} text={node.out.toUpperCase()} />
                            ) : (
                                <Badge color={TOKENS.teal} text="TREATMENT" bg="#0d2a25" border="#1e4a40" />
                            )}
                        </div>
                        {isPt && (
                            <div style={{ fontSize: 12, color: TOKENS.dim, fontFamily: TOKENS.fontMono }}>
                                {node.id.slice(0, 12)}… · {node.sim}% similar
                            </div>
                        )}
                        {!isPt && (
                            <div style={{ fontSize: 12, color: TOKENS.dim, fontFamily: TOKENS.fontMono }}>
                                {node.patients.length} patients · {Math.round(node.rate * 100)}% success
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: `1px solid ${TOKENS.border2}`,
                            borderRadius: 4,
                            color: TOKENS.mid,
                            cursor: 'pointer',
                            padding: '4px 9px',
                            fontSize: 13,
                            flexShrink: 0,
                            lineHeight: 1,
                        }}
                        aria-label="Close inspector"
                    >
                        ✕
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px' }}>
                    {isPt ? (
                        <PatientDetail node={node} treatmentName={tx?.name} queryVitals={queryVitals} />
                    ) : (
                        <TreatmentDetail
                            patients={node.patients}
                            layout={layout}
                            queryPatient={queryPatient}
                            queryVitals={queryVitals}
                            onSelectPatient={onSelectPatient}
                        />
                    )}
                </div>

                {isPt && (
                    <div
                        style={{
                            padding: '12px 18px',
                            borderTop: `1px solid ${TOKENS.border}`,
                            display: 'flex',
                            gap: 8,
                        }}
                    >
                        <button onClick={() => setCompareOpen(true)} style={ctaSecondary}>
                            Compare
                        </button>
                        <button onClick={handleOpenCase} style={ctaPrimary}>
                            Open case →
                        </button>
                    </div>
                )}
            </div>

            {isPt && (
                <CompareDialog
                    open={compareOpen}
                    onOpenChange={setCompareOpen}
                    patient={node}
                    queryPatient={queryPatient}
                    queryVitals={queryVitals}
                    treatments={treatments}
                />
            )}
        </>
    );
}

function PatientDetail({
    node,
    treatmentName,
    queryVitals,
}: {
    node: Patient;
    treatmentName?: string;
    queryVitals: QueryVitals;
}) {
    return (
        <>
            <Section label="PROFILE">
                <Grid
                    rows={[
                        ['Age', `${node.age} yrs`],
                        ['Sex', node.sex],
                        ['HbA1c', `${node.hba1c}%`, true],
                        ['BMI', String(node.bmi)],
                    ]}
                />
            </Section>
            <Section label="TREATMENT">
                <div
                    style={{
                        background: TOKENS.card,
                        border: `1px solid ${TOKENS.border}`,
                        borderRadius: 4,
                        padding: '10px 12px',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.teal }}>
                            {treatmentName ?? '—'}
                        </span>
                        <span style={{ fontSize: 12, color: TOKENS.dim, fontFamily: TOKENS.fontMono }}>
                            {node.sim}% sim
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, height: 5 }}>
                        <div style={{ flex: 1, background: TOKENS.border, borderRadius: 2 }}>
                            <div
                                style={{
                                    width: `${node.sim}%`,
                                    height: '100%',
                                    background: TOKENS.green,
                                    borderRadius: 2,
                                    opacity: 0.7,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Section>
            <Section label="OUTCOMES">
                <KV label="HbA1c Δ" value={fmtSigned(node.dHba1c, '%')} positive={node.dHba1c < 0} />
                <KV
                    label="Weight Δ"
                    value={`${fmtSigned(node.dBmi, '')} BMI`}
                    positive={node.dBmi < 0}
                />
            </Section>
            <Section label="VS CURRENT PATIENT">
                <div
                    style={{
                        background: TOKENS.card,
                        border: `1px solid ${TOKENS.border}`,
                        borderRadius: 4,
                        padding: '10px 12px',
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 1fr 1fr',
                            gap: 4,
                            marginBottom: 8,
                        }}
                    >
                        {['', 'this', 'current', 'Δ'].map((h, i) => (
                            <span
                                key={i}
                                style={{
                                    fontSize: 11,
                                    color: TOKENS.dim,
                                    fontFamily: TOKENS.fontMono,
                                }}
                            >
                                {h}
                            </span>
                        ))}
                    </div>
                    {(
                        [
                            [
                                'HbA1c',
                                `${node.hba1c}%`,
                                `${queryVitals.hba1c}%`,
                                `${(node.hba1c - queryVitals.hba1c).toFixed(1)}%`,
                                node.hba1c < queryVitals.hba1c,
                            ],
                            [
                                'BMI',
                                `${node.bmi}`,
                                `${queryVitals.bmi}`,
                                `${(node.bmi - queryVitals.bmi).toFixed(1)}`,
                                node.bmi < queryVitals.bmi,
                            ],
                            [
                                'Age',
                                `${node.age}`,
                                `${queryVitals.age}`,
                                '—',
                                true,
                            ],
                        ] as const
                    ).map(([l, a, b, d, pos]) => (
                        <div
                            key={l}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '60px 1fr 1fr 1fr',
                                marginBottom: 4,
                                gap: 4,
                            }}
                        >
                            <span style={{ fontSize: 12, color: TOKENS.mid }}>{l}</span>
                            <span style={{ fontSize: 12, color: TOKENS.text, fontFamily: TOKENS.fontMono }}>{a}</span>
                            <span style={{ fontSize: 12, color: TOKENS.dim, fontFamily: TOKENS.fontMono }}>{b}</span>
                            <span
                                style={{
                                    fontSize: 12,
                                    color:
                                        d === '—'
                                            ? TOKENS.muted
                                            : pos
                                            ? TOKENS.green
                                            : TOKENS.orange,
                                    fontFamily: TOKENS.fontMono,
                                }}
                            >
                                {d}
                            </span>
                        </div>
                    ))}
                </div>
            </Section>
        </>
    );
}

function TreatmentDetail({
    patients,
    layout,
    queryPatient,
    queryVitals,
    onSelectPatient,
}: {
    patients: Patient[];
    layout: LayoutType;
    queryPatient: QueryPatient;
    queryVitals: QueryVitals;
    onSelectPatient: (p: Patient) => void;
}) {
    const t = patients.length || 1;
    const success = patients.filter(p => p.out === 'success').length;
    const partial = patients.filter(p => p.out === 'partial').length;
    const failure = patients.filter(p => p.out === 'failure').length;

    return (
        <>
            <Section label="OUTCOME BREAKDOWN">
                <div style={{ marginTop: 4 }}>
                    <div
                        style={{
                            display: 'flex',
                            height: 10,
                            borderRadius: 3,
                            overflow: 'hidden',
                            gap: 1,
                            marginBottom: 10,
                        }}
                    >
                        <div style={{ flex: success, background: TOKENS.green }} />
                        <div style={{ flex: partial, background: TOKENS.orange }} />
                        <div style={{ flex: failure, background: TOKENS.red }} />
                    </div>
                    {(
                        [
                            ['✓ Success', success, TOKENS.green],
                            ['◐ Partial', partial, TOKENS.orange],
                            ['✕ Failure', failure, TOKENS.red],
                        ] as const
                    ).map(([l, v, c]) => (
                        <div
                            key={l}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 5,
                            }}
                        >
                            <span style={{ fontSize: 13, color: TOKENS.mid }}>{l}</span>
                            <span style={{ fontSize: 13, color: c, fontFamily: TOKENS.fontMono, fontWeight: 500 }}>
                                {v} ({Math.round((v / t) * 100)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </Section>
            <Section label="AVERAGE OUTCOMES">
                {(
                    [
                        ['Avg HbA1c Δ', avg(patients.map(p => p.dHba1c)), '%'],
                        ['Avg BMI Δ', avg(patients.map(p => p.dBmi)), ''],
                    ] as const
                ).map(([l, v, suffix]) => (
                    <KV key={l} label={l} value={fmtSigned(v, suffix)} positive={v < 0} />
                ))}
            </Section>
            {layout === 'cluster' && patients.length > 0 && (
                <ClusterAnalysis
                    patients={patients}
                    queryPatient={queryPatient}
                    queryVitals={queryVitals}
                />
            )}
            <Section label={`PATIENTS (${patients.length})`}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                    {patients.map(p => (
                        <button
                            key={p.id}
                            onClick={() => onSelectPatient(p)}
                            style={{
                                padding: '4px 9px',
                                borderRadius: 3,
                                border: `1px solid ${OUT_COLOR[p.out]}40`,
                                background: `${OUT_COLOR[p.out]}15`,
                                fontSize: 11,
                                color: OUT_COLOR[p.out],
                                fontFamily: TOKENS.fontMono,
                                cursor: 'pointer',
                            }}
                        >
                            {p.id.slice(0, 6)} {OUT_ICON[p.out]}
                        </button>
                    ))}
                </div>
            </Section>
        </>
    );
}

/**
 * Cluster-only analysis section. Renders only when the user is on the
 * cluster layout, where the visual implies "this is a cohort" and the
 * inspector should answer cohort-level questions, not just per-patient ones.
 *
 * Three sub-blocks:
 *   1. Centroid — mean profile of the cohort vs the query patient
 *   2. Top comorbidities — most common conditions in this cohort
 *   3. Outcome range — min/max of HbA1c Δ + BMI Δ across patients
 */
function ClusterAnalysis({
    patients,
    queryPatient,
    queryVitals,
}: {
    patients: Patient[];
    queryPatient: QueryPatient;
    queryVitals: QueryVitals;
}) {
    const n = patients.length;

    // — Centroid —
    const meanAge = avg(patients.map(p => p.age));
    const meanHba1c = avg(patients.map(p => p.hba1c));
    const meanBmi = avg(patients.map(p => p.bmi));
    const fCount = patients.filter(p => p.sex === 'F').length;
    const mCount = n - fCount;
    // queryPatient.age is "49F" — pull the gender char off the end.
    const querySex = queryPatient.age.replace(/^\d+/, '') || '—';

    // — Comorbidity overlap —
    const counts = new Map<string, number>();
    patients.forEach(p =>
        p.comorbidities.forEach(c => counts.set(c, (counts.get(c) ?? 0) + 1)),
    );
    const topComorb = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // — Outcome range —
    const hba1cDeltas = patients.map(p => p.dHba1c);
    const bmiDeltas = patients.map(p => p.dBmi);
    const hMin = Math.min(...hba1cDeltas);
    const hMax = Math.max(...hba1cDeltas);
    const bMin = Math.min(...bmiDeltas);
    const bMax = Math.max(...bmiDeltas);

    return (
        <Section label="CLUSTER ANALYSIS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Cohort centroid vs query */}
                <div style={clusterCard}>
                    <div style={cardLabel}>COHORT CENTROID (n={n})</div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 1fr 1fr',
                            gap: 4,
                            marginBottom: 6,
                        }}
                    >
                        {['', 'cohort', 'query', 'Δ'].map((h, i) => (
                            <span
                                key={i}
                                style={{
                                    fontSize: 11,
                                    color: TOKENS.dim,
                                    fontFamily: TOKENS.fontMono,
                                }}
                            >
                                {h}
                            </span>
                        ))}
                    </div>
                    <CentroidRow
                        label="Age"
                        cohort={`${meanAge.toFixed(0)}`}
                        query={queryVitals.age != null ? `${queryVitals.age}` : '—'}
                        delta={
                            queryVitals.age != null
                                ? meanAge - queryVitals.age
                                : null
                        }
                        deltaSuffix=""
                    />
                    <CentroidRow
                        label="Sex"
                        cohort={`${fCount}F / ${mCount}M`}
                        query={querySex}
                        delta={null}
                    />
                    <CentroidRow
                        label="HbA1c"
                        cohort={`${meanHba1c.toFixed(1)}%`}
                        query={queryVitals.hba1c != null ? `${queryVitals.hba1c}%` : '—'}
                        delta={
                            queryVitals.hba1c != null
                                ? meanHba1c - queryVitals.hba1c
                                : null
                        }
                        deltaSuffix="%"
                        lowerIsBetter
                    />
                    <CentroidRow
                        label="BMI"
                        cohort={`${meanBmi.toFixed(1)}`}
                        query={queryVitals.bmi != null ? `${queryVitals.bmi}` : '—'}
                        delta={
                            queryVitals.bmi != null ? meanBmi - queryVitals.bmi : null
                        }
                        deltaSuffix=""
                        lowerIsBetter
                    />
                </div>

                {/* Top comorbidities */}
                <div style={clusterCard}>
                    <div style={cardLabel}>TOP COMORBIDITIES</div>
                    {topComorb.length === 0 ? (
                        <div style={{ fontSize: 12, color: TOKENS.muted }}>
                            None reported across cohort
                        </div>
                    ) : (
                        topComorb.map(([name, count]) => {
                            const pct = Math.round((count / n) * 100);
                            return (
                                <div
                                    key={name}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '3px 0',
                                        borderBottom: `1px solid #0f1a14`,
                                        gap: 8,
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: TOKENS.text }}>{name}</span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: TOKENS.mid,
                                            fontFamily: TOKENS.fontMono,
                                        }}
                                    >
                                        {count}/{n} · {pct}%
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Outcome dispersion */}
                <div style={clusterCard}>
                    <div style={cardLabel}>OUTCOME RANGE</div>
                    <RangeRow label="HbA1c Δ" min={hMin} max={hMax} suffix="%" />
                    <RangeRow label="BMI Δ" min={bMin} max={bMax} suffix="" />
                </div>
            </div>
        </Section>
    );
}

function CentroidRow({
    label,
    cohort,
    query,
    delta,
    deltaSuffix = '',
    lowerIsBetter = false,
}: {
    label: string;
    cohort: string;
    query: string;
    delta: number | null;
    deltaSuffix?: string;
    lowerIsBetter?: boolean;
}) {
    const deltaText =
        delta == null || isNaN(delta)
            ? '—'
            : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}${deltaSuffix}`;
    const deltaColor =
        delta == null || delta === 0
            ? TOKENS.muted
            : lowerIsBetter
              ? delta < 0
                  ? TOKENS.green
                  : TOKENS.orange
              : TOKENS.muted;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 1fr 1fr',
                marginBottom: 4,
                gap: 4,
            }}
        >
            <span style={{ fontSize: 12, color: TOKENS.mid }}>{label}</span>
            <span style={{ fontSize: 12, color: TOKENS.text, fontFamily: TOKENS.fontMono }}>
                {cohort}
            </span>
            <span style={{ fontSize: 12, color: TOKENS.dim, fontFamily: TOKENS.fontMono }}>
                {query}
            </span>
            <span style={{ fontSize: 12, color: deltaColor, fontFamily: TOKENS.fontMono }}>
                {deltaText}
            </span>
        </div>
    );
}

function RangeRow({
    label,
    min,
    max,
    suffix,
}: {
    label: string;
    min: number;
    max: number;
    suffix: string;
}) {
    const minText = `${min > 0 ? '+' : ''}${min.toFixed(1)}${suffix}`;
    const maxText = `${max > 0 ? '+' : ''}${max.toFixed(1)}${suffix}`;
    const tightRange = Math.abs(max - min) < 0.1;
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: `1px solid #0f1a14`,
                gap: 8,
            }}
        >
            <span style={{ fontSize: 12, color: TOKENS.mid }}>{label}</span>
            <span style={{ fontSize: 12, color: TOKENS.text, fontFamily: TOKENS.fontMono }}>
                {tightRange ? minText : `${minText} → ${maxText}`}
            </span>
        </div>
    );
}

const clusterCard: React.CSSProperties = {
    background: TOKENS.card,
    border: `1px solid ${TOKENS.border}`,
    borderRadius: 4,
    padding: '10px 12px',
};

const cardLabel: React.CSSProperties = {
    fontSize: 10,
    color: TOKENS.dim,
    fontFamily: TOKENS.fontMono,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div
                style={{
                    fontSize: 11,
                    color: TOKENS.dim,
                    fontFamily: TOKENS.fontMono,
                    letterSpacing: 0.5,
                    marginBottom: 6,
                    marginTop: 4,
                }}
            >
                {label}
            </div>
            {children}
        </div>
    );
}

function Grid({ rows }: { rows: ([string, string] | [string, string, boolean])[] }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {rows.map(([l, v, hl]) => (
                <div
                    key={l}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: `1px solid #0f1a14`,
                    }}
                >
                    <span style={{ fontSize: 13, color: TOKENS.mid }}>{l}</span>
                    <span
                        style={{
                            fontSize: 13,
                            color: hl ? TOKENS.yellow : TOKENS.text,
                            fontWeight: hl ? 600 : 500,
                            fontFamily: TOKENS.fontMono,
                        }}
                    >
                        {v}
                    </span>
                </div>
            ))}
        </div>
    );
}

function KV({ label, value, positive }: { label: string; value: string; positive: boolean }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: `1px solid #0f1a14`,
            }}
        >
            <span style={{ fontSize: 13, color: TOKENS.mid }}>{label}</span>
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: positive ? TOKENS.green : TOKENS.orange,
                    fontFamily: TOKENS.fontMono,
                }}
            >
                {value}
            </span>
        </div>
    );
}

function Badge({
    color,
    text,
    bg,
    border,
}: {
    color: string;
    text: string;
    bg?: string;
    border?: string;
}) {
    return (
        <span
            style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 3,
                background: bg ?? `${color}20`,
                color,
                fontFamily: TOKENS.fontMono,
                fontWeight: 600,
                letterSpacing: 0.3,
                border: `1px solid ${border ?? `${color}40`}`,
            }}
        >
            {text}
        </span>
    );
}

function fmtSigned(n: number, suffix: string): string {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(1)}${suffix}`;
}

function avg(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((s, v) => s + v, 0) / values.length;
}

const ctaSecondary: React.CSSProperties = {
    flex: 1,
    padding: '9px 0',
    background: 'transparent',
    border: `1px solid ${TOKENS.border2}`,
    borderRadius: 4,
    fontSize: 13,
    color: TOKENS.mid,
    textAlign: 'center',
    cursor: 'pointer',
    fontFamily: TOKENS.fontSans,
    fontWeight: 500,
};

const ctaPrimary: React.CSSProperties = {
    flex: 1,
    padding: '9px 0',
    background: 'rgba(52,199,123,0.10)',
    border: `1px solid rgba(52,199,123,0.30)`,
    borderRadius: 4,
    fontSize: 13,
    color: TOKENS.green,
    textAlign: 'center',
    cursor: 'pointer',
    fontFamily: TOKENS.fontSans,
    fontWeight: 600,
};
