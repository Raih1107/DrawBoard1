import { defineSchema, defineTable } from "convex/server";
import {v} from "convex/values";




export default defineSchema({
    boards: defineTable({
        title: v.string(),
        orgId: v.string(),
        authorId: v.string(),
        authorName: v.string(),
        imageUrl: v.string(),
        viewCount: v.optional(v.number()),
        isPublic: v.optional(v.boolean()),
    })
        .index("by_org", ["orgId"])
        .searchIndex("search_title" , {
            searchField: "title",
            filterFields: ["orgId"]
        }),


    userFavourites: defineTable({
        orgId: v.string(),
        userId: v.string(),
        boardId: v.id("boards"),

    })
    .index("by_board", ["boardId"])
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_board", ["userId", "boardId"])
    .index("by_user_board_org", ["userId", "boardId", "orgId"]),

    collabRequests: defineTable({
        boardId: v.id("boards"),
        boardTitle: v.string(),
        requesterId: v.string(),
        requesterName: v.string(),
        orgId: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected"),
            v.literal("blocked")
        ),
    })
    .index("by_org", ["orgId"])
    .index("by_board_and_user", ["boardId", "requesterId"]),
});