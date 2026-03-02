"use client";

import { Avatar, AvatarFallback } from "@/src/components/shadcn/avatar";
import { Button } from "@/src/components/shadcn/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/shadcn/dropdown-menu";
import { cn } from "@/src/lib/utils/utils";
import { LogOut } from "lucide-react";
import { User, normalizeUserRole } from "@/src/features/auth/api/auth.types";

interface ProfileDropdownProps {
    user: User;
    onLogout: () => void;
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const userInitials = getInitials(user.first_name, user.last_name);
    const userName = `${user.first_name} ${user.last_name}`;
    const userRole = normalizeUserRole(user.role).replace('_', ' ');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "w-12 h-12 bg-card/30 border-border rounded-[10px]",
                        "backdrop-blur-[20px] hover:bg-white/8 hover:border-primary",
                        "hover:scale-105 relative p-0"
                    )}
                    style={{
                        transition: `all 200ms var(--ribbon-easing, cubic-bezier(0.16, 1, 0.3, 1))`
                    }}
                >
                    <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[0.8125rem]">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 bg-card/90 border-border backdrop-blur-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                style={{ zIndex: 1003 }}
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                            {userName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer hover:bg-white/8 focus:bg-white/8"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}