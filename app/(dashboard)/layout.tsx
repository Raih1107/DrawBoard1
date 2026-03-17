import { Suspense } from "react"; // 1. Import Suspense
import { Navbar } from "./_components/navbar";
import { OrgSidebar } from "./_components/org-sidebar";
import { Sidebar } from "./_components/sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
};

const DashboardLayout = ({
    children,
}: DashboardLayoutProps) => {
    return (
        <main className="h-full bg-[#0f1117]">
            <Sidebar />
            <div className="pl-[60px] h-full">
                <div className="flex gap-x-3 h-full">
                    {/* 2. Wrap OrgSidebar in Suspense */}
                    <Suspense fallback={<div className="hidden lg:flex flex-col w-[206px]" />}>
                        <OrgSidebar />
                    </Suspense>
                    <div className="h-full flex-1">
                        <Navbar />
                        {children}
                    </div>
                </div>
            </div>
        </main >
    )
}

export default DashboardLayout;