/**
 * ConfidenceBadge Component
 * Displays confidence score with color-coded indicator
 */

'use client';

interface ConfidenceBadgeProps {
    score: number; // 0-100
    showLabel?: boolean;
}

export function ConfidenceBadge({ score, showLabel = true }: ConfidenceBadgeProps) {
    const getConfidenceLevel = () => {
        if (score >= 90) return { level: 'high', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.2)' };
        if (score >= 75) return { level: 'medium', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.2)' };
        return { level: 'low', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.2)' };
    };

    const { level, color, bg, border } = getConfidenceLevel();

    return (
        <>
            <div className="confidence-badge">
                <i className="fa-solid fa-shield-halved"></i>
                <span className="confidence-value">{score.toFixed(1)}%</span>
                {showLabel && <span className="confidence-label">{level}</span>}
            </div>

            <style jsx>{`
                .confidence-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: ${bg};
                    border: 1px solid ${border};
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .confidence-badge i {
                    color: ${color};
                    font-size: 12px;
                }

                .confidence-value {
                    color: ${color};
                    font-weight: 700;
                }

                .confidence-label {
                    color: ${color};
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 10px;
                    opacity: 0.8;
                }
            `}</style>
        </>
    );
}