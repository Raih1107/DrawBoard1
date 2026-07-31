"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@clerk/nextjs";

/**
 * Headless component mounted in the root layout.
 * Subscribes via WebSockets to Convex for any role updates pushed from an Admin.
 */
export const RoleChangeNotifier = () => {
    const updates = useQuery(api.roleUpdates.getMyUpdates);
    const consume = useMutation(api.roleUpdates.consume);
    const { session } = useSession();

    useEffect(() => {
        if (!updates || updates.length === 0) return;

        // For each new update we received over the websocket socket
        updates.forEach((update) => {
            if (update.newRole === "org:admin") {
                toast.success("You have been promoted to admin!", {
                    description: `You can now manage collaboration requests in "${update.orgName}".`,
                    duration: 8000,
                });
            } else {
                toast.warning("You have been demoted to member.", {
                    description: `Your admin rights in "${update.orgName}" have been removed.`,
                    duration: 8000,
                });
            }

            // Immediately mark it as consumed in DB so it doesn't show again on reload
            consume({ id: update._id });

            // CRITICAL: Force Clerk to fetch a new JWT token containing the new role permissions
            if (session) {
                session.reload();
            }
        });
    }, [updates, consume, session]);

    return null;
};
