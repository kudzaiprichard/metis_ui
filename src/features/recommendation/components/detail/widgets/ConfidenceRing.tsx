'use client';

import type { ConfidenceLabel } from '../../../api/recommendations.types';

interface ConfidenceRingProps {
    pct: number;
    label: ConfidenceLabel;
    /** Outer pixel size of the ring. */
    size?: number;
    /** Stroke width of the progress arc. */
    stroke?: number;
}

const TIER_TONE: Record<ConfidenceLabel, { ring: string; text: string }> = {
    HIGH: { ring: 'var(--primary)', text: 'text-primary' },
    MODERATE: { ring: 'var(--info)', text: 'text-info' },
    LOW: { ring: 'var(--warning)', text: 'text-warning' },
};

/**
 * Compact circular progress for a confidence percentage. Uses pure SVG so
 * there's no recharts dependency and the ring colours track the design
 * tokens directly.
 */
export function ConfidenceRing({
    pct,
    label,
    size = 132,
    stroke = 10,
}: ConfidenceRingProps) {
    const safe = Math.max(0, Math.min(100, Number(pct) || 0));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - safe / 100);
    const tone = TIER_TONE[label] ?? TIER_TONE.MODERATE;

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label={`${safe.toFixed(1)} percent confidence (${label})`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={tone.ring}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold tabular-nums ${tone.text}`}>
                    {safe.toFixed(1)}
                    <span className="text-md font-semibold">%</span>
                </span>
                <span
                    className={`text-xs font-semibold uppercase tracking-wider ${tone.text}`}
                >
                    {label}
                </span>
            </div>
        </div>
    );
}
