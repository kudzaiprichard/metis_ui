'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function Breadcrumb() {
    const pathname = usePathname();

    // Generate breadcrumb items from pathname
    const generateBreadcrumbs = () => {
        const paths = pathname.split('/').filter(Boolean);

        // Format path segments into readable labels
        const formatLabel = (segment: string) => {
            return segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        // Build breadcrumb items
        const breadcrumbs = paths.map((segment, index) => {
            // Skip role segment (doctor/ml-engineer) but keep it for context
            if (index === 0 && (segment === 'doctor' || segment === 'ml-engineer')) {
                return {
                    label: 'Dashboard',
                    isLast: index === paths.length - 1
                };
            }

            return {
                label: formatLabel(segment),
                isLast: index === paths.length - 1
            };
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    // Don't show breadcrumb if we're at root or only one level deep
    if (breadcrumbs.length === 0 || breadcrumbs.length === 1) {
        return null;
    }

    return (
        <>
            <div className="page-breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <i className="fa-solid fa-chevron-right breadcrumb-separator"></i>
                        )}
                        <span className={crumb.isLast ? 'breadcrumb-current' : 'breadcrumb-item'}>
                            {crumb.label}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            <style jsx>{`
                .page-breadcrumb {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow:
                            0 20px 60px rgba(0, 0, 0, 0.5),
                            0 8px 16px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 13px;
                    z-index: 999;
                    max-width: 90%;
                    overflow: hidden;
                }

                .breadcrumb-item-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .breadcrumb-item {
                    color: rgba(255, 255, 255, 0.5);
                    transition: color 0.2s ease;
                    white-space: nowrap;
                }

                .breadcrumb-separator {
                    color: rgba(255, 255, 255, 0.35);
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .breadcrumb-current {
                    color: #10b981;
                    font-weight: 600;
                    white-space: nowrap;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .page-breadcrumb {
                        bottom: 20px;
                        padding: 8px 16px;
                        font-size: 12px;
                        max-width: 85%;
                        gap: 10px;
                    }

                    .breadcrumb-separator {
                        font-size: 10px;
                    }
                }

                @media (max-width: 480px) {
                    .page-breadcrumb {
                        bottom: 15px;
                        padding: 6px 12px;
                        font-size: 11px;
                        gap: 8px;
                    }

                    .breadcrumb-separator {
                        font-size: 9px;
                    }
                }
            `}</style>
        </>
    );
}