import DashboardClient from "../(dashboard)/dashboard-page-client";

interface DashboardPageProps {
  searchParams?: { [key: string]: string | string[] };
}

// ✅ Fix: Make the function `async` ONLY if you're using any async calls (you are NOT, so don't)
export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return <DashboardClient searchParams={searchParams} />;
}
