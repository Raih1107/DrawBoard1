import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        orgId: v.string(),
        userId: v.string(),
        orgName: v.string(),
        newRole: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        // We clean up old updates for this user so they don't get spammed if they log in later
        const existing = await ctx.db
            .query("roleUpdates")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
            
        for (const record of existing) {
            await ctx.db.delete(record._id);
        }

        const id = await ctx.db.insert("roleUpdates", {
            orgId: args.orgId,
            userId: args.userId,
            orgName: args.orgName,
            newRole: args.newRole,
        });

        return id;
    },
});

export const consume = mutation({
    args: {
        id: v.id("roleUpdates"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }
        await ctx.db.delete(args.id);
    },
});

export const getMyUpdates = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        return await ctx.db
            .query("roleUpdates")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});
