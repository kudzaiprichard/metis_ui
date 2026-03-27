"use client";

import { ReactNode } from "react";
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
    icon: ReactNode;
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
                            variant="ghost"
                            size="icon"
                            asChild
                            className={cn(
                                "w-[44px] h-[44px] rounded-lg text-lg",
                                "transition-colors duration-200",
                                isActive
                                    ? "bg-primary/15 hover:bg-primary/20 ring-1 ring-inset ring-primary/30"
                                    : "hover:bg-white/[0.06] hover:ring-1 hover:ring-inset hover:ring-white/10",
                            )}
                        >
                            <Link href={href} onClick={onClick}>
                                <span
                                    className="inline-flex h-5 w-5 items-center justify-center [&_svg]:h-5 [&_svg]:w-5 transition-colors"
                                    style={{ color: isActive ? 'var(--primary)' : color }}
                                >
                                    {icon}
                                </span>
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