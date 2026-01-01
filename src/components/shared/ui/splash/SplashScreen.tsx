// File: src/components/shared/ui/splash/SplashScreen.tsx
/**
 * SplashScreen Component
 * Full-page loading overlay
 */

'use client';

import React from 'react';
import { Spinner } from './Spinner';

interface SplashScreenProps {
    isLoading: boolean;
}

export function SplashScreen({ isLoading }: SplashScreenProps) {
    if (!isLoading) return null;

    return (
        <>
            <div className="splash-screen">
                <Spinner />
            </div>

            <style jsx>{`
                .splash-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </>
    );
}