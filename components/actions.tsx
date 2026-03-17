"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ghost, Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { ConfirmModal } from "./confirm-modal";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionsProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    id: string ;
    title: string ;
}


export const Actions = ({
    children,
    side,
    sideOffset,
    id,
    title,

} : ActionsProps) => {

    const { onOpen } = useRenameModal();

    const {mutate, pending} = useApiMutation(api.board.remove);


    const onCopyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/board/${id}`,
        )
        .then(() => toast.success("Link copied") )
        .catch(() => toast.error("Failed to copy link"))
    }

    const onDelete = () => {
        mutate({id}) 
            .then(() => toast.success("Board deleted"))
            .catch(() => toast.error("Failed to delete board"));
        
    }

    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                side={side}
                onClick={(e) => e.stopPropagation()}
                sideOffset={sideOffset}
                className="w-60 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-xl"
                style={{
                    background: "rgba(15,17,23,0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)"
                }}
            >
                <DropdownMenuItem
                    onClick={onCopyLink}
                    className="p-3 cursor-pointer rounded-lg hover:bg-white/5 transition-colors focus:bg-white/5 focus:text-white"
                >
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy board link
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => onOpen(id, title)}
                    className="p-3 cursor-pointer rounded-lg hover:bg-white/5 transition-colors focus:bg-white/5 focus:text-white"
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                </DropdownMenuItem>

                <ConfirmModal
                    header="Delete board?"
                    description="This will delete the board and all of its contents."
                    disabled={pending}
                    onConfirm={onDelete}
                >
                    <Button
                        variant="ghost"
                        className="p-3 text-sm justify-start w-full font-normal cursor-pointer rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/80 transition-all"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete 
                    </Button>
                </ConfirmModal>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}