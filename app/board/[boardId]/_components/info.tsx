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
import { icons, Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";





interface InforProps{
    boardId:string;
};

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});


const TabSeparator = () => {


    return(
        <div className="text-neutral-300 px-1.5">
            |
        </div>
    )
}




export const Info = ({
    boardId,
}: InforProps) => {

    const { onOpen } = useRenameModal();


    const data = useQuery(api.board.get, {
        id: boardId as Id<"boards">,
    });

    if(!data) return <InfoSkeleton />;



    return(
        <div className="absolute bottom-2 left-0 sm:left-1 bg-black text-white  rounded-md px-0 sm:px-1.5 sm:h-12 flex items-center shadow-md">
            <Hint label="Go to boards" side="bottom" sideOffset={10}>
                <Button asChild variant="board" className="px-0.5 sm:px-2">
                <Link href="/">
                <Image 
                    src="/logo1.svg"
                    alt="Board logo"
                    height={40}
                    width={40}
                />
                <span className={cn(
                    "sm:font-semibold sm:text-xl sm:ml-2 ",
                    font.className,
                )}>
                    Board
                </span>
                </Link>
            
            </Button>

            </Hint>
            <TabSeparator />
            <Hint label="Edit title" side="bottom" sideOffset={10}>
                <Button 
                    variant="board" 
                    className="text-base font-normal p-0 sm:px-2"
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
                sideOffset={10}
            >
                <div>
                    <Hint label="Main menu" side="bottom" sideOffset={10}>
                        <Button size="icon" variant="board">
                            <Menu />
                        </Button>

                    </Hint>
                </div>

            </Actions>

        </div>
    )
}

export const InfoSkeleton = () => {
    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md 
        w-[300px]">
            <Skeleton className="h-full w-full bg-muted-400 " />

        </div>
    )
}
