"use client";

import { useOrganization } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // 1. Import Suspense
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";

// 2. Move your logic into a separate internal component
const DashboardContent = () => {
  const { organization } = useOrganization();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || undefined;
  const favourites = searchParams.get("favourites") || undefined;

  return (
    <div className="flex-1 h-[calc(100%-60px)] p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList 
          orgId={organization.id} 
          // query={{ search, favourites }} 
        />
      )}
    </div>
  );
};

// 3. The main page component now just wraps the content in Suspense
const DashboardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;