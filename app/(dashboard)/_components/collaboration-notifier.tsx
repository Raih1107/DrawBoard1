"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganizationList } from "@clerk/nextjs";
import { useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, ShieldAlert } from "lucide-react";

import { approveCollaborationRequest } from "@/actions/collab";

/**
 * Global headless component that watches all orgs the current user is an admin of
 * for pending collaboration requests, and surfaces them as toasts.
 * 
 * Must be mounted in the root layout so it works everywhere (dashboard + board page).
 */
export const CollaborationNotifier = () => {
    const { userMemberships, isLoaded } = useOrganizationList({
        userMemberships: { infinite: false },
    });

    const adminOrgIds = useMemo(() => {
        if (!isLoaded || !userMemberships?.data) return [];
        return userMemberships.data
            .filter(m => m.role === 'org:admin' || m.role === 'admin')
            .map(m => m.organization.id);
    }, [isLoaded, userMemberships.data]);

    // Subscribe to pending requests for ALL orgs the user is an admin of
    const pendingRequests = useQuery(
        api.requests.getPending,
        adminOrgIds.length > 0 ? { orgIds: adminOrgIds } : "skip"
    );

    const updateStatus = useMutation(api.requests.updateStatus);
    // Track which request IDs have already been shown as toasts
    const notifiedIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!pendingRequests) return;

        pendingRequests.forEach((req: any) => {
            // Skip if we've already shown this toast
            if (notifiedIds.current.has(req._id)) return;
            notifiedIds.current.add(req._id);

            toast.custom(() => (
                <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl w-80 space-y-4 font-sans">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-base">✨</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm leading-tight">Collaboration Request</p>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                <span className="text-slate-200 font-medium">{req.requesterName}</span>
                                {" wants to edit "}
                                <span className="text-indigo-400 font-medium break-words">&ldquo;{req.boardTitle}&rdquo;</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-1.5 w-full">
                        <button
                            className="flex-1 flex flex-col items-center justify-center gap-1 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all group"
                            onClick={async () => {
                                await updateStatus({ id: req._id, status: "rejected" });
                                toast.dismiss(req._id);
                                notifiedIds.current.delete(req._id); // Allow re-notification if guest re-requests
                                toast.error(`Rejected ${req.requesterName}.`, { duration: 3000 });
                            }}
                        >
                            <XCircle className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                            <span className="text-[10px] font-medium leading-none">Reject</span>
                        </button>

                        <button
                            className="flex-1 flex flex-col items-center justify-center gap-1 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 hover:border-red-500/30 transition-all group"
                            onClick={async () => {
                                await updateStatus({ id: req._id, status: "blocked" });
                                toast.dismiss(req._id);
                                notifiedIds.current.delete(req._id);
                                toast.error(`Blocked ${req.requesterName}.`, { duration: 3000 });
                            }}
                        >
                            <ShieldAlert className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                            <span className="text-[10px] font-medium leading-none">Block</span>
                        </button>
                        
                        <button
                            className="flex-1 flex flex-col items-center justify-center gap-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-900/40"
                            onClick={async () => {
                                toast.dismiss(req._id);
                                notifiedIds.current.delete(req._id);
                                const res = await approveCollaborationRequest(req.orgId, req.requesterId);
                                if (res.error) {
                                    await updateStatus({ id: req._id, status: "approved" });
                                    toast.warning(`Added to org (Clerk note: ${res.error})`, { duration: 5000 });
                                } else {
                                    await updateStatus({ id: req._id, status: "approved" });
                                    toast.success(`✅ ${req.requesterName} can now collaborate!`, { duration: 4000 });
                                }
                            }}
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold leading-none">Approve</span>
                        </button>
                    </div>
                </div>
            ), {
                id: req._id,
                duration: 60000,
            });
        });
    // Re-run any time the pendingRequests array changes (new entries added in real-time by Convex)
    }, [pendingRequests, updateStatus]);

    return null;
};
