"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import AuthWrapper from "./AuthWrapper";

export default function MainLayout({ children }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Define routes that should NOT have Sidebar and NavBar
    const noLayoutRoutes = ["/", "/signup"];
    const isNoLayout = noLayoutRoutes.includes(pathname);

    if (isNoLayout) {
        return <>{children}</>;
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <AuthWrapper>
            <div className="flex min-h-[100dvh] bg-white w-full overflow-x-hidden">
                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col lg:ml-64 min-h-screen min-w-0">
                    {/* NavBar only once at top */}
                    <NavBar onMenuClick={toggleSidebar} />

                    {/* Page Content */}
                    <main className="flex-1 flex flex-col min-h-0">
                        {children}
                    </main>
                </div>
            </div>
        </AuthWrapper>
    );
}
