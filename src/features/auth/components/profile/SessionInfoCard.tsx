'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Globe, Laptop, Loader2, LogOut, Monitor } from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import { useLogout } from '../../hooks/useAuth';

interface UaInfo {
    label: string;
    icon: typeof Monitor;
    browser: string;
}

const detectPlatform = (ua: string): { label: string; icon: typeof Monitor } => {
    if (/Android/i.test(ua)) return { label: 'Android', icon: Laptop };
    if (/iPhone|iPad|iPod/i.test(ua)) return { label: 'iOS', icon: Laptop };
    if (/Mac/i.test(ua)) return { label: 'macOS', icon: Laptop };
    if (/Windows/i.test(ua)) return { label: 'Windows', icon: Monitor };
    if (/Linux/i.test(ua)) return { label: 'Linux', icon: Monitor };
    return { label: 'This device', icon: Monitor };
};

const detectBrowser = (ua: string): string => {
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    return 'Browser';
};

// Cache the parsed UA at module scope so `getSnapshot` returns a stable
// reference. `useSyncExternalStore` re-renders only when identity changes,
// so a fresh object on every call would loop.
let uaCache: UaInfo | null = null;
const readUa = (): UaInfo | null => {
    if (typeof navigator === 'undefined') return null;
    if (uaCache) return uaCache;
    const platform = detectPlatform(navigator.userAgent);
    uaCache = { ...platform, browser: detectBrowser(navigator.userAgent) };
    return uaCache;
};
const subscribeNoop = () => () => undefined;
const getServerUa = (): UaInfo | null => null;

export function SessionInfoCard() {
    const logout = useLogout();
    const ua = useSyncExternalStore(subscribeNoop, readUa, getServerUa);
    // Read "now" only after mount so server- and client-rendered HTML match.
    // Initialising with `new Date()` would produce a different value on each
    // side and trigger a hydration warning. The setState-in-effect lint rule
    // is correct in general but this is the documented pattern for browser-
    // only values that must not appear in SSR markup.
    const [signedInAt, setSignedInAt] = useState<Date | null>(null);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSignedInAt(new Date());
    }, []);

    const DeviceIcon = ua?.icon ?? Monitor;
    const sessionStarted = signedInAt
        ? signedInAt.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
          })
        : null;

    return (
        <section
            aria-labelledby="session-heading"
            className="flex flex-col gap-3 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4"
        >
            <header className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <h3
                    id="session-heading"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    This session
                </h3>
            </header>

            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <DeviceIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                        {ua?.label ?? 'This device'}
                        {ua?.browser && (
                            <span className="text-muted-foreground/60 font-normal">
                                {' '}
                                · {ua.browser}
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-muted-foreground/70" suppressHydrationWarning>
                        {sessionStarted ? `Signed in at ${sessionStarted}` : 'Active session'}
                    </p>
                </div>
            </div>

            <Button
                type="button"
                variant="ghost"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="h-9 rounded-lg border border-destructive/20 bg-destructive/[0.06] text-destructive hover:bg-destructive/[0.1] hover:text-destructive text-sm font-semibold w-full"
            >
                {logout.isPending ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Signing out…
                    </>
                ) : (
                    <>
                        <LogOut className="h-3.5 w-3.5 mr-1.5" />
                        Sign out of this device
                    </>
                )}
            </Button>
        </section>
    );
}
