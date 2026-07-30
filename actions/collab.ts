"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function approveCollaborationRequest(orgId: string, userId: string) {
    try {
        const client = await clerkClient();
        
        await client.organizations.createOrganizationMembership({
            organizationId: orgId,
            userId: userId,
            role: "org:member"
        });

        return { success: true };
    } catch (error: any) {
        // If user is already a member, treat that as a success
        if (
            error?.clerkError === true ||
            error?.errors?.[0]?.code === "already_a_member_in_organization"
        ) {
            return { success: true, alreadyMember: true };
        }
        console.error("Clerk API error when adding user to organization:", error);
        return { error: error.message || "Unknown Clerk API Error" };
    }
}

/**
 * Called from the board page to verify an approved collaborator is still an
 * active Clerk org member. If they've been removed via the Clerk dashboard,
 * revokes their Convex collabRequest so the client instantly loses write access.
 */
export async function verifyAndRevokeAccess(
    orgId: string,
    userId: string,
    requestId: string,
) {
    try {
        const client = await clerkClient();
        const { data: memberships } = await client.organizations.getOrganizationMembershipList({
            organizationId: orgId,
            limit: 500,
        });

        const stillMember = memberships.some(m => m.publicUserData?.userId === userId);

        if (!stillMember) {
            await convex.mutation(api.requests.revokeApproval, {
                id: requestId as Id<"collabRequests">,
            });
            return { revoked: true };
        }

        return { revoked: false };
    } catch {
        return { revoked: false };
    }
}
