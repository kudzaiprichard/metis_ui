'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SystemLayout } from '@/src/components/layouts/SystemLayout';
import { Sidebar } from '@/src/components/layouts/Sidebar';
import { Header } from '@/src/components/layouts/Header';
import { Breadcrumb } from '@/src/components/layouts/Breadcrumb';
import { doctorNavItems } from '@/src/components/layouts/navigation/DoctorNavItems';
import { mlEngineerNavItems } from '@/src/components/layouts/navigation/MLEngineerNavItems';

interface SystemLayoutWrapperProps {
    children: ReactNode;
}

export default function SystemLayoutWrapper({ children }: SystemLayoutWrapperProps) {
    const pathname = usePathname();

    // Determine user role from pathname
    const isDoctor = pathname.startsWith('/doctor');
    const isMlEngineer = pathname.startsWith('/ml-engineer');

    // Select appropriate navigation items based on role
    const navItems = isDoctor ? doctorNavItems : mlEngineerNavItems;

    // TODO: Replace with actual user data from authentication context/session
    // For now, using mock data based on role detection
    const userData = isDoctor
        ? {
            userName: 'Dr. Kudzai',
            userRole: 'Physician',
            userInitials: 'KM'
        }
        : {
            userName: 'Alex Chen',
            userRole: 'ML Engineer',
            userInitials: 'AC'
        };

    return (
        <SystemLayout
            sidebar={<Sidebar navItems={navItems} />}
            header={
                <Header
                    userName={userData.userName}
                    userRole={userData.userRole}
                    userInitials={userData.userInitials}
                />
            }
            breadcrumb={<Breadcrumb />}
        >
            {children}
        </SystemLayout>
    );
}