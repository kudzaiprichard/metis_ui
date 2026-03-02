"use client";

import { useEffect, useState } from "react";
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
import { normalizeUserRole, UserRole, User } from "@/src/features/auth/api/auth.types";
import { authApi } from "@/src/features/auth/api/auth.api";
import { clearAuthTokens } from "@/src/lib/utils/auth";
import { ApiError } from "@/src/lib/types";
import { toast } from "sonner";
import { ScrollArea } from "@/src/components/shadcn/scroll-area";

export function SystemLayout({ children }: SystemLayoutProps) {
    const router = useRouter();
    const { user: authUser, isLoading: isAuthLoading } = useAuth();
    const { isExpanded, toggle, close } = useRibbonMenu();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authApi.getMe();
                setUser(userData);
            } catch (err) {
                if (err instanceof ApiError) {
                    console.error("Failed to fetch user:", err.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

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

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen text-foreground flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!authUser || !user) {
        return null;
    }

    const normalizedRole = normalizeUserRole(authUser.role);
    const navigation =
        normalizedRole === UserRole.ML_ENGINEER
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
                user={user}
                isMenuExpanded={isExpanded}
                onLogout={handleLogout}
            />

            <main className="relative z-[1] h-screen">
                <ScrollArea className="h-full">
                    <div className="px-8 py-6 max-w-[1500px] mx-auto">
                        {children}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}