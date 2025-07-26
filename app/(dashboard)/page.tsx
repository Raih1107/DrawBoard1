import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./dashboard-page-client"), {
  ssr: false,
});

interface DashboardPageProps {
  // ✅ remove this type
  // searchParams?: { [key: string]: string | string[] };
  // ✅ use this instead:
  searchParams?: Record<string, string | string[]>;
}

// ✅ mark as async (optional based on use)
const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  return <DashboardClient searchParams={searchParams} />;
};

export default DashboardPage;
