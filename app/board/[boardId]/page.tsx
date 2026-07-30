"use client";

import { use, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { verifyAndRevokeAccess } from "@/actions/collab";
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
  const { boardId } = use(params);
  const { isSignedIn, isLoaded, orgId: activeOrgId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Fetch the board without requiring auth — works for both public and private
  const board = useQuery(api.board.getPublic, { id: boardId as Id<"boards"> });
  const incrementViewCount = useMutation(api.board.incrementViewCount);

  // Real-time subscription: watch the status of the current user's collab request for this board
  const myRequest = useQuery(
    api.requests.getSingleRequest,
    isSignedIn && user?.id
      ? { boardId: boardId as Id<"boards">, requesterId: user.id }
      : "skip"
  );

  // Increment the view count once when the board loads
  useEffect(() => {
    if (board) {
      incrementViewCount({ id: board._id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?._id]);

  // Real-time Clerk membership check for approved collaborators.
  // Runs on mount + every window focus to catch Clerk dashboard removals.
  useEffect(() => {
    if (myRequest?.status !== "approved" || !user?.id || !board?.orgId || !myRequest?._id) return;

    const runCheck = async () => {
      await verifyAndRevokeAccess(board.orgId, user.id, myRequest._id as string);
      // No need to handle the result here — if revoked, Convex subscription
      // will update myRequest.status to "rejected" automatically, which
      // triggers the status-change effect below and remounts the room.
    };

    // Run immediately on mount
    runCheck();

    // Re-run when the user focuses back on this tab
    window.addEventListener("focus", runCheck);
    return () => window.removeEventListener("focus", runCheck);
  }, [myRequest?.status, myRequest?._id, user?.id, board?.orgId]);

  // Track real-time status changes for the guest's own request and surface toasts
  const prevStatusRef = useRef<string | null | undefined>(undefined);
  const currentStatus = myRequest?.status;

  useEffect(() => {
    // undefined = loading, skip until we have a real value
    if (prevStatusRef.current === undefined) {
      prevStatusRef.current = currentStatus;
      return;
    }
    const prev = prevStatusRef.current;
    prevStatusRef.current = currentStatus;

    // Was approved → no longer approved = kicked from the org by the admin
    if (prev === "approved" && currentStatus !== "approved") {
      toast.error("You have been removed from this board by the admin.", { duration: 6000 });
    }

    // Was pending → now rejected = admin explicitly rejected the request
    if (prev === "pending" && currentStatus === "rejected") {
      toast.error("Your collaboration request was rejected by the admin.", { duration: 6000 });
    }
  }, [currentStatus]);

  // Wait for Clerk to finish loading
  if (!isLoaded || board === undefined) {
    return <Loading />;
  }

  // Board not found
  if (board === null) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4"
        style={{ background: "#0f1117" }}>
        <p className="text-white text-xl font-semibold">Board not found.</p>
      </div>
    );
  }

  // Not signed in AND board is private → redirect to sign-in
  if (!isSignedIn && !board.isPublic) {
    router.replace(`/sign-in?redirect_url=/board/${boardId}`);
    return <Loading />;
  }

  // User is read-only UNLESS:
  // 1. They own the org, OR
  // 2. Their collab request has been approved (real-time instant upgrade)
  const isApproved = myRequest?.status === "approved";
  const isReadOnly = board.orgId !== activeOrgId && !isApproved;

  // Key by isReadOnly so the Room re-mounts (re-authenticates with Liveblocks)
  // the instant a guest's request is approved — giving them full write access.
  return (
    <Room roomId={boardId} fallback={<Loading />} key={isReadOnly ? "readonly" : "editable"}>
      <ClientSideSuspense fallback={<Loading />}>
        {() => (
          <Canvas
            boardId={boardId}
            title={board.title}
            orgId={board.orgId}
            isReadOnly={isReadOnly}
            myRequestStatus={myRequest?.status ?? null}
          />
        )}
      </ClientSideSuspense>
    </Room>
  );
};

export default BoardIdPage;