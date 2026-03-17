"use client";

import { Hint } from "@/components/hints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
    src?: string;
    name?: string;
    fallback?: string;
    borderColor?: string;
};

export const UserAvatar = ({
    src,
    name,
    fallback,
    borderColor,
}: UserAvatarProps) => {
    return (
        <Hint label={name || "Teammate"} side="bottom" sideOffset={18}>
            <Avatar className="h-9 w-9 border-2" style={{ borderColor }}>
                <AvatarImage src={src} />
                <AvatarFallback className="text-xs font-semibold bg-slate-800 text-slate-200">
                    {fallback}
                </AvatarFallback>
            </Avatar>
        </Hint>
    )
}