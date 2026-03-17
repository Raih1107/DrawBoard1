"use client";

import { Actions } from "@/components/actions";
import { Hint } from "@/components/hints";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";
import { useQuery } from "convex/react";
import { Menu } from "lucide-react";
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

    if(!data) return <InfoSkeleton />;

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

            <Actions
                id={data._id}
                title={data.title}
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
