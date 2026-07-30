import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValues = v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("blocked")
);

export const create = mutation({
    args: {
        boardId: v.id("boards"),
        boardTitle: v.string(),
        orgId: v.string(),
        requesterId: v.string(),
        requesterName: v.string(),
    },
    handler: async (ctx, args) => {
        // Check for any existing request from this user for this board
        const existing = await ctx.db
            .query("collabRequests")
            .withIndex("by_board_and_user", (q) =>
                q.eq("boardId", args.boardId).eq("requesterId", args.requesterId)
            )
            .order("desc")
            .first();

        if (existing?.status === "blocked") {
            throw new Error("You have been blocked from requesting access to this board.");
        }

        if (existing?.status === "pending") {
            throw new Error("You already have a pending request for this board.");
        }

        // If previously rejected, update to pending (re-request)
        if (existing && (existing.status === "rejected")) {
            await ctx.db.patch(existing._id, { status: "pending" });
            return existing._id;
        }

        const requestId = await ctx.db.insert("collabRequests", {
            boardId: args.boardId,
            boardTitle: args.boardTitle,
            orgId: args.orgId,
            requesterId: args.requesterId,
            requesterName: args.requesterName,
            status: "pending",
        });

        return requestId;
    },
});

export const getPending = query({
    args: {
        orgIds: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const results = [];
        for (const orgId of args.orgIds) {
            const orgRequests = await ctx.db
                .query("collabRequests")
                .withIndex("by_org", (q) => q.eq("orgId", orgId))
                .filter((q) => q.eq(q.field("status"), "pending"))
                .collect();
            results.push(...orgRequests);
        }
        
        return results;
    },
});

/**
 * Allows a guest to subscribe to the live status of their own collaboration request.
 * Returns null if no request has been made yet.
 */
export const getSingleRequest = query({
    args: {
        boardId: v.id("boards"),
        requesterId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("collabRequests")
            .withIndex("by_board_and_user", (q) =>
                q.eq("boardId", args.boardId).eq("requesterId", args.requesterId)
            )
            .order("desc")
            .first();
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("collabRequests"),
        status: statusValues,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }
        await ctx.db.patch(args.id, { status: args.status });
    },
});

/**
 * Called server-side (from liveblocks-auth) when a previously-approved user
 * is no longer a Clerk org member. Revokes their collab approval.
 */
export const revokeApproval = mutation({
    args: {
        id: v.id("collabRequests"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: "rejected" });
    },
});
