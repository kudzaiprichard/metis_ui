'use client';

import { ReactNode } from 'react';

interface SystemLayoutProps {
    children: ReactNode;
    sidebar: ReactNode;
    header: ReactNode;
    breadcrumb: ReactNode;
}

export function SystemLayout({ children, sidebar, header, breadcrumb }: SystemLayoutProps) {
    return (
        <>
            {/* Floating Sidebar */}
            {sidebar}

            {/* Floating Header */}
            {header}

            {/* Main Content Area with Custom Scrollbar */}
            <div className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </div>

            {/* Floating Breadcrumb */}
            {breadcrumb}

            <style jsx>{`
                .main-content {
                    position: fixed;
                    top: 0;
                    left: 120px;
                    right: 120px;
                    bottom: 0;
                    padding: 30px;
                    overflow-y: auto;
                    z-index: 1;
                }

                /* Custom Scrollbar - Compact and Minimal */
                .main-content::-webkit-scrollbar {
                    width: 8px;
                }

                .main-content::-webkit-scrollbar-track {
                    background: transparent;
                }

                .main-content::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }

                .main-content::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                    background-clip: content-box;
                }

                /* Firefox Scrollbar */
                .main-content {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
                }

                .content-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Responsive adjustments */
                @media (max-width: 1024px) {
                    .main-content {
                        left: 90px;
                        right: 90px;
                    }
                }

                @media (max-width: 768px) {
                    .main-content {
                        left: 20px;
                        right: 20px;
                        padding: 20px 10px;
                    }
                }
            `}</style>
        </>
    );
}