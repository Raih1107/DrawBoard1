"use client";

import { Hint } from "@/components/hints";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrganization } from "@clerk/nextjs";
import { Plus } from "lucide-react";


export const NewButton = () => {
    return(
        <Dialog>
            <DialogTrigger asChild>
                <div className="aspect-square">
                    <Hint 
                        label="Create organization"
                        side="right"
                        align="start"
                        sideOffset={18}
                        >
                        <button className="relative group h-full w-full rounded-xl flex items-center justify-center transition-all duration-200 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50">
                            <Plus className="text-slate-400 group-hover:text-indigo-400 transition-colors w-5 h-5" />
                        </button>
                    </Hint>
                </div>

            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none max-w-[480px]">
                <CreateOrganization />
            </DialogContent>
        </Dialog>
    )
}