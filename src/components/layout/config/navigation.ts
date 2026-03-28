import { Brain, Code, Users } from 'lucide-react';
import { createElement } from 'react';
import { NavSection } from '../types';

export const doctorNavigation: NavSection[] = [
    {
        items: [
            {
                icon: createElement(Users),
                label: 'Patients',
                href: '/doctor/patients',
                color: '#60a5fa',
            },
            {
                icon: createElement(Brain),
                label: 'Inference',
                href: '/doctor/inference',
                color: '#a78bfa',
            },
        ],
    },
];

export const mlEngineerNavigation: NavSection[] = [
    {
        items: [
            {
                icon: createElement(Users),
                label: 'Users',
                href: '/ml-engineer/users',
                color: '#34d399',
            },
            {
                icon: createElement(Code),
                label: 'Bandit Demo',
                href: '/ml-engineer/bandit-demo',
                color: '#f472b6',
            },
        ],
    },
];
