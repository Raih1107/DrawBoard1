import { cn } from "@/lib/utils";
import { Globe, Lock, Star } from "lucide-react";

interface FooterProps {
    title: string;
    authorLabel: string;
    createdAtLabel: string;
    isFavourite: boolean;
    onClick: () => void;
    disabled: boolean;
    viewCount?: number;
    isPublic?: boolean;
};

export const Footer = ({
    title,
    authorLabel,
    createdAtLabel,
    isFavourite,
    onClick,
    disabled,
    viewCount = 0,
    isPublic = false,
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

            {/* View count + public badge row */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-1">
                {/* Views */}
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span>👁</span>
                    <span>{viewCount.toLocaleString()}</span>
                </span>

                {/* Public / Private badge */}
                <span
                    className={cn(
                        "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        isPublic
                            ? "text-emerald-400 bg-emerald-400/10"
                            : "text-slate-500 bg-white/5"
                    )}
                >
                    {isPublic
                        ? <Globe className="w-2.5 h-2.5" />
                        : <Lock className="w-2.5 h-2.5" />
                    }
                    {isPublic ? "Public" : "Private"}
                </span>
            </div>

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