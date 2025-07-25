"use client";

import { Hint } from "@/components/hints";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

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
    <Hint label={label} side="bottom" sideOffset={14}>
      <Button
        disabled={isDisabled}
        onClick={onClick}
        size="icon"
        variant={isActive ? "boardActive" : "board"}
        className="p-1 sm:p-2"
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </Hint>
  );
};
