"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useEffect, useState, useTransition } from "react";
import { ShieldAlert, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { getOrgAdminStatus, promoteMemberToAdmin } from "@/actions/org";
import { toast } from "sonner";
import Image from "next/image";

interface PromotableMember {
    userId: string;
    name: string;
    imageUrl: string;
}

export const SoleAdminBanner = () => {
    const { organization } = useOrganization();
    const { user } = useUser();

    const [isSoleAdmin, setIsSoleAdmin] = useState(false);
    const [members, setMembers] = useState<PromotableMember[]>([]);
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [promotingId, setPromotingId] = useState<string | null>(null);

    useEffect(() => {
        if (!organization?.id || !user?.id) return;

        getOrgAdminStatus(organization.id, user.id).then(({ isSoleAdmin, promotableMembers }) => {
            setIsSoleAdmin(isSoleAdmin);
            setMembers(promotableMembers);
        });
    }, [organization?.id, user?.id]);

    if (!isSoleAdmin) return null;

    const handlePromote = (member: PromotableMember) => {
        if (!organization?.id) return;
        setPromotingId(member.userId);

        startTransition(async () => {
            const result = await promoteMemberToAdmin(organization.id, member.userId);
            if (result.error) {
                toast.error(`Failed to promote: ${result.error}`);
            } else {
                toast.success(`✅ ${member.name} is now an admin!`);
                setIsSoleAdmin(false);
                setOpen(false);
            }
            setPromotingId(null);
        });
    };

    return (
        <div className="w-full px-4 py-2 flex items-center gap-3 text-sm"
            style={{
                background: "linear-gradient(90deg, rgba(234,88,12,0.15) 0%, rgba(234,88,12,0.08) 100%)",
                borderBottom: "1px solid rgba(234,88,12,0.3)",
            }}
        >
            <ShieldAlert className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-orange-200 text-xs font-medium flex-1">
                <span className="text-orange-300 font-semibold">You are the only admin.</span>
                {" "}Promote a member to admin before leaving — otherwise, no one can manage collaboration requests.
            </p>

            {members.length > 0 ? (
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    >
                        Promote a member
                        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>

                    {open && (
                        <div className="absolute right-0 top-[120%] z-[9999] bg-slate-900 border border-white/10 rounded-xl shadow-2xl min-w-[220px] overflow-hidden flex flex-col"
                            onMouseLeave={() => setOpen(false)}
                        >
                            <div className="text-[10px] text-white/40 px-3 py-2 uppercase tracking-wider font-bold border-b border-white/5">
                                Select a member to promote
                            </div>
                            {members.map(m => (
                                <button
                                    key={m.userId}
                                    disabled={isPending}
                                    onClick={() => handlePromote(m)}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
                                >
                                    {m.imageUrl ? (
                                        <Image src={m.imageUrl} alt={m.name} width={28} height={28} className="rounded-full flex-shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {m.name[0]}
                                        </div>
                                    )}
                                    <span className="text-xs text-slate-200 font-medium flex-1 truncate">{m.name}</span>
                                    {promotingId === m.userId ? (
                                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-400 transition-colors" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <span className="text-orange-400/70 text-xs italic flex-shrink-0">
                    No members to promote yet
                </span>
            )}
        </div>
    );
};
