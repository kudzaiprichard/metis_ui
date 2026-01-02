import { NavItem } from '../Sidebar';

export const mlEngineerNavItems: NavItem[] = [
    {
        icon: 'fa-solid fa-chart-line',
        label: 'Dashboard',
        path: '/ml-engineer/dashboard',
        color: '#60a5fa',
        className: 'dashboard'
    },
    {
        icon: 'fa-solid fa-brain',
        label: 'Models',
        path: '/ml-engineer/models',
        color: '#a78bfa',
        className: 'models'
    },
    {
        icon: 'fa-solid fa-flask',
        label: 'Experiments',
        path: '/ml-engineer/experiments',
        color: '#34d399',
        className: 'experiments'
    },
    {
        icon: 'fa-solid fa-database',
        label: 'Datasets',
        path: '/ml-engineer/datasets',
        color: '#fbbf24',
        className: 'datasets'
    },
    {
        icon: 'fa-solid fa-code',
        label: 'ML Playground',
        path: '/ml-engineer/playground',
        color: '#f472b6',
        className: 'playground'
    },
    {
        icon: 'fa-solid fa-chart-bar',
        label: 'Analytics',
        path: '/ml-engineer/analytics',
        color: '#fb923c',
        className: 'analytics'
    },
    {
        icon: 'fa-solid fa-gear',
        label: 'Settings',
        path: '/ml-engineer/settings',
        color: '#94a3b8',
        className: 'settings'
    }
];