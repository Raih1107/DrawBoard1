"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});


export const OrgSidebar = () => {

    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const favourites = searchParams.get("favourites");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="hidden lg:flex flex-col w-[206px]" />;
    }

    return(
        <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5"
            style={{
                background: "rgba(13,16,23,0.6)",
                backdropFilter: "blur(16px)",
                borderRight: "1px solid rgba(255,255,255,0.05)"
            }}
        >
            <Link href="/">
                <div className="flex items-center gap-x-2 group">
                    <div className="relative">
                        <Image 
                            src="/logo1.svg"
                            alt="Logo"
                            height={50}
                            width={50}
                            className="drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                        />
                    </div>
                    <span className={cn(
                        "font-semibold text-2xl",
                        font.className,
                    )}
                    style={{
                        background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}
                    >
                        Canvasly
                    </span>
                </div>
            </Link>

            <OrganizationSwitcher 
                hidePersonal
                appearance={{
                    elements:{
                        rootBox:{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                        },
                        organizationSwitcherTrigger:{
                            padding: "8px",
                            width: "100%",
                            borderRadius: "10px",
                            border: "1px solid rgba(255,255,255,0.08)",
                            justifyContent:"space-between",
                            backgroundColor: "rgba(255,255,255,0.04)",
                            color: "#f1f5f9",
                        }
                    }
                }}
            />

            <div className="space-y-1 w-full">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        !favourites 
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20" 
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    Team boards
                </Link>

                <Link
                    href={{
                        pathname: "/",
                        query: { favourites: true }
                    }}
                    className={cn(
                        "flex items-center gap-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        favourites 
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20" 
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                >
                    <Star className="h-4 w-4 shrink-0" />
                    Favourite boards
                </Link>

            </div>
        </div>
    )
};
