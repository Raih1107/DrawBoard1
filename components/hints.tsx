import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider, // Moved this to standard shadcn import if applicable
} from "@/components/ui/tooltip"

export interface HintProps {
  label: string;
  children: React.ReactNode;
  // 1. Fixed types: changed "center" to "bottom"
  side?: "top" | "bottom" | "left" | "right"; 
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
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          className="bg-black text-white border-black"
          // 2. Fixed variable: removed quotes so it uses the prop
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