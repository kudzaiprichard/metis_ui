'use client';

import { Dialog, DialogContent, DialogTitle } from '@/src/components/shadcn/dialog';
import { OUT_COLOR, OUT_ICON, TOKENS } from '../lib/tokens';
import type { Patient, QueryPatient, QueryVitals, Treatment } from '../lib/types';

interface CompareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
    queryPatient: QueryPatient;
    queryVitals: QueryVitals;
    treatments: Treatment[];
}

/**
 * Side-by-side comparison of the active query patient vs a single candidate
 * patient from the graph. Triggered from the NodeInspector's "Compare"
 * button. Designed to read like a clinical chart: every clinical field is
 * shown on both sides with a signed delta where it makes sense.
 */
export function CompareDialog({
    open,
    onOpenChange,
    patient,
    queryPatient,
    queryVitals,
    treatments,
}: CompareDialogProps) {
    const treatment = treatments.find((t) => t.id === patient.tx);
    const treatmentName = treatment?.name ?? '—';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-[640px] p-0 border-[#1e3428] bg-[#0a1410] gap-0 overflow-hidden"
            >
                <DialogTitle className="sr-only">
                    Compare current patient with patient {patient.id}
                </DialogTitle>

                {/* Header */}
                <div
                    style={{
                        padding: '14px 18px',
                        borderBottom: `1px solid ${TOKENS.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                color: TOKENS.dim,
                                fontFamily: TOKENS.fontMono,
                                letterSpacing: 0.5,
                                marginBottom: 4,
                            }}
                        >
                            COMPARE CASES
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: TOKENS.text }}>
                            Current patient vs Patient {patient.id.slice(0, 8)}
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        style={{
                            background: 'transparent',
                            border: `1px solid ${TOKENS.border2}`,
                            borderRadius: 4,
                            color: TOKENS.mid,
                            cursor: 'pointer',
                            padding: '6px 10px',
                            fontSize: 13,
                            fontFamily: TOKENS.fontSans,
                        }}
                        aria-label="Close comparison"
                    >
                        ✕
                    </button>
                </div>

                {/* Twin headers — query vs candidate */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        borderBottom: `1px solid ${TOKENS.border}`,
                    }}
                >
                    <PatientHeader
                        accent={TOKENS.yellow}
                        label="CURRENT PATIENT"
                        title={queryPatient.id}
                        sub={queryPatient.dx}
                    />
                    <PatientHeader
                        accent={OUT_COLOR[patient.out]}
                        label="CANDIDATE"
                        title={`Patient ${patient.id.slice(0, 8)}`}
                        sub={`${OUT_ICON[patient.out]} ${patient.out.toUpperCase()} · ${patient.sim}% similar`}
                        leftBorder
                    />
                </div>

                {/* Comparison rows */}
                <div style={{ padding: '12px 18px 18px' }}>
                    <CompareSection title="DEMOGRAPHICS">
                        <CompareRow
                            label="Age"
                            left={queryVitals.age}
                            right={patient.age}
                            unit="yrs"
                            showDelta={false}
                        />
                        <CompareRow
                            label="Sex"
                            leftText={queryPatient.age.replace(/^\d+/, '')}
                            rightText={patient.sex}
                        />
                    </CompareSection>

                    <CompareSection title="CLINICAL">
                        <CompareRow
                            label="HbA1c"
                            left={queryVitals.hba1c}
                            right={patient.hba1c}
                            unit="%"
                            lowerIsBetter
                        />
                        <CompareRow
                            label="BMI"
                            left={queryVitals.bmi}
                            right={patient.bmi}
                            lowerIsBetter
                        />
                    </CompareSection>

                    <CompareSection title="TREATMENT & OUTCOME">
                        <CompareRow label="Treatment" leftText="—" rightText={treatmentName} />
                        <CompareRow
                            label="Outcome"
                            leftText="—"
                            rightText={patient.out.toUpperCase()}
                            rightColor={OUT_COLOR[patient.out]}
                        />
                        <CompareRow
                            label="HbA1c Δ"
                            leftText="—"
                            rightText={fmtSigned(patient.dHba1c, '%')}
                            rightColor={patient.dHba1c < 0 ? TOKENS.green : TOKENS.orange}
                        />
                        <CompareRow
                            label="Weight Δ"
                            leftText="—"
                            rightText={`${fmtSigned(patient.dBmi, '')} BMI`}
                            rightColor={patient.dBmi < 0 ? TOKENS.green : TOKENS.orange}
                        />
                        <CompareRow
                            label="Similarity"
                            leftText="—"
                            rightText={`${patient.sim}%`}
                            rightColor={TOKENS.green}
                        />
                    </CompareSection>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PatientHeader({
    accent,
    label,
    title,
    sub,
    leftBorder = false,
}: {
    accent: string;
    label: string;
    title: string;
    sub: string;
    leftBorder?: boolean;
}) {
    return (
        <div
            style={{
                padding: '14px 18px',
                borderLeft: leftBorder ? `1px solid ${TOKENS.border}` : undefined,
                background: `${accent}08`,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    color: accent,
                    fontFamily: TOKENS.fontMono,
                    letterSpacing: 0.5,
                    marginBottom: 5,
                }}
            >
                {label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.text, marginBottom: 2 }}>
                {title}
            </div>
            <div style={{ fontSize: 12, color: TOKENS.mid, fontFamily: TOKENS.fontMono }}>{sub}</div>
        </div>
    );
}

function CompareSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginTop: 14 }}>
            <div
                style={{
                    fontSize: 11,
                    color: TOKENS.dim,
                    fontFamily: TOKENS.fontMono,
                    letterSpacing: 0.5,
                    marginBottom: 8,
                }}
            >
                {title}
            </div>
            <div
                style={{
                    background: TOKENS.card,
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: 5,
                    overflow: 'hidden',
                }}
            >
                {children}
            </div>
        </div>
    );
}

interface CompareRowProps {
    label: string;
    /** Numeric left value — preferred over leftText when both make sense. */
    left?: number;
    right?: number;
    unit?: string;
    /** When set, both sides render as raw text instead of numbers. */
    leftText?: string;
    rightText?: string;
    /** Override right cell color (e.g. for outcome category). */
    rightColor?: string;
    /** Compute delta between left and right when both are numeric. */
    showDelta?: boolean;
    /** When true, a smaller right value is good (HbA1c, BMI). */
    lowerIsBetter?: boolean;
}

function CompareRow({
    label,
    left,
    right,
    unit = '',
    leftText,
    rightText,
    rightColor,
    showDelta = true,
    lowerIsBetter = false,
}: CompareRowProps) {
    const numericMode = typeof left === 'number' && typeof right === 'number';
    const delta = numericMode ? right - left : null;
    const deltaColor =
        delta == null || delta === 0
            ? TOKENS.mid
            : lowerIsBetter
            ? delta < 0
                ? TOKENS.green
                : TOKENS.orange
            : TOKENS.mid;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 1fr 80px',
                alignItems: 'center',
                padding: '10px 14px',
                borderBottom: `1px solid ${TOKENS.border}`,
                gap: 8,
            }}
        >
            <span style={{ fontSize: 12, color: TOKENS.dim }}>{label}</span>
            <span style={{ fontSize: 13, color: TOKENS.text, fontFamily: TOKENS.fontMono }}>
                {leftText ?? (numericMode ? `${left}${unit}` : '—')}
            </span>
            <span
                style={{
                    fontSize: 13,
                    color: rightColor ?? TOKENS.text,
                    fontFamily: TOKENS.fontMono,
                    fontWeight: rightColor ? 600 : 400,
                }}
            >
                {rightText ?? (numericMode ? `${right}${unit}` : '—')}
            </span>
            <span
                style={{
                    fontSize: 12,
                    color: deltaColor,
                    fontFamily: TOKENS.fontMono,
                    textAlign: 'right',
                }}
            >
                {showDelta && numericMode && delta !== null
                    ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}${unit}`
                    : ''}
            </span>
        </div>
    );
}

function fmtSigned(n: number, suffix: string): string {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(1)}${suffix}`;
}
