import { v } from "convex/values";
import { mutation, query } from "./_generated/server";



const images = [
    "/placeholders/s1.svg",
    "/placeholders/s2.svg",
    "/placeholders/s3.svg",
    "/placeholders/s4.svg",
    "/placeholders/s5.svg",
    "/placeholders/s6.svg",
    "/placeholders/s7.svg",
    "/placeholders/s8.svg",
    "/placeholders/s9.svg",
    "/placeholders/s10.svg",
    "/placeholders/s11.svg",
    "/placeholders/s12.svg",
    "/placeholders/s13.svg",
    "/placeholders/s14.svg",
    "/placeholders/s15.svg",
    "/placeholders/s16.svg",
    "/placeholders/s17.svg",
    "/placeholders/s18.svg",
    "/placeholders/s19.svg",
    "/placeholders/s20.svg",

]


export const create = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized");
        }

        const randomImage = images[Math.floor(Math.random()* images.length)];
        

        const board = await ctx.db.insert("boards", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            imageUrl: randomImage,
            viewCount: 0,
            isPublic: false,
        });

        return board;
    }
})



export const remove = mutation({
    args: { id: v.id("boards") },
    handler: async (ctx , args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;
        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex("by_user_board", (q) => 
                q
                    .eq("userId", userId)
                    .eq("boardId", args.id)
            )
            .unique();

            if(existingFavourite) {
                await ctx.db.delete(existingFavourite._id);
            }
        
        await ctx.db.delete(args.id);
    },

    
});


export const update = mutation({
    args: {id: v.id("boards"), title: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized")
        }
        const title = args.title.trim();

        if(!title) {
            throw new Error("Title is required");
        }

        if(title.length > 60){
            throw new Error("Title cannot be longer than 60 characters")
        }

        const board = await ctx.db.patch(args.id, {
            title: args.title,
        });

        return board;

    },
});



export const favourite = mutation({
    args: { id: v.id("boards"), orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);

        if(!board){
            throw new Error("Board not found");
        }

        const userId = identity.subject;

        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex("by_user_board_org", (q) => 
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
                    .eq("orgId", args.orgId)
            )
            .unique();

            if(existingFavourite) {
                throw new Error("Board already favourited.");
            }

            await ctx.db.insert("userFavourites", {
                userId,
                boardId: board._id, 
                orgId: args.orgId,
            
            });

            return board;


    }

})



export const unFavourite = mutation({
    args: { id: v.id("boards"), orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);

        if(!board){
            throw new Error("Board not found");
        }

        const userId = identity.subject;

        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex("by_user_board_org", (q) => 
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
                    .eq("orgId", board.orgId)
            )
            .unique();

            if(!existingFavourite) {
                throw new Error("Favourited board not found");
            }

            await ctx.db.delete(existingFavourite._id);

            return board;


    }

})


export const get = query({
    args: { id: v.id("boards")},
    handler: async (ctx, args) => {
        const board = await ctx.db.get(args.id);

        return board;
    },
});

// ─── NEW: Public read (no auth required) ────────────────────────────────────

/** Fetch a board without requiring authentication. Used for public view mode. */
export const getPublic = query({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        const board = await ctx.db.get(args.id);
        return board;
    },
});

// ─── NEW: View count ─────────────────────────────────────────────────────────

/**
 * Increment the view counter each time a board is opened.
 * Does NOT require the user to be authenticated (public boards are viewable
 * without login), so we intentionally skip the identity check here.
 */
export const incrementViewCount = mutation({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        const board = await ctx.db.get(args.id);
        if (!board) return;

        await ctx.db.patch(args.id, {
            viewCount: (board.viewCount ?? 0) + 1,
        });
    },
});

// ─── NEW: Toggle public / private ────────────────────────────────────────────

/**
 * Flip the isPublic flag on a board.
 * Only the board's author is allowed to do this.
 */
export const togglePublic = mutation({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);

        if (!board) {
            throw new Error("Board not found");
        }

        if (board.authorId !== identity.subject) {
            throw new Error("Only the board author can change its visibility");
        }

        await ctx.db.patch(args.id, {
            isPublic: !(board.isPublic ?? false),
        });

        return { isPublic: !(board.isPublic ?? false) };
    },
});