import dynamic from "next/dynamic";

// Dynamically import the client component
const DashboardClient = dynamic(() => import("../(dashboard)/dashboard-page-client"), {
  ssr: false,
});

interface DashboardPageProps {
  searchParams?: { [key: string]: string | string[] };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return <DashboardClient searchParams={searchParams} />;
}
