"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Children } from "react";




interface ConfirmModalProps {
    children: React.ReactNode;
    onConfirm: () => void;
    disabled?: boolean;
    header: string;
    description?: string;
};


export const ConfirmModal = ({
    children,
    onConfirm,
    disabled,
    header,
    description,
}: ConfirmModalProps) => {

    const handleConfirm = () => {
        onConfirm();
    }



    return(
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent 
                className="max-w-[400px] border-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 rounded-2xl"
                style={{
                    background: "rgba(15,17,23,0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)"
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold text-white">
                        {header}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-2">
                    <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all h-11 px-6">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={disabled}
                        onClick={handleConfirm}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 rounded-xl transition-all h-11 px-6 shadow-lg shadow-indigo-500/20"
                    >
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


