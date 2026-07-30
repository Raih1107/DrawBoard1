import { Suspense } from "react";
import { Navbar } from "./_components/navbar";
import { OrgSidebar } from "./_components/org-sidebar";
import { Sidebar } from "./_components/sidebar";
import { SoleAdminBanner } from "./_components/sole-admin-banner";

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
                    <Suspense fallback={<div className="hidden lg:flex flex-col w-[206px]" />}>
                        <OrgSidebar />
                    </Suspense>
                    <div className="h-full flex-1 flex flex-col">
                        <Navbar />
                        <SoleAdminBanner />
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default DashboardLayout;