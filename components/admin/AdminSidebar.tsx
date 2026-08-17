"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Megaphone,
    Activity,
    Mail,
    Sliders,
    ArrowLeft,
    Shield,
    Zap,
} from "lucide-react";

const ADMIN_NAV = [
    { href: "/admin", label: "Command Center", icon: LayoutDashboard },
    { href: "/admin/users", label: "Trader Directory", icon: Users },
    { href: "/admin/analytics", label: "Platform Analytics", icon: BarChart3 },
    { href: "/admin/broadcast", label: "Broadcast & Email", icon: Megaphone },
    { href: "/admin/brokers", label: "Broker Telemetry", icon: Activity },
    { href: "/admin/waitlist", label: "Early Access", icon: Mail },
    { href: "/admin/system", label: "System Ops & Flags", icon: Sliders },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 flex flex-col bg-[#090D14] border-r border-border/40 text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-border/30 bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/20">
                        <Shield className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-sm font-extrabold font-['Montserrat'] tracking-tight text-foreground flex items-center gap-1.5">
                            PIPTAB <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/20 text-accent font-mono font-bold">ADMIN</span>
                        </span>
                        <p className="text-[10px] text-muted-foreground">Platform Command Center</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Management
                </p>
                {ADMIN_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                isActive
                                    ? "bg-accent/15 text-accent border border-accent/30 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                        >
                            <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Back Link */}
            <div className="p-3 border-t border-border/30 bg-white/[0.01]">
                <Link
                    href="/performance"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Trader App</span>
                </Link>
            </div>
        </aside>
    );
}
