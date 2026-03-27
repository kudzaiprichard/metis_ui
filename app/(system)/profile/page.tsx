import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProfileView } from '@/src/features/auth/components/profile/ProfileView';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Profile | Metis',
};

export default function ProfilePage() {
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} />}>
            <ProfileView />
        </Suspense>
    );
}
