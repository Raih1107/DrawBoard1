"use client";

import { useOrganization } from "@clerk/nextjs";
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";
import { useEffect, useState } from "react";

interface DashboardPageClientProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const DashboardPageClient = ({ searchParams }: DashboardPageClientProps) => {
  const { organization } = useOrganization();

  const search = searchParams.search?.toString();
  const favourites = searchParams.favourites?.toString();

  const [orgReady, setOrgReady] = useState(false);

  useEffect(() => {
    if (organization !== undefined) {
      setOrgReady(true);
    }
  }, [organization]);

  if (!orgReady) {
    return (
      <div className="flex-1 h-[calc(100%-60px)] p-6 flex items-center justify-center text-muted-foreground">
        Loading organization...
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100%-60px)] p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList orgId={organization.id} query={{ search, favourites }} />
      )}
    </div>
  );
};

export default DashboardPageClient;
