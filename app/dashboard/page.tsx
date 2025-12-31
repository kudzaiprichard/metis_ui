'use client';

import {useAuth, useLogout} from "@/src/features/auth/hooks/useAuth";

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const logout = useLogout();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Middleware guarantees authentication, so this is just a safety check
    // while the user data is being fetched from React Query
    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-white text-xl">Loading user data...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                {/* User Info Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <button
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {logout.isPending ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* User Avatar/Icon */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-white">
                                    {user.first_name} {user.last_name}
                                </h2>
                                <p className="text-emerald-300 text-sm">{user.email}</p>
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            <div>
                                <p className="text-sm text-white/60 mb-1">User ID</p>
                                <p className="text-white font-mono text-sm">{user.id}</p>
                            </div>

                            <div>
                                <p className="text-sm text-white/60 mb-1">Role</p>
                                <span className="inline-block px-3 py-1 bg-emerald-600/30 border border-emerald-500/50 rounded-full text-emerald-300 text-sm font-medium">
                                    {user.role.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-white/60 mb-1">Created At</p>
                                <p className="text-white text-sm">
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-white/60 mb-1">Last Updated</p>
                                <p className="text-white text-sm">
                                    {new Date(user.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Raw JSON (for debugging) */}
                <div className="mt-6 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Raw User Data (Debug)</h3>
                    <pre className="text-xs text-emerald-300 overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}