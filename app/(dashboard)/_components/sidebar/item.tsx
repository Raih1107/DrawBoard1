"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Hint } from "@/components/hints";



interface ItemProps {
    id: string;
    name: string;
    imageUrl: string;
};

export const Item = ({
    id,
    name,
    imageUrl,
}: ItemProps) => {

    const {organization} = useOrganization();
    const {setActive} = useOrganizationList();

    const isActive = organization?.id === id ;

    const onClick = () => {
        if(!setActive) return;

        setActive({organization: id});
    }

    return(
        <div className="aspect-square relative">
            <Hint 
                label={name}
                side="right"
                align="start"
                sideOffset={18}
            >
                <div
                    onClick={onClick}
                    className={cn(
                        "relative w-full h-full rounded-xl cursor-pointer transition-all duration-200 overflow-hidden",
                        "ring-2 ring-transparent hover:ring-indigo-500/60",
                        isActive && "ring-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    )}
                    style={{ transform: isActive ? "scale(1.05)" : "scale(1)" }}
                >
                    <Image  
                        fill
                        src={imageUrl}
                        alt={name}
                        className={cn(
                            "object-cover opacity-75 hover:opacity-100 transition-opacity",
                            isActive && "opacity-100"
                        )}
                    />
                </div>
            </Hint>
        </div>
    )
}