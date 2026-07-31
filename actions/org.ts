"use server";

import { clerkClient } from "@clerk/nextjs/server";

/**
 * Returns whether the given user is the SOLE admin of an org
 * and the list of promotable members.
 */
export async function getOrgAdminStatus(orgId: string, currentUserId: string) {
    try {
        const client = await clerkClient();
        const { data: memberships } = await client.organizations.getOrganizationMembershipList({
            organizationId: orgId,
            limit: 500,
        });

        const admins = memberships.filter(m => m.role === "org:admin");
        const isSoleAdmin = admins.length === 1 && admins[0].publicUserData?.userId === currentUserId;

        const promotableMembers = isSoleAdmin
            ? memberships
                .filter(m => m.role !== "org:admin" && m.publicUserData?.userId)
                .map(m => ({
                    userId: m.publicUserData!.userId!,
                    name: [m.publicUserData?.firstName, m.publicUserData?.lastName].filter(Boolean).join(" ") || "Member",
                    imageUrl: m.publicUserData?.imageUrl ?? "",
                }))
            : [];

        return { isSoleAdmin, promotableMembers };
    } catch {
        return { isSoleAdmin: false, promotableMembers: [] };
    }
}

/**
 * Promotes a member to org:admin role.
 */
export async function promoteMemberToAdmin(orgId: string, userId: string) {
    try {
        const client = await clerkClient();
        await client.organizations.updateOrganizationMembership({
            organizationId: orgId,
            userId,
            role: "org:admin",
        });
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to promote member." };
    }
}

/**
 * Gets the current user's memberships directly from the backend to bypass
 * client-side session cache delays. Used for real-time role change polling.
 */
export async function getCurrentUserMemberships(userId: string | null | undefined, _timestamp?: number) {
    if (!userId) return [];
    try {
        const client = await clerkClient();
        const { data: memberships } = await client.users.getOrganizationMembershipList({
            userId,
            limit: 50,
        });
        
        return memberships.map((m) => ({
            orgId: m.organization.id,
            orgName: m.organization.name,
            role: m.role,
        }));
    } catch {
        return [];
    }
}
