"use client";

import { Hint } from "@/components/hints";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

export const ToolButton = ({
  label,
  icon: Icon,
  onClick,
  isActive,
  isDisabled,
}: ToolButtonProps) => {
  return (
    <Hint label={label} side={"bottom" as any} sideOffset={18}>
      <Button
        disabled={isDisabled}
        onClick={onClick}
        size="icon"
        variant="ghost"
        className={cn(
          "w-10 h-10 rounded-xl transition-all duration-200 border-0 focus-visible:ring-0",
          isActive 
            ? "bg-indigo-600/20 text-indigo-400" 
            : "text-slate-400 hover:text-white hover:bg-white/10",
          isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
        )}
      >
        <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]")} />
      </Button>
    </Hint>
  );
};
