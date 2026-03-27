"use client";

import { Button } from "@/src/components/shadcn/button";
import { cn } from "@/src/lib/utils/utils";

interface MenuToggleProps {
    isExpanded: boolean;
    onClick: () => void;
}

export function MenuToggle({ isExpanded, onClick }: MenuToggleProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={cn(
                // No corner radius — the ribbon container already handles
                // rounded-b corners + the flush-top alignment. Square edges
                // here let the toggle read as the ribbon's "header band"
                // rather than a button floating on top of it.
                "w-[52px] sm:w-[60px] h-[50px] rounded-none border-b border-border/60",
                "hover:bg-white/[0.06]",
                isExpanded && "bg-primary/15 hover:bg-primary/20 border-b-primary/40"
            )}
            style={{
                transition: `background-color var(--ribbon-duration-toggle, 400ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1)), border-color var(--ribbon-duration-toggle, 400ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`
            }}
            aria-label="Toggle menu"
            aria-expanded={isExpanded}
        >
            <div className="w-6 h-6 flex flex-col justify-around py-1">
                <span
                    className={cn(
                        "block w-full h-0.5 rounded-sm",
                        isExpanded
                            ? "bg-primary rotate-45 translate-y-[7px]"
                            : "bg-foreground/85"
                    )}
                    style={{
                        transition: `all var(--ribbon-duration-toggle, 400ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`,
                        willChange: 'transform, background-color'
                    }}
                />
                <span
                    className={cn(
                        "block w-full h-0.5 rounded-sm",
                        isExpanded ? "opacity-0" : "bg-foreground/85"
                    )}
                    style={{
                        transition: `all var(--ribbon-duration-toggle, 400ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`,
                        willChange: 'opacity'
                    }}
                />
                <span
                    className={cn(
                        "block w-full h-0.5 rounded-sm",
                        isExpanded
                            ? "bg-primary -rotate-45 -translate-y-[7px]"
                            : "bg-foreground/85"
                    )}
                    style={{
                        transition: `all var(--ribbon-duration-toggle, 400ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`,
                        willChange: 'transform, background-color'
                    }}
                />
            </div>
        </Button>
    );
}