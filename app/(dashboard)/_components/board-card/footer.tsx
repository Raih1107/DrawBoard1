import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface FooterProps {
    title: string;
    authorLabel: string;
    createdAtLabel: string;
    isFavourite: boolean;
    onClick: () => void;
    disabled: boolean;
};

export const Footer = ({
    title,
    authorLabel,
    createdAtLabel,
    isFavourite,
    onClick,
    disabled
}: FooterProps) => {

    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.stopPropagation();
        event.preventDefault();
        onClick();
    };

    return(
        <div className="relative p-3"
            style={{
                background: "rgba(15,17,23,0.95)",
                borderTop: "1px solid rgba(255,255,255,0.06)"
            }}
        >
            <p className="text-[13px] font-medium text-slate-100 truncate max-w-[calc(100%-24px)]">
                {title}
            </p>
            <p className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-400 truncate mt-0.5">
                {authorLabel} · {createdAtLabel}
            </p>
            <button
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "opacity-0 group-hover:opacity-100 transition-all absolute top-3 right-3 text-slate-500 hover:text-indigo-400",
                    disabled && "cursor-not-allowed opacity-75"
                )}
            >
                <Star 
                    className={cn(
                        "h-4 w-4 transition-colors",
                        isFavourite && "fill-indigo-500 text-indigo-500"
                    )}
                />
            </button>
        </div>
    );
};