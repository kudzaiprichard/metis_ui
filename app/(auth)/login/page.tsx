import type { Metadata } from 'next';
import { LoginContent } from './login-content';

export const metadata: Metadata = {
    title: 'Login | Metis',
};

export default function LoginPage() {
    return <LoginContent />;
}
