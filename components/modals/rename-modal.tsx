"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useRenameModal } from "@/store/use-rename-modal";
import { FormEventHandler, useEffect, useState } from "react";
import { Input } from "../ui/input";
// import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";










export const RenameModal = () => {

    const { mutate, pending } = useApiMutation(api.board.update);

    const{
        isOpen,
        onClose,
        initialValues,
    } = useRenameModal();

    const [title, setTitle] = useState(initialValues.title);

    useEffect(() => {
        setTitle(initialValues.title);

    }, [initialValues.title]);

    const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        mutate({
            id:initialValues.id,
            title,
        })
        .then(() => {
            toast.success("Board renamed");
            onClose();
        })
        .catch(() => {toast.error("Failed to rename board")})
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent 
                className="max-w-[420px] border-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 rounded-2xl"
                style={{
                    background: "rgba(15,17,23,0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)"
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        Edit board title
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-slate-400">
                    Enter a new title for this board
                </DialogDescription>
                <form onSubmit={onSubmit} className="space-y-6 mt-2">
                    <Input 
                        disabled={pending}
                        required
                        maxLength={60}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Board Title"
                    />
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button 
                                type="button" 
                                variant="outline"
                                className="rounded-xl h-11 px-6 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            disabled={pending} 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 rounded-xl transition-all h-11 px-6 shadow-lg shadow-indigo-500/20"
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}





