'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { computeLayout, sortedTreatmentsBySuccess } from '../lib/layouts';
import { OUT_COLOR, OUT_ICON, TOKENS } from '../lib/tokens';
import type { LayoutType, OutcomeFilter, Patient, SelectedNode, TopNFilter, Treatment } from '../lib/types';

interface GraphCanvasProps {
    patients: Patient[];
    treatments: Treatment[];
    layout: LayoutType;
    outcomeFilter: OutcomeFilter;
    topN: TopNFilter;
    zoom: number;
    onZoomChange: (z: number) => void;
    pan: { x: number; y: number };
    onPanChange: (p: { x: number; y: number }) => void;
    selected: SelectedNode | null;
    onSelect: (n: SelectedNode | null) => void;
}

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.5;

// Grid pattern rendered as a CSS background-image on the container so it
// stays fixed in screen coordinates instead of scaling with the canvas
// transform. (When the grid lived inside the SVG, zooming out shrunk it
// and exposed solid background around it.)
//
// %23 = `#`. Stroke color matches TOKENS.border (#162820). If that token
// ever changes, update the string here too.
const GRID_BG =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M 24 0 L 0 0 0 24' fill='none' stroke='%23162820' stroke-width='0.5'/></svg>\")";

/**
 * Clamp the pan offset so the scaled content always covers the viewport
 * (no empty background showing through). At zoom ≤ 1 the content already
 * fits — pan locks at (0, 0). At zoom > 1 the bounds open up symmetrically
 * around the origin.
 *
 * Derivation: the content is centred + scaled, so its half-extent is
 * (W*z)/2. For its edge to reach (but not pass) the viewport edge:
 *   |pan.x| ≤ (W*z - W) / 2 = W*(z-1)/2
 */
function clampPan(
    p: { x: number; y: number },
    zoom: number,
    w: number,
    h: number,
): { x: number; y: number } {
    if (zoom <= 1) return { x: 0, y: 0 };
    const maxX = (w * (zoom - 1)) / 2;
    const maxY = (h * (zoom - 1)) / 2;
    return {
        x: Math.max(-maxX, Math.min(maxX, p.x)),
        y: Math.max(-maxY, Math.min(maxY, p.y)),
    };
}

export function GraphCanvas({
    patients,
    treatments,
    layout,
    outcomeFilter,
    topN,
    zoom,
    onZoomChange,
    pan,
    onPanChange,
    selected,
    onSelect,
}: GraphCanvasProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dim, setDim] = useState({ w: 800, h: 500 });
    const [hovered, setHovered] = useState<string | null>(null);
    const [isPanning, setIsPanning] = useState(false);

    // Mutable drag state lives in a ref so mousemove doesn't trigger re-renders.
    const dragRef = useRef<{
        startMouseX: number;
        startMouseY: number;
        startPanX: number;
        startPanY: number;
        moved: boolean;
    } | null>(null);

    // True when the most recent mouse-down → mouse-up sequence involved
    // movement past the threshold. The bg `onClick` fires *after* mouseup;
    // we use this to skip the deselect when the user was panning, not clicking.
    const wasMovedRef = useRef(false);

    useEffect(() => {
        const update = () => {
            if (!containerRef.current) return;
            const r = containerRef.current.getBoundingClientRect();
            setDim({ w: r.width, h: r.height });
        };
        update();
        const ro = new ResizeObserver(update);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Wheel-to-zoom-at-cursor. Attached imperatively so we can preventDefault
    // (React's onWheel is passive by default, can't preventDefault page scroll).
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;

            const step = e.deltaY > 0 ? -0.12 : 0.12;
            const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + step));
            if (next === zoom) return;

            // Anchor the world point under the cursor across the zoom step.
            // Start from the *displayed* (clamped) pan so the math matches
            // what the user sees.
            const factor = next / zoom;
            const startPan = clampPan(pan, zoom, dim.w, dim.h);
            const nextPan = {
                x: startPan.x * factor + cx * (1 - factor),
                y: startPan.y * factor + cy * (1 - factor),
            };
            onZoomChange(next);
            onPanChange(clampPan(nextPan, next, dim.w, dim.h));
        };
        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    }, [zoom, pan, dim.w, dim.h, onZoomChange, onPanChange]);

    const pos = useMemo(
        () => computeLayout(layout, patients, treatments, dim.w, dim.h),
        [layout, patients, treatments, dim.w, dim.h],
    );

    // Determine which patients are visible based on filters. Outcome filter
    // takes precedence; Top-N is applied after, ranked by similarity desc.
    const visibleIds = useMemo(() => {
        let pts: Patient[] = patients;
        if (outcomeFilter !== 'all') {
            pts = pts.filter(p => p.out === outcomeFilter);
        }
        if (topN !== 'all') {
            pts = [...pts].sort((a, b) => b.sim - a.sim).slice(0, topN);
        }
        return new Set(pts.map(p => p.id));
    }, [patients, outcomeFilter, topN]);

    // ── Pan handling ───────────────────────────────────────────────────────
    // Only start a drag when:
    //   • mousedown lands on background (not on a node `<g>`), AND
    //   • zoom > 1 (otherwise the content fits and there's nothing to pan to).
    // The 3px threshold prevents trembling clicks from being mistaken for drags.
    const canPan = zoom > 1;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // only left-click pans
        if (!canPan) return; // nothing to pan to at fit-to-view zoom
        const target = e.target as Element;
        if (target.closest('[data-node]')) return;
        wasMovedRef.current = false;
        // Start from the *displayed* pan, not raw state. They diverge when
        // a previously panned-out viewport gets zoomed back in: state may
        // remember the old pan but the render shows the clamped value.
        const startPan = clampPan(pan, zoom, dim.w, dim.h);
        dragRef.current = {
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startPanX: startPan.x,
            startPanY: startPan.y,
            moved: false,
        };
        setIsPanning(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = e.clientX - drag.startMouseX;
        const dy = e.clientY - drag.startMouseY;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 3) {
            drag.moved = true;
            wasMovedRef.current = true;
        }
        if (drag.moved) {
            const next = { x: drag.startPanX + dx, y: drag.startPanY + dy };
            onPanChange(clampPan(next, zoom, dim.w, dim.h));
        }
    };

    const endDrag = () => {
        dragRef.current = null;
        setIsPanning(false);
    };

    const handleBgClick = () => {
        // Suppress deselect when the click was actually the end of a pan drag.
        if (wasMovedRef.current) return;
        onSelect(null);
    };

    // Clamp at render time too. This catches the case where the user
    // panned at high zoom, then zoomed out — the state still holds the old
    // pan but it now exceeds the smaller bounds. Render snaps it.
    const renderPan = clampPan(pan, zoom, dim.w, dim.h);

    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onClick={handleBgClick}
            style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                background: TOKENS.bg,
                backgroundImage: GRID_BG,
                minHeight: 0,
                cursor: !canPan ? 'default' : isPanning ? 'grabbing' : 'grab',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transformOrigin: 'center center',
                    transform: `translate(${renderPan.x}px, ${renderPan.y}px) scale(${zoom})`,
                    // Skip the transition while dragging so pan feels instantaneous.
                    // Zoom button clicks still animate (isPanning is false then).
                    transition: isPanning ? 'none' : 'transform 0.15s ease',
                }}
            >
                <svg width={dim.w} height={dim.h} style={{ display: 'block' }}>
                    {/* Grid background lives on the parent container's CSS
                        backgroundImage so it stays fixed in screen space. */}
                    {layout === 'outcome' && (
                        <OutcomeBands W={dim.w} H={dim.h} />
                    )}

                    {layout === 'cluster' && (
                        <ClusterRings pos={pos} treatments={treatments} />
                    )}

                    {layout === 'tree' && (
                        <TreeLanes W={dim.w} H={dim.h} patients={patients} treatments={treatments} />
                    )}

                    {/* edges */}
                    {patients.map(pt => {
                        const pp = pos[pt.id];
                        const tp = pos[pt.tx];
                        if (!pp || !tp) return null;
                        const faded = !visibleIds.has(pt.id);
                        const highlight =
                            !!selected &&
                            (selected.id === pt.id || selected.id === pt.tx);
                        return (
                            <line
                                key={pt.id + '-e'}
                                x1={tp.x}
                                y1={tp.y}
                                x2={pp.x}
                                y2={pp.y}
                                stroke={
                                    highlight ? OUT_COLOR[pt.out] : faded ? '#0f1a14' : TOKENS.border2
                                }
                                strokeWidth={highlight ? 1.5 : 1}
                                strokeOpacity={highlight ? 0.6 : 1}
                            />
                        );
                    })}

                    {/* treatment nodes */}
                    {treatments.map(tx => {
                        const p = pos[tx.id];
                        if (!p) return null;
                        const isSel = selected?.id === tx.id;
                        const isHov = hovered === tx.id;
                        const pts = patients.filter(pt => pt.tx === tx.id);
                        const rate = pts.filter(pt => pt.out === 'success').length / Math.max(1, pts.length);
                        return (
                            <g
                                key={tx.id}
                                data-node="treatment"
                                style={{ cursor: 'pointer' }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                        kind: 'treatment',
                                        ...tx,
                                        patients: pts,
                                        rate,
                                    });
                                }}
                                onMouseEnter={() => setHovered(tx.id)}
                                onMouseLeave={() => setHovered((h) => (h === tx.id ? null : h))}
                            >
                                {isSel && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={24}
                                        fill="none"
                                        stroke={TOKENS.yellow}
                                        strokeWidth={1.5}
                                        strokeDasharray="3 2"
                                    />
                                )}
                                {isHov && !isSel && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={24}
                                        fill="none"
                                        stroke={TOKENS.teal}
                                        strokeWidth={1}
                                        strokeOpacity={0.3}
                                    />
                                )}
                                <circle cx={p.x} cy={p.y} r={19} fill={TOKENS.teal} />
                                <text
                                    x={p.x}
                                    y={p.y + 4}
                                    textAnchor="middle"
                                    fill={TOKENS.bg}
                                    fontSize={9}
                                    fontFamily={TOKENS.fontSans}
                                    fontWeight="600"
                                >
                                    {tx.short}
                                </text>
                                {layout === 'cluster' && (
                                    <text
                                        x={p.x}
                                        y={p.y - 26}
                                        textAnchor="middle"
                                        fill={TOKENS.teal}
                                        fontSize={9}
                                        fontFamily={TOKENS.fontMono}
                                        fillOpacity={0.8}
                                    >
                                        {tx.name}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* patient nodes */}
                    {patients.map(pt => {
                        const p = pos[pt.id];
                        if (!p) return null;
                        const faded = !visibleIds.has(pt.id);
                        const isSel = selected?.id === pt.id;
                        const isHov = hovered === pt.id;
                        const r = layout === 'force' ? Math.round(8 + (pt.sim - 70) * 0.22) : 12;
                        const c = OUT_COLOR[pt.out];
                        return (
                            <g
                                key={pt.id}
                                data-node="patient"
                                style={{ cursor: faded ? 'default' : 'pointer' }}
                                opacity={faded ? 0.15 : 1}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (faded) return;
                                    onSelect({ kind: 'patient', ...pt });
                                }}
                                onMouseEnter={() => !faded && setHovered(pt.id)}
                                onMouseLeave={() => setHovered((h) => (h === pt.id ? null : h))}
                            >
                                {isSel && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={r + 5}
                                        fill="none"
                                        stroke={TOKENS.yellow}
                                        strokeWidth={1.5}
                                        strokeDasharray="3 2"
                                    />
                                )}
                                {isHov && !isSel && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={r + 4}
                                        fill="none"
                                        stroke={c}
                                        strokeWidth={1}
                                        strokeOpacity={0.3}
                                    />
                                )}
                                <circle cx={p.x} cy={p.y} r={r} fill={c} />
                                {r >= 11 && (
                                    <text
                                        x={p.x}
                                        y={p.y + 3}
                                        textAnchor="middle"
                                        fill={TOKENS.bg}
                                        fontSize={7}
                                        fontFamily={TOKENS.fontMono}
                                        fontWeight="500"
                                    >
                                        {OUT_ICON[pt.out]}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

function OutcomeBands({ W, H }: { W: number; H: number }) {
    const items: ['success' | 'partial' | 'failure', number][] = [
        ['success', W * 0.22],
        ['partial', W * 0.5],
        ['failure', W * 0.78],
    ];
    return (
        <>
            {items.map(([out, cx]) => {
                const c = OUT_COLOR[out];
                return (
                    <g key={out}>
                        <rect x={cx - 70} y={16} width={140} height={1} fill={c} fillOpacity={0.3} />
                        <text
                            x={cx}
                            y={12}
                            textAnchor="middle"
                            fill={c}
                            fontSize={9}
                            fontFamily={TOKENS.fontMono}
                            fillOpacity={0.7}
                        >
                            {OUT_ICON[out]} {out.toUpperCase()}
                        </text>
                        <line
                            x1={cx}
                            y1={20}
                            x2={cx}
                            y2={H - 60}
                            stroke={c}
                            strokeOpacity={0.05}
                            strokeWidth={80}
                        />
                    </g>
                );
            })}
        </>
    );
}

function ClusterRings({
    pos,
    treatments,
}: {
    pos: Record<string, { x: number; y: number }>;
    treatments: Treatment[];
}) {
    return (
        <>
            {treatments.map(tx => {
                const c = pos[tx.id];
                if (!c) return null;
                return (
                    <circle
                        key={tx.id}
                        cx={c.x}
                        cy={c.y}
                        r={72}
                        fill={TOKENS.card}
                        fillOpacity={0.7}
                        stroke={TOKENS.teal}
                        strokeOpacity={0.15}
                        strokeWidth={1}
                        strokeDasharray="4 3"
                    />
                );
            })}
        </>
    );
}

function TreeLanes({
    W,
    H,
    patients,
    treatments,
}: {
    W: number;
    H: number;
    patients: Patient[];
    treatments: Treatment[];
}) {
    const sorted = sortedTreatmentsBySuccess(treatments, patients);
    const laneW = W / (sorted.length + 0.5);
    return (
        <>
            {sorted.map((tx, ti) => {
                const cx = laneW * (ti + 0.75);
                const pts = patients.filter(p => p.tx === tx.id);
                const rate = pts.filter(p => p.out === 'success').length / Math.max(1, pts.length);
                return (
                    <g key={tx.id}>
                        {ti > 0 && (
                            <line
                                x1={cx - laneW / 2}
                                y1={30}
                                x2={cx - laneW / 2}
                                y2={H - 30}
                                stroke={TOKENS.border}
                                strokeWidth={1}
                            />
                        )}
                        <rect x={cx - 28} y={30} width={56} height={4} rx={2} fill={TOKENS.border} />
                        <rect
                            x={cx - 28}
                            y={30}
                            width={56 * rate}
                            height={4}
                            rx={2}
                            fill={TOKENS.green}
                            fillOpacity={0.7}
                        />
                        <text
                            x={cx}
                            y={26}
                            textAnchor="middle"
                            fill={TOKENS.green}
                            fontSize={8}
                            fontFamily={TOKENS.fontMono}
                            fillOpacity={0.8}
                        >
                            {Math.round(rate * 100)}%
                        </text>
                    </g>
                );
            })}
        </>
    );
}
