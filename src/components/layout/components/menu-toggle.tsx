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
                "w-[60px] h-[50px] rounded-none hover:bg-white/5",
                isExpanded && "bg-primary hover:bg-primary"
            )}
            style={{
                transition: `background-color var(--ribbon-duration-toggle, 400ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`
            }}
            aria-label="Toggle menu"
            aria-expanded={isExpanded}
        >
            <div className="w-6 h-6 flex flex-col justify-around py-1">
                <span
                    className={cn(
                        "block w-full h-0.5 rounded-sm",
                        isExpanded
                            ? "bg-primary-foreground rotate-45 translate-y-[7px]"
                            : "bg-foreground"
                    )}
                    style={{
                        transition: `all var(--ribbon-duration-toggle, 400ms) var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`,
                        willChange: 'transform, background-color'
                    }}
                />
                <span
                    className={cn(
                        "block w-full h-0.5 rounded-sm",
                        isExpanded ? "opacity-0" : "bg-foreground"
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
                            ? "bg-primary-foreground -rotate-45 -translate-y-[7px]"
                            : "bg-foreground"
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