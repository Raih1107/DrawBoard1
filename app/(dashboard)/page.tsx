"use client";

import { useOrganization } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";

const DashboardContent = () => {
  const { organization } = useOrganization();
  const searchParams = useSearchParams();

  // Next.js 15 can be picky about 'undefined' vs 'null' vs '' 
  // during prerendering. Using || "" is the safest bet.
  const search = searchParams.get("search") || "";
  const favourites = searchParams.get("favourites") || "";

  if (!organization) {
    return (
      <div className="flex-1 h-[calc(100%-60px)] p-6">
        <EmptyOrg />
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100%-60px)] p-6">
      <BoardList 
        orgId={organization.id} 
        query={{ search, favourites }}
      />
    </div>
  );
};

const DashboardPage = () => {
  return (
    // Ensure Suspense is the ONLY thing returned at the top level 
    // to force Next.js to treat the children as purely dynamic.
    <Suspense fallback={<div className="flex-1 p-6">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;