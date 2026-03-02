"use client";

import { useState, useCallback } from "react";

export function useRibbonMenu() {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggle = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const open = useCallback(() => {
        setIsExpanded(true);
    }, []);

    const close = useCallback(() => {
        setIsExpanded(false);
    }, []);

    return {
        isExpanded,
        toggle,
        open,
        close,
    };
}