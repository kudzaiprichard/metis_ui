import { NavItem } from '../Sidebar';

export const doctorNavItems: NavItem[] = [
    {
        icon: 'fa-solid fa-chart-line',
        label: 'Dashboard',
        path: '/doctor/dashboard',
        color: '#60a5fa',
        className: 'dashboard'
    },
    {
        icon: 'fa-solid fa-users',
        label: 'Patients',
        path: '/doctor/patients',
        color: '#60a5fa',
        className: 'patients'
    },
    {
        icon: 'fa-solid fa-brain',
        label: 'AI Predictions',
        path: '/doctor/predictions',
        color: '#a78bfa',
        className: 'predictions'
    },
    {
        icon: 'fa-solid fa-clipboard-check',
        label: 'Treatment Decisions',
        path: '/doctor/decisions',
        color: '#34d399',
        className: 'decisions'
    },
    {
        icon: 'fa-solid fa-calendar-days',
        label: 'Follow-ups',
        path: '/doctor/followups',
        color: '#fbbf24',
        className: 'followups'
    },
    {
        icon: 'fa-solid fa-chart-bar',
        label: 'Analytics',
        path: '/doctor/analytics',
        color: '#fb923c',
        className: 'analytics'
    },
    {
        icon: 'fa-solid fa-gear',
        label: 'Settings',
        path: '/doctor/settings',
        color: '#94a3b8',
        className: 'settings'
    }
];