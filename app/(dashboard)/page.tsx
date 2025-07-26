"use client";

import dynamic from "next/dynamic";

// ✅ Dynamic import with ssr disabled (now safe)
const DashboardClient = dynamic(() => import("./dashboard-page-client"), {
  ssr: false,
});

interface DashboardPageProps {
  searchParams?: Record<string, string | string[]>;
}

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  return <DashboardClient searchParams={searchParams} />;
};

export default DashboardPage;
