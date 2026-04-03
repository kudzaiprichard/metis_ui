'use client';

import { TOKENS } from '../lib/tokens';
import type { Patient, Treatment } from '../lib/types';

interface OutcomeRollupCardProps {
    patients: Patient[];
    treatments: Treatment[];
    open: boolean;
    onToggle: () => void;
}

export function OutcomeRollupCard({ patients, treatments, open, onToggle }: OutcomeRollupCardProps) {
    if (!open) {
        return (
            <button
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(8,15,12,0.97)',
                    border: `1px solid ${TOKENS.border2}`,
                    borderRadius: 5,
                    padding: '6px 12px',
                    fontSize: 12,
                    color: TOKENS.mid,
                    cursor: 'pointer',
                    fontFamily: TOKENS.fontMono,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                }}
            >
                ◈ rollup
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(8,15,12,0.97)',
                border: `1px solid ${TOKENS.border2}`,
                borderRadius: 5,
                width: 240,
                fontSize: 12,
                boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
            }}
        >
            <div
                style={{
                    padding: '8px 12px',
                    borderBottom: `1px solid ${TOKENS.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <span style={{ fontSize: 11, color: TOKENS.dim, fontFamily: TOKENS.fontMono, letterSpacing: 0.5 }}>
                    OUTCOME ROLLUP
                </span>
                <button
                    onClick={onToggle}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: TOKENS.mid,
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: 0,
                        lineHeight: 1,
                    }}
                    aria-label="Collapse rollup"
                >
                    −
                </button>
            </div>
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {treatments.map(tx => {
                    const pts = patients.filter(p => p.tx === tx.id);
                    const s = pts.filter(p => p.out === 'success').length;
                    const p2 = pts.filter(p => p.out === 'partial').length;
                    const f = pts.filter(p => p.out === 'failure').length;
                    const t = pts.length || 1;
                    const shortName = tx.name.replace(' Inh.', '').replace(' Ag.', '');
                    return (
                        <div key={tx.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: TOKENS.text, fontSize: 12 }}>{shortName}</span>
                                <span style={{ color: TOKENS.green, fontSize: 12, fontFamily: TOKENS.fontMono }}>
                                    {Math.round((s / t) * 100)}%
                                </span>
                            </div>
                            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', gap: 1 }}>
                                <div style={{ flex: s, background: TOKENS.green }} />
                                <div style={{ flex: p2, background: TOKENS.orange }} />
                                <div style={{ flex: f, background: TOKENS.red }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
