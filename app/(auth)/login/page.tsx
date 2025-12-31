'use client';

import { Suspense, useEffect, useRef } from 'react';
import { LoginForm } from "@/src/features/auth/components/LoginForm";
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/src/components/shared/ui/toast';

function LoginContent() {
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const hasShownToast = useRef(false);

    useEffect(() => {
        const error = searchParams.get('error');
        if (error && !hasShownToast.current) {
            showToast('Authentication Required', error, 'error');
            hasShownToast.current = true;
        }
    }, [searchParams, showToast]);

    return <LoginForm />;
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}