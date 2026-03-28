'use client';

/**
 * AxeBoot — runs `@axe-core/react` in development only so a11y violations
 * surface in the browser console as soon as a regression is introduced.
 *
 * The dynamic-import pattern keeps axe out of the production bundle.
 * `process.env.NODE_ENV` is evaluated at build time, so the entire body
 * is dead-code-eliminated for `next build`.
 */

import { useEffect } from 'react';

export function AxeBoot() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        if (typeof window === 'undefined') return;

        // Lazy-load to keep axe (~250 KB) out of any non-dev path.
        Promise.all([import('react'), import('react-dom'), import('@axe-core/react')]).then(
            ([React, ReactDOM, axe]) => {
                axe.default(React.default, ReactDOM.default, 1000);
            },
        );
    }, []);

    return null;
}
