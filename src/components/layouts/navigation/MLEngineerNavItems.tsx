import { NavItem } from '../Sidebar';

export const mlEngineerNavItems: NavItem[] = [
    {
        icon: 'fa-solid fa-users',
        label: 'Users',
        path: '/ml-engineer/users',
        color: '#34d399',
        className: 'users'
    },
    {
        icon: 'fa-solid fa-code',
        label: 'Playground',
        path: '/ml-engineer/playground',
        color: '#f472b6',
        className: 'playground'
    },
    {
        icon: 'fa-solid fa-brain',
        label: 'Models',
        path: '/ml-engineer/models',
        color: '#a78bfa',
        className: 'models'
    },
    {
        icon: 'fa-solid fa-gear',
        label: 'Settings',
        path: '/ml-engineer/settings',
        color: '#94a3b8',
        className: 'settings'
    }
];