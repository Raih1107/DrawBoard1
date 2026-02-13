"use client";

import { useOrganization } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // 1. Added Suspense
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";

// This is the component that uses the search hook
const DashboardContent = () => {
  const { organization } = useOrganization();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || undefined;
  const favorites = searchParams.get("favorites") || undefined;

  return (
    <div className="flex-1 h-[calc(100%-60px)] p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList 
          orgId={organization.id} 
          
        />
      )}
    </div>
  );
};

// This is the actual page export that Next.js sees
const DashboardPage = () => {
  return (
    // The Suspense boundary MUST be outside DashboardContent
    <Suspense fallback={<div className="flex-1 p-6">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;