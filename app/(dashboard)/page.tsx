"use client";

import { useOrganization } from "@clerk/nextjs";
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";


interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const DashboardPage = ({
  searchParams,
}: DashboardPageProps) => {
  const { organization } = useOrganization();

  const search = searchParams.search?.toString();
  const favourites = searchParams.favourites?.toString();

  return (
    <div className="flex-1 h-[calc(100%-60px)] p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList
          orgId={organization.id}
          query={{ search, favourites }}
        />
      )}
    </div>
  );
};

export default DashboardPage;

