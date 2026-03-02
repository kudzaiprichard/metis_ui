import { NavSection } from '../types';

export const doctorNavigation: NavSection[] = [
    {
        items: [
            {
                icon: 'fa-solid fa-chart-line',
                label: 'Dashboard',
                href: '/doctor/dashboard',
                color: '#60a5fa',
            },
            {
                icon: 'fa-solid fa-users',
                label: 'Patients',
                href: '/doctor/patients',
                color: '#60a5fa',
            },
            {
                icon: 'fa-solid fa-brain',
                label: 'AI Predictions',
                href: '/doctor/predictions',
                color: '#a78bfa',
            },
            {
                icon: 'fa-solid fa-clipboard-check',
                label: 'Treatment Decisions',
                href: '/doctor/decisions',
                color: '#34d399',
            },
        ],
    },
    {
        items: [
            {
                icon: 'fa-solid fa-calendar-days',
                label: 'Follow-ups',
                href: '/doctor/followups',
                color: '#fbbf24',
            },
            {
                icon: 'fa-solid fa-chart-bar',
                label: 'Analytics',
                href: '/doctor/analytics',
                color: '#fb923c',
            },
            {
                icon: 'fa-solid fa-gear',
                label: 'Settings',
                href: '/doctor/settings',
                color: '#94a3b8',
            },
        ],
    },
];

export const mlEngineerNavigation: NavSection[] = [
    {
        items: [
            {
                icon: 'fa-solid fa-users',
                label: 'Users',
                href: '/ml-engineer/users',
                color: '#34d399',
            },
            {
                icon: 'fa-solid fa-code',
                label: 'Playground',
                href: '/ml-engineer/playground',
                color: '#f472b6',
            },
            {
                icon: 'fa-solid fa-brain',
                label: 'Models',
                href: '/ml-engineer/models',
                color: '#a78bfa',
            },
            {
                icon: 'fa-solid fa-gear',
                label: 'Settings',
                href: '/ml-engineer/settings',
                color: '#94a3b8',
            },
        ],
    },
];