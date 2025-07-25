import DashboardPageClient from "./dashboard-page-client";

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return <DashboardPageClient searchParams={searchParams} />;
}
