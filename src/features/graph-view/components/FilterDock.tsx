'use client';

import { TOKENS } from '../lib/tokens';
import type { OutcomeFilter, TopNFilter } from '../lib/types';

interface FilterDockProps {
    outcomeFilter: OutcomeFilter;
    onOutcomeChange: (f: OutcomeFilter) => void;
    topN: TopNFilter;
    onTopNChange: (n: TopNFilter) => void;
}

const OUTCOMES: [OutcomeFilter, string][] = [
    ['all', 'All'],
    ['success', '✓'],
    ['partial', '◐'],
    ['failure', '✕'],
];

const TOPS: TopNFilter[] = [5, 10, 20, 'all'];

export function FilterDock({ outcomeFilter, onOutcomeChange, topN, onTopNChange }: FilterDockProps) {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(7,14,11,0.97)',
                border: `1px solid ${TOKENS.border2}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
            }}
        >
            <span style={label('right')}>OUTCOME</span>
            {OUTCOMES.map(([v, l]) => {
                const active = outcomeFilter === v;
                return (
                    <button
                        key={v}
                        onClick={() => onOutcomeChange(v)}
                        style={chip(active, true)}
                    >
                        {l}
                    </button>
                );
            })}
            <span style={label('both')}>TOP N</span>
            {TOPS.map((n, i) => {
                const active = topN === n;
                return (
                    <button
                        key={String(n)}
                        onClick={() => onTopNChange(n)}
                        style={chip(active, i < TOPS.length - 1)}
                    >
                        {n}
                    </button>
                );
            })}
        </div>
    );
}

function label(side: 'right' | 'both'): React.CSSProperties {
    return {
        padding: '8px 12px',
        fontSize: 11,
        color: TOKENS.dim,
        fontFamily: TOKENS.fontMono,
        letterSpacing: 0.5,
        borderRight: `1px solid ${TOKENS.border}`,
        borderLeft: side === 'both' ? `1px solid ${TOKENS.border}` : undefined,
    };
}

function chip(active: boolean, withDivider: boolean): React.CSSProperties {
    return {
        padding: '8px 14px',
        background: active ? 'rgba(52,199,123,0.10)' : 'transparent',
        border: 'none',
        borderRight: withDivider ? `1px solid ${TOKENS.border}` : 'none',
        color: active ? TOKENS.green : TOKENS.mid,
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: TOKENS.fontMono,
        outline: 'none',
        minWidth: 36,
        textAlign: 'center',
    };
}
