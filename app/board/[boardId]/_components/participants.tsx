"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOthers, useSelf } from "@liveblocks/react";
import { UserAvatar } from "./user-avatar";
import { connectionIdToColor } from "@/lib/utils";
import { useState, useRef } from "react";

const MAX_SHOWN_USERS = 3;

export const Participants = () => {
    // Only fetch other users that actually have editor permissions
    const allOthers = useOthers();
    const otherEditors = allOthers.filter(other => other.info?.role === "editor");
    
    // Check if the current user is an editor
    const currentUser = useSelf();
    const isEditing = currentUser?.info?.role === "editor";

    // Combine into a single prioritized array of collaborators
    const allEditors = [...otherEditors];
    if (isEditing && currentUser) {
        allEditors.unshift(currentUser as any);
    }

    // De-duplicate by user ID so opening multiple tabs doesn't clutter the avatar bar
    const uniqueEditors = Array.from(
        new Map(allEditors.map((user) => [user.info?.id || user.connectionId, user])).values()
    );
    
    const visibleEditors = uniqueEditors.slice(0, MAX_SHOWN_USERS);
    const hiddenEditors = uniqueEditors.slice(MAX_SHOWN_USERS);
    const hasMoreUsers = hiddenEditors.length > 0;

    // Hover UI State
    const [isHovering, setIsHovering] = useState(false);
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        hideTimeout.current = setTimeout(() => {
            setIsHovering(false);
        }, 300);
    };

    return (
        <div 
            className="absolute top-4 right-4 flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-3 py-1.5 rounded-xl select-none"
            style={{
                background: "rgba(15,17,23,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)"
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex gap-x-2 relative">
                {visibleEditors.map((user) => {
                    const isMe = user.connectionId === currentUser?.connectionId;
                    return (
                        <UserAvatar 
                            borderColor={connectionIdToColor(user.connectionId)}
                            key={user.connectionId}
                            src={user.info?.picture}
                            name={isMe ? `${user.info?.name} (You)` : user.info?.name}
                            fallback={user.info?.name?.[0] || "T"}
                        />
                    )
                })}

                {hasMoreUsers && (
                    <UserAvatar 
                        name={`${hiddenEditors.length} more`}
                        fallback={`+${hiddenEditors.length}`}
                        borderColor="transparent"
                    />
                )}
            </div>

            {hasMoreUsers && isHovering && (
                <div 
                    className="absolute top-[120%] right-0 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 min-w-[220px] flex flex-col gap-2 z-[1000] animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className="text-[10px] text-white/50 px-2 pt-1 uppercase tracking-wider font-bold">Other Collaborators</div>
                    <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                        {hiddenEditors.map((user) => (
                            <div key={user.connectionId} className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-default">
                                <div className="scale-75 origin-left">
                                    <UserAvatar 
                                        borderColor={connectionIdToColor(user.connectionId)}
                                        src={user.info?.picture}
                                        name=""
                                        fallback={user.info?.name?.[0] || "T"}
                                    />
                                </div>
                                <span className="text-xs text-white/90 font-medium truncate -ml-2">{user.info?.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
};

export const ParticipantsSkeleton = () => {
    return (
        <div className="absolute top-4 right-4 h-12 flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-3 rounded-xl w-[100px]"
            style={{
                background: "rgba(15,17,23,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            <Skeleton className="h-full w-full bg-white/5 rounded-lg" />
        </div>
    )
}