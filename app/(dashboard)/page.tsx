import DashboardClient from "../(dashboard)/dashboard-page-client";


export default function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] };
}) {
  return <DashboardClient searchParams={searchParams} />;
}
