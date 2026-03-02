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
        <div className={cn("py-1", className)}>
            <ul className="list-none flex flex-col gap-[0.15rem] px-[0.375rem]">
                {children}
            </ul>
            {!isLast && <Separator className="mt-1 bg-border" />}
        </div>
    );
}