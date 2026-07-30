import { api } from "@/convex/_generated/api";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
}

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

/**
 * Checks if a user is currently an active member of a Clerk organization.
 * Returns false if they've been kicked or were never added.
 */
async function isClerkOrgMember(orgId: string, userId: string): Promise<boolean> {
    try {
        const client = await clerkClient();
        const { data: memberships } = await client.organizations.getOrganizationMembershipList({
            organizationId: orgId,
            limit: 500,
        });
        return memberships.some((m) => m.publicUserData?.userId === userId);
    } catch {
        // Clerk throws if org doesn't exist or request fails
        return false;
    }
}

export async function POST(request: Request){
    const authorization = await auth();
    const user = await currentUser();

    const { room } = await request.json();
    const board = await convex.query(api.board.getPublic, { id: room });

    // Handle unauthenticated guests
    if (!authorization || !user) {
        if (board?.isPublic) {
            const guestId = `guest_${Math.floor(Math.random() * 10000)}`;
            const session = liveblocks.prepareSession(guestId, {
                userInfo: { id: guestId, name: "Guest", picture: "", role: "viewer" }
            });
            session.allow(room, session.READ_ACCESS);
            const { status, body } = await session.authorize();
            return new Response(body, { status });
        }
        return new Response("Unauthorized", { status: 403 });
    }

    const userInfo = {
        id: user.id,
        name: user.firstName || "Anonymous",
        picture: user.imageUrl,
    };

    if (!room) {
        return new Response("Bad Request", { status: 400 });
    }

    // Case 1: User's active Clerk org matches the board's org → full access
    if (board?.orgId === authorization.orgId) {
        const session = liveblocks.prepareSession(user.id, { userInfo: { ...userInfo, role: "editor" } });
        session.allow(room, session.FULL_ACCESS);
        const { status, body } = await session.authorize();
        return new Response(body, { status });
    }

    if (board?.isPublic) {
        // Case 2: Check if user has an approved collab request
        const collabRequest = await convex.query(api.requests.getSingleRequest, {
            boardId: room as Id<"boards">,
            requesterId: user.id,
        });

        if (collabRequest?.status === "approved") {
            // Double-check: verify the user is still an actual Clerk org member.
            // If the owner kicked them via Clerk dashboard, revoke access immediately.
            const stillMember = await isClerkOrgMember(board.orgId, user.id);

            if (stillMember) {
                const session = liveblocks.prepareSession(user.id, { userInfo: { ...userInfo, role: "editor" } });
                session.allow(room, session.FULL_ACCESS);
                const { status, body } = await session.authorize();
                return new Response(body, { status });
            }

            // User was kicked — downgrade their Convex request to "rejected"
            // so the UI also reflects this on next render (best-effort, no await needed)
            if (collabRequest?._id) {
                convex.mutation(api.requests.revokeApproval, {
                    id: collabRequest._id as Id<"collabRequests">,
                }).catch(() => {}); // fire-and-forget
            }

            // Fall through to read access
        }

        // Case 3: Public board, no valid approval → read-only
        const session = liveblocks.prepareSession(user.id, { userInfo: { ...userInfo, role: "viewer" } });
        session.allow(room, session.READ_ACCESS);
        const { status, body } = await session.authorize();
        return new Response(body, { status });
    }

    // Case 4: Private board, wrong org → unauthorized
    return new Response("Unauthorized", { status: 403 });
}