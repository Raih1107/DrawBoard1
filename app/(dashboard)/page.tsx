"use client";

import { useOrganization } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation"; // Import this
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";

const DashboardPage = () => {
  const { organization } = useOrganization();
  const searchParams = useSearchParams();

  // Extract the values from the URL hook
  // This is reactive and will update when the URL changes
  const search = searchParams.get("search") || undefined;
  const favourites = searchParams.get("favourites") || undefined;

  return (
    <div className="flex-1 h-[calc(100%-60px)] p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList 
          orgId={organization.id} 
          // We pass the search/favourites if your BoardList still expects a query prop,
          // though based on our previous fix, BoardList can also read these itself!
        //🔥🔥🔥
        //   query={{ search, favourites }} 
        />
      )}
    </div>
  );
};

export default DashboardPage;