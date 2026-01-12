/**
 * TreatmentBadge Component
 * Displays treatment name with icon
 */

'use client';

interface TreatmentBadgeProps {
    treatment: string;
    variant?: 'default' | 'large' | 'compact';
}

export function TreatmentBadge({ treatment, variant = 'default' }: TreatmentBadgeProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'large':
                return {
                    padding: '10px 16px',
                    fontSize: '15px',
                    iconSize: '16px',
                    gap: '10px',
                };
            case 'compact':
                return {
                    padding: '4px 10px',
                    fontSize: '11px',
                    iconSize: '11px',
                    gap: '6px',
                };
            default:
                return {
                    padding: '6px 12px',
                    fontSize: '13px',
                    iconSize: '13px',
                    gap: '8px',
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <>
            <div className="treatment-badge">
                <i className="fa-solid fa-prescription-bottle-medical"></i>
                <span className="treatment-name">{treatment}</span>
            </div>

            <style jsx>{`
                .treatment-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: ${styles.gap};
                    padding: ${styles.padding};
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 8px;
                    font-size: ${styles.fontSize};
                    font-weight: 600;
                    color: #34d399;
                    transition: all 0.2s ease;
                }

                .treatment-badge:hover {
                    background: rgba(16, 185, 129, 0.2);
                    border-color: rgba(16, 185, 129, 0.3);
                }

                .treatment-badge i {
                    color: #34d399;
                    font-size: ${styles.iconSize};
                }

                .treatment-name {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>
        </>
    );
}