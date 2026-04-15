/**
 * Theme utilities — small helpers for components that need actual colour
 * strings (e.g. recharts SVG attributes) instead of class names.
 *
 * Most styling lives in Tailwind classes and reads CSS variables directly via
 * `var(--token)`. Recharts attributes that resolve to SVG `stroke` / `fill`
 * accept `var(--token)` strings, so prefer that pattern. Use `getThemeColor`
 * only when you genuinely need a resolved colour string at runtime (e.g. a
 * canvas API that won't evaluate `var()`).
 */

/**
 * Returns a `var(--name)` reference. Prefer this over hex literals so chart
 * colours track the design tokens defined in `app/globals.css`.
 */
export function themeVar(name: string): string {
    return `var(--${name})`;
}

/**
 * Reads the resolved value of a CSS variable from `:root`. Returns the raw
 * computed string (e.g. an `oklch(...)` value). Browser-only — calling this
 * during SSR returns an empty string.
 */
export function getThemeColor(name: string): string {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return '';
    }
    return getComputedStyle(document.documentElement)
        .getPropertyValue(`--${name}`)
        .trim();
}
