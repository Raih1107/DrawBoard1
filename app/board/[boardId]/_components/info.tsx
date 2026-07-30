"use client";

import { Actions } from "@/components/actions";
import { Hint } from "@/components/hints";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";
import { useExportCanvas } from "@/hooks/use-export-canvas";
import { useQuery } from "convex/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, FileImage, FileText, Globe, Lock, Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

interface InfoProps {
    boardId: string;
};

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

const TabSeparator = () => {
    return(
        <div className="text-white/20 px-1.5 font-light">
            |
        </div>
    )
}

export const Info = ({
    boardId,
}: InfoProps) => {

    const { onOpen } = useRenameModal();

    const data = useQuery(api.board.get, {
        id: boardId as Id<"boards">,
    });

    const { exportAsPng, exportAsPdf } = useExportCanvas(data?.title ?? "board");

    if(!data) return <InfoSkeleton />;

    const isPublic = data.isPublic ?? false;
    const viewCount = data.viewCount ?? 0;

    return(
        <div 
            className="absolute bottom-4 left-4 rounded-xl px-1.5 h-12 flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{
                background: "rgba(15,17,23,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            <Hint label="Go to boards" side={"bottom" as any} sideOffset={14}>
                <Button 
                    asChild 
                    variant="ghost" 
                    className="px-2 hover:bg-white/10 rounded-lg text-white"
                >
                    <Link href="/">
                        <div className="relative w-7 h-7">
                            <Image 
                                src="/logo1.svg"
                                alt="Board logo"
                                fill
                                className="drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] object-contain"
                            />
                        </div>
                        <span className={cn(
                            "sm:font-semibold sm:text-lg sm:ml-2.5",
                            font.className,
                        )}
                        style={{
                            background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                        }}
                        >
                            DrawBoard
                        </span>
                    </Link>
                </Button>
            </Hint>

            <TabSeparator />

            <Hint label="Edit title" side={"bottom" as any} sideOffset={14}>
                <Button 
                    variant="ghost" 
                    className="text-base font-normal px-3 hover:bg-white/10 rounded-lg text-slate-200"
                    onClick={() => onOpen(data._id, data.title)}
                >
                    {data.title}
                </Button>
            </Hint>

            <TabSeparator />

            {/* Live view count badge */}
            <Hint label="Total views" side={"bottom" as any} sideOffset={14}>
                <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg select-none"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">
                        {viewCount.toLocaleString()}
                    </span>
                </div>
            </Hint>

            <TabSeparator />

            {/* Public / private status pill */}
            <Hint label={isPublic ? "Board is public" : "Board is private"} side={"bottom" as any} sideOffset={14}>
                <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg select-none"
                    style={{
                        background: isPublic ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isPublic ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`
                    }}
                >
                    {isPublic
                        ? <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        : <Lock className="w-3.5 h-3.5 text-slate-400" />
                    }
                    <span className={`text-xs font-medium ${isPublic ? "text-emerald-400" : "text-slate-400"}`}>
                        {isPublic ? "Public" : "Private"}
                    </span>
                </div>
            </Hint>

            <TabSeparator />

            {/* Download button */}
            <DropdownMenu>
                <Hint label="Download" side={"bottom" as any} sideOffset={14}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-10 h-10 hover:bg-white/10 rounded-lg text-slate-200"
                        >
                            <Download className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                </Hint>
                <DropdownMenuContent
                    side="bottom"
                    sideOffset={14}
                    className="w-44 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-xl"
                    style={{
                        background: "rgba(15,17,23,0.9)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.08)"
                    }}
                >
                    <DropdownMenuItem
                        onClick={exportAsPng}
                        className="p-3 cursor-pointer rounded-lg hover:bg-white/5 transition-colors focus:bg-white/5 focus:text-white"
                    >
                        <FileImage className="h-4 w-4 mr-2 text-indigo-400" />
                        Export as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={exportAsPdf}
                        className="p-3 cursor-pointer rounded-lg hover:bg-white/5 transition-colors focus:bg-white/5 focus:text-white"
                    >
                        <FileText className="h-4 w-4 mr-2 text-rose-400" />
                        Export as PDF
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <TabSeparator />

            <Actions
                id={data._id}
                title={data.title}
                isPublic={isPublic}
                side="bottom"
                sideOffset={14}
            >
                <div>
                    <Hint label="Main menu" side={"bottom" as any} sideOffset={14}>
                        <Button 
                            size="icon" 
                            variant="ghost"
                            className="w-10 h-10 hover:bg-white/10 rounded-lg text-slate-200"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    </Hint>
                </div>
            </Actions>
        </div>
    )
}

export const InfoSkeleton = () => {
    return (
        <div 
            className="absolute bottom-4 left-4 rounded-xl px-3 h-12 flex items-center w-[300px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{
                background: "rgba(15,17,23,0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            <Skeleton className="h-full w-full bg-white/5 rounded-lg" />
        </div>
    )
}
