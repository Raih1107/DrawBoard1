import DashboardPageClient from "./dashboard-page-client";
import { type Metadata } from "next";

// (Optional) Add metadata if needed
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your organization boards",
};

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default function DashboardPage({ searchParams }: PageProps) {
  return <DashboardPageClient searchParams={searchParams} />;
}
