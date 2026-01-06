/**
 * TabNavigation Component
 * Tab switcher for patient detail sections
 */

'use client';

import { TabType } from './PatientDetail';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'contact', label: 'Contact Information', icon: 'fa-user' },
        { id: 'medical', label: 'Medical Data', icon: 'fa-notes-medical' },
        { id: 'timeline', label: 'Timeline', icon: 'fa-clock-rotate-left' },
    ];

    return (
        <>
            <div className="tab-navigation">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <style jsx>{`
                .tab-navigation {
                    display: flex;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    padding: 4px;
                    margin-bottom: 24px;
                }

                .tab-btn {
                    flex: 1;
                    padding: 12px 24px;
                    background: transparent;
                    border: none;
                    border-radius: 10px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .tab-btn:hover {
                    color: rgba(255, 255, 255, 0.9);
                    background: rgba(255, 255, 255, 0.05);
                }

                .tab-btn.active {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }

                .tab-btn i {
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .tab-navigation {
                        flex-direction: column;
                    }

                    .tab-btn {
                        justify-content: flex-start;
                        padding: 14px 20px;
                    }

                    .tab-btn span {
                        flex: 1;
                        text-align: left;
                    }
                }
            `}</style>
        </>
    );
}