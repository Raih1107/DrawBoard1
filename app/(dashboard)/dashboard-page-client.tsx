"use client";

import { useOrganization } from "@clerk/nextjs";
import { EmptyOrg } from "../(dashboard)/_components/empty-org";
import { BoardList } from "../(dashboard)/_components/board-list";

interface DashboardClientProps {
  searchParams?: { [key: string]: string | string[] };
}

export default function DashboardClient({ searchParams }: DashboardClientProps) {
  const { organization } = useOrganization();

  const search = searchParams?.search?.toString();
  const favourites = searchParams?.favourites?.toString();

  return (
    <div className="flex-1 h-[calc(100%-60px)] p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList orgId={organization.id} query={{ search, favourites }} />
      )}
    </div>
  );
}
