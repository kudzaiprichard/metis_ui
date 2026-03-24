"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error("Global error boundary caught:", error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    background:
                        "linear-gradient(135deg, #0a1210 0%, #0f1f1a 50%, #132a22 100%)",
                    color: "#e0ede8",
                    fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                }}
            >
                <main
                    style={{
                        maxWidth: 480,
                        width: "100%",
                        background: "rgba(20, 45, 35, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "0.625rem",
                        padding: "32px",
                        backdropFilter: "blur(20px)",
                        textAlign: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: 22,
                            fontWeight: 600,
                            margin: "0 0 12px",
                            letterSpacing: "-0.3px",
                        }}
                    >
                        Something went wrong
                    </h1>
                    <p
                        style={{
                            fontSize: 14,
                            color: "#9ec9b5",
                            margin: "0 0 24px",
                            lineHeight: 1.5,
                        }}
                    >
                        An unexpected error occurred. Please try again or return to
                        the login screen.
                    </p>
                    {error.digest && (
                        <p
                            style={{
                                fontSize: 12,
                                color: "rgba(158, 201, 181, 0.6)",
                                margin: "0 0 20px",
                                fontFamily: "monospace",
                            }}
                        >
                            Error ID: {error.digest}
                        </p>
                    )}
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={reset}
                            style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "0.625rem",
                                padding: "10px 20px",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Try again
                        </button>
                        <a
                            href="/login"
                            style={{
                                background: "transparent",
                                color: "#e0ede8",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "0.625rem",
                                padding: "10px 20px",
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            Back to login
                        </a>
                    </div>
                </main>
            </body>
        </html>
    );
}
