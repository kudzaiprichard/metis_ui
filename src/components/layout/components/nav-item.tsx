"use client";

import { Button } from "@/src/components/shadcn/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/src/components/shadcn/tooltip";
import { cn } from "@/src/lib/utils/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
    icon: string;
    label: string;
    href: string;
    color: string;
    onClick?: () => void;
}

export function NavItem({ icon, label, href, color, onClick }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + '/');

    return (
        <li className="relative">
            <TooltipProvider delayDuration={0}>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button
                            variant={isActive ? "default" : "ghost"}
                            size="icon"
                            asChild
                            className={cn(
                                "w-[44px] h-[44px] rounded-lg text-lg",
                                !isActive && "hover:bg-white/8",
                            )}
                            style={{
                                transition: `all 200ms var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`
                            }}
                        >
                            <Link href={href} onClick={onClick}>
                                <i className={icon} style={{ color: isActive ? undefined : color }} />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        sideOffset={15}
                        className="bg-card/90 border-border backdrop-blur-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                        style={{ zIndex: 1003 }}
                    >
                        <p className="font-medium text-foreground">{label}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </li>
    );
}