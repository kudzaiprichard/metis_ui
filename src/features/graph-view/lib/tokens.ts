export type Outcome = 'success' | 'partial' | 'failure';

export const TOKENS = {
    bg: '#070e0b',
    surface: '#0a1410',
    card: '#0d1a15',
    border: '#162820',
    border2: '#1e3428',
    muted: '#2a4a38',
    dim: '#3d6050',
    mid: '#6b8f7a',
    text: '#c8ddd4',
    green: '#34c77b',
    orange: '#e07b3a',
    red: '#d94f4f',
    teal: '#2ec4b0',
    yellow: '#e8c44a',
    fontSans: "'IBM Plex Sans', sans-serif",
    fontMono: "'IBM Plex Mono', monospace",
} as const;

export const OUT_COLOR: Record<Outcome, string> = {
    success: TOKENS.green,
    partial: TOKENS.orange,
    failure: TOKENS.red,
};

export const OUT_ICON: Record<Outcome, string> = {
    success: '✓',
    partial: '◐',
    failure: '✕',
};
