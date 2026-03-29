/**
 * AnimatedBackdrop — system-wide decorative layer.
 *
 * Originally an auth-only component, it was promoted to render under every
 * page in the application: a slowly drifting molecular grid (lines + dots)
 * plus a soft primary-tinted spotlight that breathes in and out. The
 * `body::before` and `body::after` layers in `globals.css` still paint
 * underneath; this component overlays the animated motion on top of them.
 *
 * The `bg-divider-drift` keyframe is published from this component so any
 * stationary element (e.g. the login page's vertical divider) can opt in
 * and stay perfectly in sync with the grid pattern.
 *
 * Everything is `pointer-events-none`, `aria-hidden`, and obeys
 * `prefers-reduced-motion: reduce`.
 */

const GRID_LINES = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
       <path d='M 80 0 L 0 0 0 80' fill='none' stroke='rgba(16,185,129,0.07)' stroke-width='1'/>
     </svg>`,
);

const GRID_DOTS = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
       <circle cx='40' cy='40' r='1.4' fill='rgba(16,185,129,0.18)'/>
     </svg>`,
);

export function AnimatedBackdrop() {
    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 bg-grid-drift"
                style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,${GRID_LINES}"), url("data:image/svg+xml;utf8,${GRID_DOTS}")`,
                    backgroundSize: '80px 80px, 80px 80px',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 bg-spotlight"
            />
            <style>{`
                @keyframes bg-grid-drift {
                    0%   { background-position: 0 0, 0 0; }
                    100% { background-position: 160px 160px, -160px 160px; }
                }
                @keyframes bg-spotlight-breathe {
                    0%, 100% { opacity: 0.6; transform: translate3d(-4%, -4%, 0) scale(1); }
                    50%      { opacity: 0.95; transform: translate3d(4%, 4%, 0) scale(1.04); }
                }
                /* Companion keyframe for elements (like the login divider) that
                   want to drift in sync with the grid's vertical motion.
                   Mirrors \`bg-grid-drift\`'s y-axis: 0 → 160px over 60s linear. */
                @keyframes bg-divider-drift {
                    0%   { transform: translateY(0); }
                    100% { transform: translateY(160px); }
                }
                .bg-grid-drift {
                    animation: bg-grid-drift 60s linear infinite;
                    will-change: background-position;
                }
                .bg-spotlight {
                    background:
                        radial-gradient(40rem 32rem at 30% 30%, rgba(16,185,129,0.08), transparent 60%),
                        radial-gradient(36rem 30rem at 75% 75%, rgba(16,185,129,0.06), transparent 60%);
                    animation: bg-spotlight-breathe 18s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                .bg-divider-drift {
                    animation: bg-divider-drift 60s linear infinite;
                    will-change: transform;
                }
                @media (prefers-reduced-motion: reduce) {
                    .bg-grid-drift,
                    .bg-spotlight,
                    .bg-divider-drift { animation: none; }
                }
            `}</style>
        </>
    );
}
