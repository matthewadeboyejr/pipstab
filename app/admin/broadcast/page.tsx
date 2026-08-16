"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Megaphone,
    Mail,
    Send,
    AlertTriangle,
    Sparkles,
    Wrench,
    CheckCircle2,
    XCircle,
    Loader2,
    History,
    Users,
    ExternalLink,
    Radio,
    Eye,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminBroadcastPage() {
    const { addToast } = useToast();

    const [activeBroadcast, setActiveBroadcast] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // In-App Broadcast Form
    const [inAppTitle, setInAppTitle] = useState("");
    const [inAppMessage, setInAppMessage] = useState("");
    const [inAppType, setInAppType] = useState<"announcement" | "feature" | "maintenance" | "alert">("announcement");
    const [inAppLink, setInAppLink] = useState("");
    const [isPublishingInApp, setIsPublishingInApp] = useState(false);

    // Email Blast Form
    const [emailTarget, setEmailTarget] = useState<"all" | "waitlist">("all");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailHeadline, setEmailHeadline] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [emailActionUrl, setEmailActionUrl] = useState("https://piptab.com");
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const fetchBroadcasts = async () => {
        try {
            const res = await fetch("/api/admin/broadcast");
            if (res.ok) {
                const data = await res.json();
                setActiveBroadcast(data.active_broadcast);
                setHistory(data.history || []);
            }
        } catch (e) {
            console.error("Failed to load broadcasts", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handlePublishInApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inAppTitle.trim() || !inAppMessage.trim()) {
            addToast("Please provide both a title and message", "error");
            return;
        }

        setIsPublishingInApp(true);
        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: inAppTitle,
                    message: inAppMessage,
                    type: inAppType,
                    link_url: inAppLink,
                    send_email: false,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to publish broadcast");
            }

            addToast("📢 In-App Broadcast published successfully!", "success");
            setInAppTitle("");
            setInAppMessage("");
            setInAppLink("");
            fetchBroadcasts();
        } catch (err: any) {
            addToast(err.message || "Failed to publish", "error");
        } finally {
            setIsPublishingInApp(false);
        }
    };

    const handleDismissInApp = async () => {
        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "DISMISS_IN_APP" }),
            });
            if (res.ok) {
                addToast("In-app broadcast banner dismissed", "success");
                setActiveBroadcast(null);
            }
        } catch (err: any) {
            addToast("Failed to dismiss broadcast", "error");
        }
    };

    const handleSendEmailBlast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailSubject.trim() || !emailHeadline.trim() || !emailBody.trim()) {
            addToast("Please fill all email fields", "error");
            return;
        }

        if (!confirm(`Are you sure you want to send this email blast to ${emailTarget === "all" ? "ALL Active Traders" : "Early Access Waitlist"}?`)) {
            return;
        }

        setIsSendingEmail(true);
        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: emailHeadline,
                    message: emailBody,
                    type: "announcement",
                    link_url: emailActionUrl,
                    target: emailTarget,
                    send_email: true,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to dispatch email blast");

            if (data.emailResult?.success) {
                addToast(`✉️ Email blast sent to ${data.emailResult.sentCount} recipients!`, "success");
                setEmailSubject("");
                setEmailHeadline("");
                setEmailBody("");
                fetchBroadcasts();
            } else {
                addToast(data.emailResult?.errors?.[0] || "Email dispatch failed", "error");
            }
        } catch (err: any) {
            addToast(err.message || "Failed to send email", "error");
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black font-['Montserrat'] tracking-tight text-foreground flex items-center gap-2.5">
                        <Megaphone className="w-6 h-6 text-accent" />
                        <span>Broadcast & Announcement Center</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Push real-time in-app banners to active traders or dispatch Brevo email blasts.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        Live Broadcast System
                    </span>
                </div>
            </div>

            {/* Active In-App Broadcast Banner Status */}
            {activeBroadcast && activeBroadcast.is_active && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-card to-card border border-blue-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    CURRENT ACTIVE IN-APP BANNER
                                </span>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                    Type: {activeBroadcast.type}
                                </span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground">{activeBroadcast.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{activeBroadcast.message}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleDismissInApp}
                            className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-all"
                        >
                            Dismiss Banner
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Two Column Grid: In-App Publisher vs Email Blast Dispatcher */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. In-App Banner Creator */}
                <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-border/40">
                        <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                            <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground font-['Montserrat']">
                                Publish In-App Announcement
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                Displays as a sticky top notification for all logged-in traders.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePublishInApp} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Announcement Type
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    { id: "announcement", label: "Announcement", icon: Megaphone, color: "text-blue-400" },
                                    { id: "feature", label: "Feature Release", icon: Sparkles, color: "text-emerald-400" },
                                    { id: "maintenance", label: "Maintenance", icon: Wrench, color: "text-amber-400" },
                                    { id: "alert", label: "Critical Alert", icon: AlertTriangle, color: "text-red-400" },
                                ].map((t) => {
                                    const Icon = t.icon;
                                    const isSel = inAppType === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setInAppType(t.id as any)}
                                            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                                                isSel
                                                    ? "bg-accent/15 border-accent/40 text-foreground shadow-sm"
                                                    : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/60"
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${t.color}`} />
                                            <span className="text-[11px]">{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Headline / Title
                            </label>
                            <input
                                type="text"
                                value={inAppTitle}
                                onChange={(e) => setInAppTitle(e.target.value)}
                                placeholder="e.g. ⚡ Top-Down Multi-Timeframe Outlooks now live!"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Short Message (1-2 sentences)
                            </label>
                            <textarea
                                value={inAppMessage}
                                onChange={(e) => setInAppMessage(e.target.value)}
                                rows={3}
                                placeholder="e.g. You can now build, audit, and export institutional multi-timeframe research dossiers."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Optional Action Link
                            </label>
                            <input
                                type="text"
                                value={inAppLink}
                                onChange={(e) => setInAppLink(e.target.value)}
                                placeholder="e.g. /outlooks or https://piptab.com/changelog"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent font-mono text-xs"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPublishingInApp}
                            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md shadow-accent/20"
                        >
                            {isPublishingInApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>Publish In-App Banner</span>
                        </button>
                    </form>
                </div>

                {/* 2. Brevo Email Blast Dispatcher */}
                <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-border/40">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground font-['Montserrat']">
                                Dispatch Brevo Email Blast
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                Deliver institutional newsletters or invitations directly to trader inboxes.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSendEmailBlast} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Target Audience
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEmailTarget("all")}
                                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                                        emailTarget === "all"
                                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm"
                                            : "bg-muted/30 border-border/40 text-muted-foreground"
                                    }`}
                                >
                                    <Users className="w-4 h-4" />
                                    <span>All Registered Traders</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEmailTarget("waitlist")}
                                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                                        emailTarget === "waitlist"
                                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm"
                                            : "bg-muted/30 border-border/40 text-muted-foreground"
                                    }`}
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>Early Access Waitlist</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Email Subject Line
                            </label>
                            <input
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="e.g. [PipTab Update] Major Platform Upgrade & New Features"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Email Headline (Inside Email Body)
                            </label>
                            <input
                                type="text"
                                value={emailHeadline}
                                onChange={(e) => setEmailHeadline(e.target.value)}
                                placeholder="e.g. New Top-Down Strategy Dossiers & AI Confluence Auditing"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                                Email Body Content
                            </label>
                            <textarea
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                rows={4}
                                placeholder="Write the update or announcement text here..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none font-sans"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSendingEmail}
                            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
                        >
                            {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>Send Brevo Email Blast</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Broadcast History */}
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Broadcast & Dispatch Logs ({history.length})
                        </h3>
                    </div>
                </div>

                {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                        No previous broadcasts recorded yet.
                    </p>
                ) : (
                    <div className="divide-y divide-border/30">
                        {history.map((item, i) => (
                            <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold">
                                            {item.type || "announcement"}
                                        </span>
                                        <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-1">{item.message}</p>
                                </div>

                                <div className="text-left sm:text-right text-[11px] text-muted-foreground font-mono shrink-0">
                                    <p>{new Date(item.created_at).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-muted-foreground/70">{item.created_by || "Admin"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
