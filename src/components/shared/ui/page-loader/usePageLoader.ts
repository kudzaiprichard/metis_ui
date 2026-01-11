// File: src/components/shared/ui/page-loader/usePageLoader.tsx
/**
 * usePageLoader Hook
 * Manages page loader state for data fetching operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsePageLoaderOptions {
    minLoadingTime?: number; // Minimum time to show loader (in ms)
    autoHide?: boolean; // Automatically hide after minLoadingTime
}

export function usePageLoader(options: UsePageLoaderOptions = {}) {
    const { minLoadingTime = 500, autoHide = false } = options;
    const [isLoading, setIsLoading] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Start loading
    const startLoading = useCallback(() => {
        setIsLoading(true);
        setStartTime(Date.now());
    }, []);

    // Stop loading with minimum time enforcement
    const stopLoading = useCallback(() => {
        if (startTime) {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minLoadingTime - elapsed);

            setTimeout(() => {
                setIsLoading(false);
                setStartTime(null);
            }, remaining);
        } else {
            setIsLoading(false);
        }
    }, [startTime, minLoadingTime]);

    // Auto-hide after minimum time
    useEffect(() => {
        if (autoHide && isLoading && startTime) {
            const timer = setTimeout(() => {
                setIsLoading(false);
                setStartTime(null);
            }, minLoadingTime);

            return () => clearTimeout(timer);
        }
    }, [autoHide, isLoading, startTime, minLoadingTime]);

    return {
        isLoading,
        startLoading,
        stopLoading,
        setIsLoading
    };
}