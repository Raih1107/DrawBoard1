"use client";

import { useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

import { EmptyBoards } from "./empty-board";
import { EmptyFavourites } from "./empty-favourites";
import { EmptySearch } from "./empty-search";
import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-button";

interface BoardListProps {
  orgId: string;
  query: {
    search?: string;
    favourites?: string;
  };
}

export const BoardList = ({ orgId, query }: BoardListProps) => {
  const search = query.search;
  const favourites = query.favourites;

  const data = useQuery(api.boards.get, { 
    orgId, 
    search: search || undefined,
    favourites: favourites || undefined,
  });

  if (data === undefined) {
    return (
      <div>
        <div className="flex items-center gap-x-3 mb-8">
          <h2 className="text-2xl font-bold text-white">
            {favourites ? "Favourite boards" : "Team boards"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 pb-10">
          <NewBoardButton orgId={orgId} disabled />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
        </div>
      </div>
    );
  }

  if (!data?.length && search) {
    return <EmptySearch />;
  }

  if (!data?.length && favourites) {
    return <EmptyFavourites />;
  }

  if (!data?.length) {
    return <EmptyBoards />;
  }

  return (
    <div>
      <div className="flex items-center gap-x-3 mb-8">
        <h2 className="text-2xl font-bold text-white">
          {favourites ? "Favourite boards" : "Team boards"}
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-indigo-300"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}
        >
          {data.length} {data.length === 1 ? "board" : "boards"}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 pb-10">
        <NewBoardButton orgId={orgId} />
        {data?.map((board) => (
          <BoardCard
            key={board._id}
            id={board._id}
            title={board.title}
            imageUrl={board.imageUrl}
            authorId={board.authorId}
            authorName={board.authorName}
            createdAt={board._creationTime}
            orgId={board.orgId}
            isFavourite={board.isFavourite}
          />
        ))}
      </div>
    </div>
  );
};
