import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        await requireAdmin();
    } catch (error) {
        redirect("/performance");
    }

    return (
        <div className="min-h-screen bg-[#070A0F] text-foreground flex">
            {/* Desktop Admin Sidebar */}
            <AdminSidebar />

            {/* Main Admin Content */}
            <div className="ml-64 flex-1 min-h-screen flex flex-col">
                <AdminTopBar />
                <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
