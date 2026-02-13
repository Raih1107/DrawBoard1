import { ClientSideSuspense } from "@liveblocks/react"; // Add this import
import { Room } from "@/components/room";
import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/loading";

interface BoardIdPageProps {
  // Next.js 15 requirement: params must be a Promise
  params: Promise<{
    boardId: string;
  }>;
}

// Make the component async
const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  // Await the params to get the boardId
  const { boardId } = await params;

  return (
    <Room roomId={boardId} fallback={<Loading />}>
      {/* ClientSideSuspense is crucial here. 
        It prevents the Canvas from loading until the 
        Liveblocks storage is synced, preventing that 
        "storage not loaded" error.
      */}
      <ClientSideSuspense fallback={<Loading />}>
        {() => <Canvas boardId={boardId} />}
      </ClientSideSuspense>
    </Room>
  );
};

export default BoardIdPage;