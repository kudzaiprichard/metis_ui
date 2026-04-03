'use client';

import { TOKENS } from '../lib/tokens';

interface HintsPopoverProps {
    open: boolean;
    onClose: () => void;
}

const SHORTCUTS: [string, string][] = [
    ['Click node', 'Open inspector'],
    ['1–4 keys', 'Switch layout'],
    ['+ / −', 'Zoom in / out'],
    ['0', 'Fit to view'],
    ['Esc', 'Close inspector'],
    ['Scroll', 'Zoom at cursor'],
];

export function HintsPopover({ open, onClose }: HintsPopoverProps) {
    if (!open) return null;
    return (
        <div
            style={{
                position: 'absolute',
                top: 56,
                right: 12,
                background: TOKENS.surface,
                border: `1px solid ${TOKENS.border2}`,
                borderRadius: 5,
                padding: '14px 16px',
                width: 260,
                zIndex: 50,
                fontSize: 12,
                boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: TOKENS.dim, fontFamily: TOKENS.fontMono, letterSpacing: 0.5 }}>
                    KEYBOARD &amp; MOUSE
                </span>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: TOKENS.mid,
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: 0,
                        lineHeight: 1,
                    }}
                    aria-label="Close hints"
                >
                    ✕
                </button>
            </div>
            {SHORTCUTS.map(([k, d]) => (
                <div
                    key={k}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        alignItems: 'center',
                    }}
                >
                    <span
                        style={{
                            background: TOKENS.card,
                            border: `1px solid ${TOKENS.border}`,
                            borderRadius: 3,
                            padding: '3px 8px',
                            fontSize: 11,
                            color: TOKENS.text,
                            fontFamily: TOKENS.fontMono,
                        }}
                    >
                        {k}
                    </span>
                    <span style={{ fontSize: 12, color: TOKENS.mid }}>{d}</span>
                </div>
            ))}
        </div>
    );
}
