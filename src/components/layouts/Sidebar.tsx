'use client';

import { useRouter, usePathname } from 'next/navigation';

export interface NavItem {
    icon: string;
    label: string;
    path: string;
    color: string;
    className: string;
}

interface SidebarProps {
    navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavClick = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + '/');
    };

    return (
        <>
            <nav className="side-nav">
                {navItems.map((item, index) => (
                    <div
                        key={index}
                        className={`nav-item ${item.className} ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.path)}
                    >
                        <div className="nav-icon">
                            <i className={item.icon}></i>
                        </div>
                        <div className="nav-label">{item.label}</div>
                    </div>
                ))}
            </nav>

            <style jsx>{`
                .side-nav {
                    position: fixed;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 1000;
                    padding: 12px 8px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow:
                            0 20px 60px rgba(0, 0, 0, 0.5),
                            0 8px 16px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                .nav-item {
                    position: relative;
                    margin: 12px 0;
                    cursor: pointer;
                }

                .nav-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    transition: all 0.3s ease;
                    font-size: 18px;
                    border: 1px solid transparent;
                }

                .nav-item:hover .nav-icon {
                    transform: scale(1.05);
                }

                /* Color variants for different nav items */
                .nav-item.patients .nav-icon :global(i) { color: #60a5fa; }
                .nav-item.predictions .nav-icon :global(i) { color: #a78bfa; }
                .nav-item.decisions .nav-icon :global(i) { color: #34d399; }
                .nav-item.followups .nav-icon :global(i) { color: #fbbf24; }
                .nav-item.playground .nav-icon :global(i) { color: #f472b6; }
                .nav-item.analytics .nav-icon :global(i) { color: #fb923c; }
                .nav-item.settings .nav-icon :global(i) { color: #94a3b8; }
                .nav-item.dashboard .nav-icon :global(i) { color: #60a5fa; }
                .nav-item.models .nav-icon :global(i) { color: #a78bfa; }
                .nav-item.experiments .nav-icon :global(i) { color: #34d399; }
                .nav-item.datasets .nav-icon :global(i) { color: #fbbf24; }
                .nav-item.profile .nav-icon :global(i) { color: #94a3b8; }

                /* Active state backgrounds */
                .nav-item.active.patients .nav-icon {
                    background: rgba(96, 165, 250, 0.12);
                    border-color: rgba(96, 165, 250, 0.25);
                }
                .nav-item.active.predictions .nav-icon {
                    background: rgba(167, 139, 250, 0.12);
                    border-color: rgba(167, 139, 250, 0.25);
                }
                .nav-item.active.decisions .nav-icon {
                    background: rgba(52, 211, 153, 0.12);
                    border-color: rgba(52, 211, 153, 0.25);
                }
                .nav-item.active.followups .nav-icon {
                    background: rgba(251, 191, 36, 0.12);
                    border-color: rgba(251, 191, 36, 0.25);
                }
                .nav-item.active.playground .nav-icon {
                    background: rgba(244, 114, 182, 0.12);
                    border-color: rgba(244, 114, 182, 0.25);
                }
                .nav-item.active.analytics .nav-icon {
                    background: rgba(251, 146, 60, 0.12);
                    border-color: rgba(251, 146, 60, 0.25);
                }
                .nav-item.active.settings .nav-icon {
                    background: rgba(148, 163, 184, 0.12);
                    border-color: rgba(148, 163, 184, 0.25);
                }
                .nav-item.active.dashboard .nav-icon {
                    background: rgba(96, 165, 250, 0.12);
                    border-color: rgba(96, 165, 250, 0.25);
                }
                .nav-item.active.models .nav-icon {
                    background: rgba(167, 139, 250, 0.12);
                    border-color: rgba(167, 139, 250, 0.25);
                }
                .nav-item.active.experiments .nav-icon {
                    background: rgba(52, 211, 153, 0.12);
                    border-color: rgba(52, 211, 153, 0.25);
                }
                .nav-item.active.datasets .nav-icon {
                    background: rgba(251, 191, 36, 0.12);
                    border-color: rgba(251, 191, 36, 0.25);
                }
                .nav-item.active.profile .nav-icon {
                    background: rgba(148, 163, 184, 0.12);
                    border-color: rgba(148, 163, 184, 0.25);
                }

                .nav-label {
                    position: absolute;
                    left: 65px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 6px 12px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow:
                            0 8px 24px rgba(0, 0, 0, 0.4),
                            0 4px 8px rgba(0, 0, 0, 0.2),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.25s ease;
                    letter-spacing: 0.2px;
                }

                .nav-label::before {
                    content: '';
                    position: absolute;
                    right: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 5px solid transparent;
                    border-right-color: rgba(255, 255, 255, 0.08);
                }

                .nav-item:hover .nav-label {
                    opacity: 1;
                    left: 72px;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .side-nav {
                        left: 10px;
                        padding: 8px 6px;
                    }

                    .nav-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 16px;
                    }

                    .nav-item {
                        margin: 8px 0;
                    }
                }
            `}</style>
        </>
    );
}