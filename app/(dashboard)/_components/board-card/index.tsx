"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";

import { Overlay } from "./overlay";
import { Footer } from "./footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Actions } from "@/components/actions";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface BoardCardProps {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: number;
  imageUrl: string;
  orgId: string;
  isFavourite: boolean;
  viewCount?: number;
  isPublic?: boolean;
}

export const BoardCard = ({
  id,
  title,
  authorId,
  authorName,
  createdAt,
  imageUrl,
  orgId,
  isFavourite,
  viewCount = 0,
  isPublic = false,
}: BoardCardProps) => {
  const { userId } = useAuth();

  const authorLabel = userId === authorId ? "You" : authorName;
  const createdAtLabel = formatDistanceToNow(createdAt, {
    addSuffix: true,
  });

  const {
    mutate: onFavoruite,
    pending: pendingFavoruite
  }  = useApiMutation(api.board.favourite);

  const {
    mutate: onUnFavoruite,
    pending: pendingUnFavoruite
  } = useApiMutation(api.board.unFavourite);

  const toggleFavourite = () => {
    if(isFavourite){
      onUnFavoruite({id, orgId})
          .catch(() => toast.error("Failed to unfavourite"))
    } else{
      onFavoruite({id, orgId})
          .catch(() => toast.error("Failed to favourite"))
    }
  };

  return (
    <Link href={`/board/${id}`}>
      <div 
        className="group aspect-[100/127] rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "rgba(30,33,48,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(99,102,241,0.18), 0 2px 12px rgba(0,0,0,0.4)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.25)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
        }}
      >
        <div className="relative flex-1 bg-slate-800">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
          <Overlay />
          <Actions id={id} title={title} isPublic={isPublic} side="right">
            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1.5 outline-none rounded-lg"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            >
              <MoreHorizontal className="text-white w-4 h-4" />
            </button>
          </Actions>
        </div>

        <Footer
          isFavourite={isFavourite}
          title={title}
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          onClick={toggleFavourite}
          disabled={pendingFavoruite || pendingUnFavoruite}
          viewCount={viewCount}
          isPublic={isPublic}
        />
      </div>
    </Link>
  );
};

// Skeleton variant
BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div 
      className="aspect-[100/127] rounded-xl overflow-hidden"
      style={{ background: "rgba(30,33,48,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <Skeleton className="h-full w-full bg-slate-800/50" />
    </div>
  );
};
