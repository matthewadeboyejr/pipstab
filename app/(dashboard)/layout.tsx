"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import BroadcastBanner from "@/components/dashboard/BroadcastBanner";
import ProductTourModal from "@/components/dashboard/onboarding/ProductTourModal";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile sidebar */}
            <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

            {/* Main content area — offset by sidebar width on desktop */}
            <div className="lg:ml-[240px] min-h-screen flex flex-col transition-all duration-300">
                <TopBar onMenuToggle={() => setMobileOpen(true)} />
                <BroadcastBanner />
                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
            </div>

            {/* Interactive Onboarding Tour Modal */}
            <ProductTourModal />
        </div>
    );
}

