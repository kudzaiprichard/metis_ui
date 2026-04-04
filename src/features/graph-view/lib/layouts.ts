import type { LayoutType, Patient, Position, Treatment } from './types';

export function successRate(txId: string, patients: Patient[]): number {
    const pts = patients.filter(p => p.tx === txId);
    if (pts.length === 0) return 0;
    return pts.filter(p => p.out === 'success').length / pts.length;
}

export function sortedTreatmentsBySuccess(
    treatments: Treatment[],
    patients: Patient[],
): Treatment[] {
    return [...treatments].sort(
        (a, b) => successRate(b.id, patients) - successRate(a.id, patients),
    );
}

/**
 * Compute SVG positions for treatments + their patients given an active layout.
 *
 * All four layouts are parametric over the treatment + patient lists so the
 * canvas works with any backend response. Force / cluster used to rely on
 * hardcoded id-keyed position maps; both now distribute treatments around a
 * ring sized to the canvas, then place patients relative to their treatment.
 */
export function computeLayout(
    layout: LayoutType,
    patients: Patient[],
    treatments: Treatment[],
    W: number,
    H: number,
): Record<string, Position> {
    const pos: Record<string, Position> = {};
    if (treatments.length === 0) return pos;

    if (layout === 'tree') {
        const sorted = sortedTreatmentsBySuccess(treatments, patients);
        const laneW = W / (sorted.length + 0.5);
        sorted.forEach((tx, ti) => {
            const cx = laneW * (ti + 0.75);
            pos[tx.id] = { x: cx, y: 72 };
            const pts = patients.filter(p => p.tx === tx.id);
            pts.forEach((pt, pi) => {
                const col = pi % 2;
                const row = Math.floor(pi / 2);
                pos[pt.id] = { x: cx - 18 + col * 36, y: 145 + row * 52 };
            });
        });
        return pos;
    }

    if (layout === 'force') {
        // Distribute treatments on a ring around the canvas centre, then have
        // each patient orbit its treatment at a distance proportional to its
        // similarity score (higher similarity = closer to the treatment).
        const cx = W / 2;
        const cy = H / 2;
        const ringR = Math.max(60, Math.min(W, H) * 0.28);
        treatments.forEach((tx, i) => {
            const angle =
                (i / treatments.length) * 2 * Math.PI - Math.PI / 2;
            pos[tx.id] = {
                x: cx + Math.cos(angle) * ringR,
                y: cy + Math.sin(angle) * ringR,
            };
        });
        patients.forEach((pt, i) => {
            const base = pos[pt.tx];
            if (!base) return;
            // Golden-angle distribution keeps neighbours from clumping.
            const angle = (i * 137.5 * Math.PI) / 180;
            const dist = 55 + (pt.sim - 70) * 0.6;
            pos[pt.id] = {
                x: base.x + Math.cos(angle) * dist,
                y: base.y + Math.sin(angle) * dist,
            };
        });
        return pos;
    }

    if (layout === 'cluster') {
        const cx = W / 2;
        const cy = H / 2;
        // Slightly wider ring than `force` so patient ring (r=52) fits
        // without overlapping a neighbouring cluster.
        const ringR = Math.max(80, Math.min(W, H) * 0.32);
        treatments.forEach((tx, i) => {
            const angle =
                (i / treatments.length) * 2 * Math.PI - Math.PI / 2;
            pos[tx.id] = {
                x: cx + Math.cos(angle) * ringR,
                y: cy + Math.sin(angle) * ringR,
            };
        });
        treatments.forEach(tx => {
            const c = pos[tx.id];
            if (!c) return;
            const pts = patients.filter(p => p.tx === tx.id);
            pts.forEach((pt, idx) => {
                const angle = (idx / Math.max(1, pts.length)) * 2 * Math.PI - Math.PI / 2;
                pos[pt.id] = {
                    x: c.x + Math.cos(angle) * 52,
                    y: c.y + Math.sin(angle) * 52,
                };
            });
        });
        return pos;
    }

    if (layout === 'outcome') {
        const cols: Record<string, number> = {
            success: W * 0.22,
            partial: W * 0.5,
            failure: W * 0.78,
        };
        const buckets: Record<string, Patient[]> = {
            success: [],
            partial: [],
            failure: [],
        };
        patients.forEach(pt => buckets[pt.out].push(pt));
        Object.entries(buckets).forEach(([out, pts]) => {
            pts.forEach((pt, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                pos[pt.id] = { x: cols[out] - 28 + col * 28, y: 90 + row * 52 };
            });
        });
        // Spread treatment nodes across the bottom row.
        const slot = W / (treatments.length + 1);
        treatments.forEach((tx, i) => {
            pos[tx.id] = { x: slot * (i + 1), y: H * 0.82 };
        });
        return pos;
    }

    return pos;
}
