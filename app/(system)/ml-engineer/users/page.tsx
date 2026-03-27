import { Suspense } from 'react';
import type { Metadata } from 'next';
import { UserList } from '@/src/features/users/components/UserList';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Users | Metis',
};

export default function UsersPage() {
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} loadingText="Loading users…" />}>
            <UserList />
        </Suspense>
    );
}
