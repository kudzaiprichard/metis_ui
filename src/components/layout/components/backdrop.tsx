"use client";

import { cn } from "@/src/lib/utils/utils";

interface BackdropProps {
    isVisible: boolean;
    onClick: () => void;
}

export function Backdrop({ isVisible, onClick }: BackdropProps) {
    return (
        <div
            className={cn(
                "fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]",
                isVisible ? "opacity-100 visible" : "opacity-0 invisible"
            )}
            style={{
                transition: `all var(--ribbon-duration-backdrop, 500ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`,
                willChange: isVisible ? 'opacity' : 'auto'
            }}
            onClick={onClick}
            aria-hidden="true"
        />
    );
}