import DashboardPageClient from "./dashboard-page-client";

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] };
}) {
  return <DashboardPageClient searchParams={searchParams} />;
}
