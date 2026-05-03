"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb as BreadcrumbRoot,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/src/components/shadcn/breadcrumb";

export function Breadcrumb() {
    const pathname = usePathname();

    const generateBreadcrumbs = () => {
        const paths = pathname.split("/").filter(Boolean);

        const formatLabel = (segment: string) => {
            return segment
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        };

        // Skip UUID-like segments in display but keep them in href
        const isUuid = (s: string) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

        const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

        paths.forEach((segment, index) => {
            const href = "/" + paths.slice(0, index + 1).join("/");
            const isLast = index === paths.length - 1;

            if (index === 0 && (segment === "doctor" || segment === "ml-engineer")) {
                breadcrumbs.push({ label: "Dashboard", href, isLast });
            } else if (isUuid(segment)) {
                breadcrumbs.push({ label: "Detail", href, isLast });
            } else {
                breadcrumbs.push({ label: formatLabel(segment), href, isLast });
            }
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <BreadcrumbRoot>
            <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                    <Fragment key={index}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                            {crumb.isLast ? (
                                <BreadcrumbPage className="text-primary font-medium">
                                    {crumb.label}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                        {crumb.label}
                                    </Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </BreadcrumbRoot>
    );
}