// File: src/components/shared/ui/splash/Spinner.tsx

import React from 'react';

export function Spinner() {
    return (
        <>
            <div className="loading-wrapper">
                <div className="loading-bar" style={{ visibility: 'visible' }}>Loading</div>
            </div>

            <style jsx>{`
                .loading-wrapper {
                    position: relative;
                    width: 150px;
                    height: 150px;
                }

                .loading-bar {
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    width: 140px;
                    height: 140px;
                    background: transparent;
                    border: 4px solid rgba(16, 185, 129, 0.2);
                    border-radius: 50%;
                    text-align: center;
                    line-height: 141px;
                    font-family: sans-serif;
                    font-size: 16px;
                    color: #10b981;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                }

                .loading-bar::before {
                    content: "";
                    position: absolute;
                    top: -8px;
                    left: -8px;
                    right: -8px;
                    bottom: -8px;
                    border: 4px solid transparent;
                    border-top: 8px solid #10b981;
                    border-right: 8px solid #10b981;
                    border-radius: 50%;
                    animation: animateC 2s linear infinite;
                    filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))
                    drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));
                }

                @keyframes animateC {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
            <style jsx global>{`
                .loading-bar {
                    position: absolute !important;
                }
            `}</style>
        </>
    );
}