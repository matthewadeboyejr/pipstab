"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, AlertTriangle, Sparkles, Wrench, X, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface BroadcastData {
    id: string;
    title: string;
    message: string;
    type: "announcement" | "maintenance" | "feature" | "alert";
    link_url?: string;
    is_active: boolean;
    created_at: string;
}

export default function BroadcastBanner() {
    const [broadcast, setBroadcast] = useState<BroadcastData | null>(null);
    const [isDismissed, setIsDismissed] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchBroadcast = async () => {
            try {
                const { data } = await supabase
                    .from("system_settings")
                    .select("value")
                    .eq("key", "active_broadcast")
                    .single();

                if (data?.value && data.value.is_active) {
                    const bc = data.value as BroadcastData;
                    const dismissedId = localStorage.getItem("piptab-dismissed-bc");
                    if (dismissedId !== bc.id) {
                        setBroadcast(bc);
                        setIsDismissed(false);
                    }
                }
            } catch (e) {
                // Silently handle
            }
        };

        fetchBroadcast();
    }, []);

    const handleDismiss = () => {
        if (broadcast) {
            localStorage.setItem("piptab-dismissed-bc", broadcast.id);
        }
        setIsDismissed(true);
    };

    if (isDismissed || !broadcast) return null;

    const typeStyles = {
        announcement: {
            bg: "bg-blue-500/10 border-blue-500/30 text-blue-300",
            icon: Megaphone,
            iconColor: "text-blue-400",
            badge: "Announcement",
        },
        feature: {
            bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
            icon: Sparkles,
            iconColor: "text-emerald-400",
            badge: "New Feature",
        },
        maintenance: {
            bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
            icon: Wrench,
            iconColor: "text-amber-400",
            badge: "Maintenance",
        },
        alert: {
            bg: "bg-red-500/10 border-red-500/30 text-red-300",
            icon: AlertTriangle,
            iconColor: "text-red-400",
            badge: "Important Alert",
        },
    };

    const currentStyle = typeStyles[broadcast.type] || typeStyles.announcement;
    const Icon = currentStyle.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full border-b px-4 py-2.5 flex items-center justify-between gap-4 z-40 transition-all ${currentStyle.bg}`}
            >
                <div className="flex items-center gap-3 overflow-hidden text-xs">
                    <div className="flex items-center gap-2 shrink-0">
                        <Icon className={`w-4 h-4 ${currentStyle.iconColor}`} />
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-mono bg-black/20">
                            {currentStyle.badge}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                        <strong className="text-foreground font-semibold shrink-0">{broadcast.title}:</strong>
                        <span className="truncate opacity-90">{broadcast.message}</span>
                    </div>

                    {broadcast.link_url && (
                        <a
                            href={broadcast.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 font-bold underline hover:opacity-80 transition-opacity"
                        >
                            <span>Learn More</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>

                <button
                    onClick={handleDismiss}
                    className="p-1 rounded-lg hover:bg-black/20 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Dismiss Announcement"
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
