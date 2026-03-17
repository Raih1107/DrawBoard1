"use client";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewBoardButtonProps {
    orgId: string;
    disabled?: boolean;
};

export const NewBoardButton = ({
    orgId,
    disabled,
}: NewBoardButtonProps) => {

    const router = useRouter();


    const {mutate,pending} = useApiMutation(api.board.create);

    const onClick = () => {
        mutate({
            orgId,
            title: "Untitled"
        })
        .then((id) => {
            toast.success("Board created");
            router.push(`/board/${id}`);
        })
        .catch(() => toast.error("Failed to create board"));
    }

    return(
        <button
            disabled={pending || disabled}
            onClick={onClick}
            className={cn(
                "col-span-1 aspect-[100/127] rounded-xl flex flex-col items-center justify-center py-6 transition-all duration-300 relative group overflow-hidden",
                (pending || disabled) 
                    ? "opacity-60 cursor-not-allowed bg-slate-800"
                    : "hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(99,102,241,0.25)]"
            )}
            style={!(pending || disabled) ? {
                background: "linear-gradient(135deg, rgba(79,70,229,0.9), rgba(124,58,237,0.9))",
                border: "1px solid rgba(255,255,255,0.15)"
            } : {
                border: "1px solid rgba(255,255,255,0.05)"
            }}
        >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            <Plus className="h-12 w-12 text-white stroke-1 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-sm text-white font-medium">
                New Board
            </p>
        </button>
    );
};