import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TooltipProvider } from "@radix-ui/react-tooltip";


export interface HintProps {
    label: string;
    children: React.ReactNode;
    side?: "top" | "center" | "left" | "right";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
}

export const Hint = ({
    label,
    children,
    side,
    align,
    sideOffset,
    alignOffset,
} : HintProps) => {
return(
        <TooltipProvider>
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent 
                className="bg-black text-white  border-black"
                side={side}
                align={align}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
                >
                <p className="font-semibold capitalize">
                    {label}
                </p>
            </TooltipContent>

        </Tooltip>
    </TooltipProvider>
)
}