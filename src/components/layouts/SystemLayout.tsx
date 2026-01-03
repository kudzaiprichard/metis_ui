'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { normalizeUserRole, UserRole } from '@/src/features/auth/api/auth.types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { mlEngineerNavItems } from "@/src/components/layouts/navigation/MLEngineerNavItems";
import { doctorNavItems } from "@/src/components/layouts/navigation/DoctorNavItems";

interface SystemLayoutProps {
    children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
    const { user, isLoading } = useAuth();

    // Show loading state while fetching user data
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Safety check (middleware should prevent this)
    if (!user) {
        return null;
    }

    // Normalize the user role to enum
    const normalizedRole = normalizeUserRole(user.role);

    // Determine nav items based on user role
    const navItems = normalizedRole === UserRole.ML_ENGINEER ? mlEngineerNavItems : doctorNavItems;

    // Create user initials
    const userInitials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;

    // Format user name
    const userName = `${user.first_name} ${user.last_name}`;

    // Format user role for display
    const userRole = normalizedRole.replace('_', ' ');

    return (
        <>
            {/* Floating Sidebar */}
            <Sidebar navItems={navItems} />

            {/* Floating Header */}
            <Header
                userName={userName}
                userRole={userRole}
                userInitials={userInitials}
            />

            {/* Main Content Area with Custom Scrollbar */}
            <div className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </div>

            {/* Floating Breadcrumb */}
            <Breadcrumb />

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