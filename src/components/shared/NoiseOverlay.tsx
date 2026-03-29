/**
 * NoiseOverlay — a decorative SVG fractal-noise layer for premium glass
 * surfaces. Drop it as a sibling inside a `relative overflow-hidden`
 * container; it positions itself absolutely behind the content (the
 * surrounding container should give its real children `relative z-10`
 * if anything would otherwise sit on top).
 *
 * The noise is `mix-blend-overlay` at low opacity so it adds visible
 * grain without darkening the surface or hurting text contrast.
 */

interface NoiseOverlayProps {
    /** 0–1 — overall intensity. Defaults to 0.5. */
    opacity?: number;
}

export function NoiseOverlay({ opacity = 0.5 }: NoiseOverlayProps) {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{
                opacity,
                backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'>
                       <filter id='n'>
                         <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
                         <feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/>
                       </filter>
                       <rect width='100%' height='100%' filter='url(#n)' opacity='0.22'/>
                     </svg>`,
                )}")`,
                backgroundSize: '240px 240px',
            }}
        />
    );
}
