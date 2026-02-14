"use client"; // This MUST be the first line

import { use } from "react"; // Use this to unwrap params in Client Components
import { ClientSideSuspense } from "@liveblocks/react";
import { Room } from "@/components/room";
import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/loading";

interface BoardIdPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

const BoardIdPage = ({ params }: BoardIdPageProps) => {
  // Unwrap the promise using React's 'use' hook
  const { boardId } = use(params);

  return (
    <Room roomId={boardId} fallback={<Loading />}>
      <ClientSideSuspense fallback={<Loading />}>
        {() => <Canvas boardId={boardId} />}
      </ClientSideSuspense>
    </Room>
  );
};

export default BoardIdPage;