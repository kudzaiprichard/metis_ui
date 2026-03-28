"use client";

import { useRouter } from "next/navigation";
import "./styles.css";
import { RibbonMenu } from "./components/ribbon-menu";
import { NavSection } from "./components/nav-section";
import { NavItem } from "./components/nav-item";
import { TopActions } from "./components/top-actions";
import { Backdrop } from "./components/backdrop";
import { Breadcrumb } from "./components/breadcrumb";
import { useRibbonMenu } from "./hooks/use-ribbon-menu";
import { doctorNavigation, mlEngineerNavigation } from "./config/navigation";
import { SystemLayoutProps } from "./types";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { normalizeUserRole, UserRole } from "@/src/features/auth/api/auth.types";
import { authApi } from "@/src/features/auth/api/auth.api";
import { clearAuthTokens } from "@/src/lib/utils/auth";
import { toast } from "sonner";
import { ScrollArea } from "@/src/components/shadcn/scroll-area";
import { PageLoader } from "@/src/components/shared/ui/page-loader";

export function SystemLayout({ children }: SystemLayoutProps) {
    const router = useRouter();
    const { user: authUser, isLoading: isAuthLoading } = useAuth();
    const { isExpanded, toggle, close } = useRibbonMenu();

    const handleNavItemClick = () => {
        close();
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            clearAuthTokens();
            toast.success("Logged Out", {
                description: "You have been successfully logged out.",
                position: "top-right",
            });
            router.push("/login");
        } catch (err) {
            clearAuthTokens();
            router.push("/login");
        }
    };

    if (isAuthLoading) {
        return <PageLoader isLoading fullPage loadingText="Loading..." />;
    }

    if (!authUser) {
        return null;
    }

    const normalizedRole = normalizeUserRole(authUser.role);
    const navigation =
        normalizedRole === UserRole.ADMIN
            ? mlEngineerNavigation
            : doctorNavigation;

    return (
        <div className="min-h-screen text-foreground">
            <Backdrop isVisible={isExpanded} onClick={close} />

            <RibbonMenu isExpanded={isExpanded} onToggle={toggle}>
                {navigation.map((section, index) => (
                    <NavSection
                        key={index}
                        isLast={index === navigation.length - 1}
                    >
                        {section.items.map((item) => (
                            <NavItem
                                key={item.href}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                color={item.color}
                                onClick={handleNavItemClick}
                            />
                        ))}
                    </NavSection>
                ))}
            </RibbonMenu>

            <TopActions
                user={authUser}
                isMenuExpanded={isExpanded}
                onLogout={handleLogout}
                onCloseRibbon={close}
            />

            <main className="relative z-[1] h-screen">
                <ScrollArea className="h-full">
                    <div className="px-4 sm:px-8 lg:px-12 py-6 max-w-[1600px] mx-auto">
                        <Breadcrumb />
                        {children}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}
