"use client";

import { cn } from "@/src/lib/utils/utils";
import { MenuToggle } from "./menu-toggle";

interface RibbonMenuProps {
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export function RibbonMenu({ isExpanded, onToggle, children }: RibbonMenuProps) {
    return (
        <div
            className={cn(
                "fixed top-0 left-6 w-[60px] bg-card/50 border border-t-0 border-border",
                "rounded-b-[10px] backdrop-blur-[20px] z-[1001]",
                "shadow-[0_0_0_3px_rgba(99,102,241,0.2),0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden",
                isExpanded ? "h-auto max-h-[calc(100vh-2rem)]" : "h-[50px]"
            )}
            style={{
                transition: `all var(--ribbon-duration-menu, 600ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`,
                willChange: isExpanded ? 'height' : 'auto'
            }}
        >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

            <MenuToggle isExpanded={isExpanded} onClick={onToggle} />

            <div
                className={cn(
                    "pt-1 pb-2",
                    isExpanded ? "opacity-100 visible" : "opacity-0 invisible"
                )}
                style={{
                    transition: `all var(--ribbon-duration-content, 500ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`,
                    transitionDelay: isExpanded ? '150ms' : '0ms'
                }}
            >
                {children}
            </div>
        </div>
    );
}