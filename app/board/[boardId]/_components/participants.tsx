"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOthers, useSelf } from "@liveblocks/react";
import { UserAvatar } from "./user-avatar";
import { connectionIdToColor } from "@/lib/utils";

const MAX_SHOWN_USERS = 2;

export const Participants = () => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > MAX_SHOWN_USERS;

    return (
        <div className="absolute top-4 right-4 h-12 flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-3 rounded-xl select-none"
            style={{
                background: "rgba(15,17,23,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            <div className="flex gap-x-2">
                {users.slice(0, MAX_SHOWN_USERS).map(({ connectionId, info }) => {
                    return (
                        <UserAvatar 
                            borderColor={connectionIdToColor(connectionId)}
                            key={connectionId}
                            src={info?.picture}
                            name={info?.name}
                            fallback={info?.name?.[0] || "T"}
                        />
                    )
                })}

                {currentUser && (
                    <UserAvatar 
                        borderColor={connectionIdToColor(currentUser.connectionId)}
                        src={currentUser.info?.picture}
                        name={`${currentUser.info?.name} (You)`}
                        fallback={currentUser.info?.name?.[0]}
                    />
                )}

                {hasMoreUsers && (
                    <UserAvatar 
                        name={`${users.length - MAX_SHOWN_USERS} more`}
                        fallback={`+${users.length - MAX_SHOWN_USERS}`}
                    />
                )}
            </div>
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