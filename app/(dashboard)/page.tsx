import dynamic from "next/dynamic";

// Dynamically import the client component
const DashboardPageClient = dynamic(() => import("./dashboard-page-client"), {
  ssr: false,
});

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] };
}) {
  return <DashboardPageClient searchParams={searchParams} />;
}
