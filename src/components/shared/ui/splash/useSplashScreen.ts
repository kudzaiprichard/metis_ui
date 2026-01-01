/**
 * useSplashScreen Hook
 * Manages splash screen state during initial app load
 */

'use client';

import { useState, useEffect } from 'react';

export function useSplashScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait for the page to be fully loaded
        const handleLoad = () => {
            // Add a small delay to ensure everything is ready
            setTimeout(() => {
                setIsLoading(false);
            }, 1800);
        };

        // Check if the page is already loaded
        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

    return { isLoading };
}