'use client';

import { TOKENS } from '../lib/tokens';
import type { LayoutType } from '../lib/types';

interface Stats {
    total: number;
    success: number;
    partial: number;
    failure: number;
}

interface GraphControlsProps {
    layout: LayoutType;
    onLayoutChange: (l: LayoutType) => void;
    zoom: number;
    onZoomChange: (z: number) => void;
    onFit: () => void;
    stats: Stats;
    hintsOpen: boolean;
    onHintsToggle: () => void;
    onExport?: () => void;
}

const LAYOUTS: { id: LayoutType; icon: string; label: string; tip: string }[] = [
    { id: 'force',   icon: '⊕', label: 'Force',   tip: 'All connections, free-arranged' },
    { id: 'tree',    icon: '⊤', label: 'Tree',    tip: 'Grouped by treatment, sorted by success' },
    { id: 'cluster', icon: '◎', label: 'Cluster', tip: 'Treatment clusters, radial' },
    { id: 'outcome', icon: '◆', label: 'Outcome', tip: 'Sorted into Success / Partial / Failure' },
];

export function GraphControls({
    layout,
    onLayoutChange,
    zoom,
    onZoomChange,
    onFit,
    stats,
    hintsOpen,
    onHintsToggle,
    onExport,
}: GraphControlsProps) {
    const clamp = (z: number) => Math.min(2.5, Math.max(0.4, z));

    return (
        <div
            style={{
                background: TOKENS.surface,
                borderBottom: `1px solid ${TOKENS.border}`,
                padding: '0 12px',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    background: TOKENS.bg,
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: 4,
                    overflow: 'hidden',
                }}
            >
                {LAYOUTS.map(({ id, icon, label, tip }) => {
                    const active = layout === id;
                    return (
                        <button
                            key={id}
                            title={tip}
                            onClick={() => onLayoutChange(id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '0 14px',
                                height: 34,
                                background: active ? 'rgba(52,199,123,0.10)' : 'transparent',
                                border: 'none',
                                borderRight: `1px solid ${TOKENS.border}`,
                                cursor: 'pointer',
                                color: active ? TOKENS.green : TOKENS.mid,
                                fontSize: 13,
                                fontFamily: TOKENS.fontSans,
                                fontWeight: active ? 500 : 400,
                                outline: 'none',
                            }}
                        >
                            <span style={{ fontSize: 14 }}>{icon}</span>
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            <VDivider />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: TOKENS.bg,
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: 4,
                    padding: '0 8px',
                    height: 34,
                }}
            >
                <button
                    onClick={() => onZoomChange(clamp(zoom - 0.15))}
                    style={zoomBtn(TOKENS.green, 16)}
                    aria-label="Zoom out"
                >
                    −
                </button>
                <span
                    style={{
                        fontSize: 12,
                        color: TOKENS.text,
                        fontFamily: TOKENS.fontMono,
                        minWidth: 40,
                        textAlign: 'center',
                    }}
                >
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => onZoomChange(clamp(zoom + 0.15))}
                    style={zoomBtn(TOKENS.green, 16)}
                    aria-label="Zoom in"
                >
                    +
                </button>
                <button
                    onClick={onFit}
                    style={zoomBtn(TOKENS.mid, 13)}
                    title="Fit to view"
                    aria-label="Fit to view"
                >
                    ⊡
                </button>
            </div>

            <VDivider />

            {(
                [
                    [String(stats.total), 'cases', TOKENS.mid],
                    [String(stats.success), '✓', TOKENS.green],
                    [String(stats.partial), '◐', TOKENS.orange],
                    [String(stats.failure), '✕', TOKENS.red],
                ] as const
            ).map(([v, l, c]) => (
                <div
                    key={l}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontFamily: TOKENS.fontMono,
                    }}
                >
                    <span style={{ color: c, fontWeight: 600 }}>{v}</span>
                    <span style={{ color: c }}>{l}</span>
                </div>
            ))}

            {layout === 'force' && (
                <>
                    <VDivider />
                    <span style={{ fontSize: 11, color: TOKENS.dim, fontFamily: TOKENS.fontMono }}>
                        size=sim
                    </span>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                        {[8, 11, 14].map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    width: s,
                                    height: s,
                                    borderRadius: '50%',
                                    background: TOKENS.green,
                                    opacity: 0.25 + i * 0.3,
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            <div style={{ flex: 1 }} />

            <button
                onClick={onHintsToggle}
                style={{
                    background: hintsOpen ? 'rgba(52,199,123,0.10)' : 'transparent',
                    border: `1px solid ${hintsOpen ? 'rgba(52,199,123,0.3)' : TOKENS.border}`,
                    borderRadius: 4,
                    color: hintsOpen ? TOKENS.green : TOKENS.mid,
                    cursor: 'pointer',
                    padding: '0 12px',
                    height: 32,
                    fontSize: 12,
                    fontFamily: TOKENS.fontMono,
                }}
            >
                ? hints
            </button>
            <button
                onClick={onExport}
                style={{
                    background: 'transparent',
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: 4,
                    color: TOKENS.mid,
                    cursor: 'pointer',
                    padding: '0 12px',
                    height: 32,
                    fontSize: 12,
                    fontFamily: TOKENS.fontMono,
                }}
            >
                ↗ export
            </button>
        </div>
    );
}

function VDivider() {
    return <div style={{ width: 1, height: 24, background: TOKENS.border }} />;
}

function zoomBtn(color: string, size: number): React.CSSProperties {
    return {
        background: 'none',
        border: 'none',
        color,
        cursor: 'pointer',
        fontSize: size,
        padding: '0 4px',
        fontFamily: TOKENS.fontMono,
        lineHeight: 1,
    };
}
