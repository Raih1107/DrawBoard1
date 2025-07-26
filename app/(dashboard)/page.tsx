import DashboardClient from "../(dashboard)/dashboard-page-client";

interface DashboardPageProps {
  searchParams?: { [key: string]: string | string[] };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return <DashboardClient searchParams={searchParams} />;
}
