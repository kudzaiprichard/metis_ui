'use client';

import { useSyncExternalStore } from 'react';

import { loadRecent, type RecentEntry } from '../lib/recent-predictions';

const STORAGE_KEY = 'metis:inference:recent';
const EMPTY: RecentEntry[] = [];

// `useSyncExternalStore` calls `getSnapshot` on every render and bails out of
// re-rendering only when the returned reference is identical. `loadRecent()`
// re-parses JSON each call, so we memoise on the raw localStorage string —
// returning the cached array as long as the underlying value hasn't changed.
let cachedRaw: string | null = null;
let cachedValue: RecentEntry[] = EMPTY;

const getSnapshot = () => {
    if (typeof window === 'undefined') return EMPTY;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = loadRecent();
    return cachedValue;
};

const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') return () => undefined;
    window.addEventListener('metis:inference-recent-changed', callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener('metis:inference-recent-changed', callback);
        window.removeEventListener('storage', callback);
    };
};

const getServerSnapshot = () => EMPTY;

/**
 * Reactive view of the localStorage-backed recent predictions list.
 * Uses `useSyncExternalStore` so React safely tears the list when the
 * underlying store changes — either via the in-tab custom event or a
 * cross-tab `storage` event.
 */
export function useRecentPredictions(): RecentEntry[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
