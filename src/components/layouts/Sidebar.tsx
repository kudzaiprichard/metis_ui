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

    // Convert hex color to rgba with opacity
    const hexToRgba = (hex: string, opacity: number) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return `rgba(0, 0, 0, ${opacity})`;

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return (
        <>
            <nav className="side-nav">
                {navItems.map((item, index) => (
                    <div
                        key={index}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.path)}
                    >
                        <div
                            className="nav-icon"
                            style={{
                                background: isActive(item.path) ? hexToRgba(item.color, 0.12) : 'transparent',
                                borderColor: isActive(item.path) ? hexToRgba(item.color, 0.25) : 'transparent',
                            }}
                        >
                            <i className={item.icon} style={{ color: item.color }}></i>
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
                    transition: all 0.3s ease;
                    font-size: 18px;
                    border: 1px solid transparent;
                }

                .nav-item:hover .nav-icon {
                    transform: scale(1.05);
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