import { ReactNode } from 'react';

export interface NavItem {
    icon: string;
    label: string;
    href: string;
    color: string;
}

export interface NavSection {
    items: NavItem[];
}

export interface SystemLayoutProps {
    children: ReactNode;
}

export interface StudentLayoutProps {
    children: ReactNode;
}