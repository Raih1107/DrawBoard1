import { v } from "convex/values";
import { mutation } from "./_generated/server";



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
        console.log(randomImage, "TEST");

        const board = await ctx.db.insert("boards", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            imageUrl: randomImage,
        });

        return board;
    }
})