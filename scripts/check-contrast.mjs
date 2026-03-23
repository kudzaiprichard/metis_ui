#!/usr/bin/env node
/**
 * Contrast-ratio audit for the design tokens defined in `app/globals.css`.
 *
 * The audit (`.docs/audit.md` finding 6.6) flagged `--muted-foreground` for
 * sitting below WCAG AA 4.5:1 against `--background`. Phase 0 raised the
 * value, but nothing prevents a future commit from regressing it. This
 * script parses the `:root` block and asserts every documented foreground
 * token meets AA against its paired background.
 *
 * Run via `npm run check:contrast` (also wired into the lint task).
 *
 * Limitations:
 *   - Only handles `#rrggbb` and `#rgb` literals; tokens defined as
 *     `oklch()` / `rgba()` are skipped with a warning.
 *   - Pairings are listed below — extend `PAIRS` if a new semantic token
 *     pair starts being used as body text.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, '..', 'app', 'globals.css');
const css = readFileSync(cssPath, 'utf8');

// Pull the `:root { ... }` block. We don't audit `.dark` separately because
// the project ships dark-only and `.dark` mirrors `:root` 1:1.
const rootMatch = css.match(/:root\s*{([\s\S]*?)}/);
if (!rootMatch) {
    console.error('check-contrast: could not find :root block in globals.css');
    process.exit(1);
}

const tokens = new Map();
for (const line of rootMatch[1].split('\n')) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
    if (m) tokens.set(m[1], m[2].trim());
}

function parseHex(value) {
    const m = value.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

function relLuminance([r, g, b]) {
    const channel = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
    const la = relLuminance(a);
    const lb = relLuminance(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}

const AA_BODY = 4.5;
const AA_LARGE = 3.0;

const PAIRS = [
    { fg: '--foreground', bg: '--background', threshold: AA_BODY, role: 'body text' },
    { fg: '--muted-foreground', bg: '--background', threshold: AA_BODY, role: 'muted body text' },
    { fg: '--primary-foreground', bg: '--primary', threshold: AA_BODY, role: 'primary button text' },
    { fg: '--info-foreground', bg: '--info', threshold: AA_BODY, role: 'info badge text' },
    { fg: '--warning-foreground', bg: '--warning', threshold: AA_BODY, role: 'warning badge text' },
    { fg: '--info', bg: '--background', threshold: AA_LARGE, role: 'info accent (large)' },
    { fg: '--warning', bg: '--background', threshold: AA_LARGE, role: 'warning accent (large)' },
    { fg: '--destructive', bg: '--background', threshold: AA_LARGE, role: 'destructive accent (large)' },
];

let failures = 0;
let skipped = 0;

for (const { fg, bg, threshold, role } of PAIRS) {
    const fgValue = tokens.get(fg);
    const bgValue = tokens.get(bg);
    if (!fgValue || !bgValue) {
        console.warn(`SKIP  ${role}: token missing (${fg}=${fgValue}, ${bg}=${bgValue})`);
        skipped += 1;
        continue;
    }
    const fgRgb = parseHex(fgValue);
    const bgRgb = parseHex(bgValue);
    if (!fgRgb || !bgRgb) {
        console.warn(`SKIP  ${role}: non-hex token (${fg}=${fgValue}, ${bg}=${bgValue})`);
        skipped += 1;
        continue;
    }
    const ratio = contrast(fgRgb, bgRgb);
    const status = ratio >= threshold ? 'PASS' : 'FAIL';
    if (status === 'FAIL') failures += 1;
    console.log(
        `${status}  ${role.padEnd(28)}  ${fg} on ${bg}  ${ratio.toFixed(2)}:1  (≥ ${threshold.toFixed(1)})`,
    );
}

if (failures > 0) {
    console.error(`\ncheck-contrast: ${failures} pair(s) failed WCAG AA`);
    process.exit(1);
}
console.log(`\ncheck-contrast: ${PAIRS.length - skipped} pair(s) passed, ${skipped} skipped.`);
