'use client';

import { TOKENS } from '../lib/tokens';

const ENTRIES: [string, string][] = [
    [TOKENS.green, '✓ Success'],
    [TOKENS.orange, '◐ Partial'],
    [TOKENS.red, '✕ Failure'],
    [TOKENS.teal, 'Treatment'],
];

export function FloatingLegend() {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 64,
                left: 14,
                background: 'rgba(7,14,11,0.95)',
                border: `1px solid ${TOKENS.border2}`,
                borderRadius: 5,
                padding: '6px 12px',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            }}
        >
            {ENTRIES.map(([c, l]) => (
                <span
                    key={l}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        fontFamily: TOKENS.fontMono,
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: c,
                            display: 'inline-block',
                        }}
                    />
                    <span style={{ color: TOKENS.mid }}>{l}</span>
                </span>
            ))}
        </div>
    );
}
