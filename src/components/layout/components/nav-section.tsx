"use client";

import { Separator } from "@/src/components/shadcn/separator";
import { cn } from "@/src/lib/utils/utils";

interface NavSectionProps {
    children: React.ReactNode;
    className?: string;
    isLast?: boolean;
}

export function NavSection({ children, className, isLast = false }: NavSectionProps) {
    return (
        <div className={cn("py-2", className)}>
            <ul className="list-none flex flex-col gap-1.5 px-2">
                {children}
            </ul>
            {!isLast && <Separator className="mt-2 bg-border/60" />}
        </div>
    );
}