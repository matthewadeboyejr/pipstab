"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    Search,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    Calendar,
    SlidersHorizontal,
    ImagePlus,
    X,
    Camera,
    Trash2,
    Edit3,
    Loader2,
    CheckCircle2,
    XCircle,
    BookOpen,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import LogTradeModal from "@/components/dashboard/LogTradeModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import BrokerImportModal from "@/components/dashboard/settings/BrokerImportModal";
import { Upload, Share2 } from "lucide-react";
import { useAccounts } from "@/context/AccountContext";
import { toPng } from 'html-to-image';
import TradeShareCard from "./TradeShareCard";
import { useToast } from "@/context/ToastContext";
import JournalAuditor from "@/components/dashboard/fundamentals/JournalAuditor";
import { Suspense } from "react";

interface Trade {
    id: string;
    pair: string;
    direction: "long" | "short";
    entry: string;
    exit: string;
    sl: string;
    lot_size: string;
    pnl: number;
    rr: string;
    setup: string;
    session: string;
    date: string;
    rawDate: string;
    emotion: string;
    notes: string;
    image_before?: string | null;
    image_after?: string | null;
    checklist_results?: Record<string, boolean>;
    broker?: string;
    account_id?: string | null;
}

interface JournalClientProps {
    trades: Trade[];
    initialAccountId?: string | null;
}

const emotionColors: Record<string, string> = {
    Confident: "text-emerald-400 bg-emerald-400/10",
    Neutral: "text-blue-400 bg-blue-400/10",
    Anxious: "text-amber-400 bg-amber-400/10",
    FOMO: "text-red-400 bg-red-400/10",
    Revenge: "text-red-500 bg-red-500/10",
    Calm: "text-teal-400 bg-teal-400/10",
};

// ─── Image Upload Component ─────────────────────────────────
function ImageUploadZone({
    label,
    image,
    onUpload,
    onRemove,
    onView,
}: {
    label: string;
    image: string | null;
    onUpload: (dataUrl: string) => void;
    onRemove: () => void;
    onView?: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) onUpload(e.target.result as string);
            };
            reader.readAsDataURL(file);
        },
        [onUpload]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    if (image) {
        return (
            <div className="relative group rounded-xl overflow-hidden border border-border/30">
                <img
                    src={image}
                    alt={label}
                    onClick={onView}
                    className="w-full object-contain cursor-pointer"
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onRemove}
                        className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors shadow-lg"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-semibold uppercase tracking-wider">
                    {label}
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDragging
                ? "border-accent bg-accent/5"
                : "border-border/40 hover:border-accent/40 hover:bg-accent/5"
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground">
                Drag & drop or click to upload
            </p>
        </div>
    );
}


// ─── Journal Client Content ───────────────────────────────────────────
function JournalClientContent({ trades }: JournalClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToast } = useToast();
    const supabase = createClient();
    const { activeAccount } = useAccounts();

    const paramTab = searchParams.get("tab") || searchParams.get("view");
    const [activeView, setActiveView] = useState<"logs" | "auditor">(paramTab === "auditor" ? "auditor" : "logs");

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [tradeImages, setTradeImages] = useState<Record<string, { before: string | null; after: string | null }>>({});
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
    const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
    const [importModalOpen, setImportModalOpen] = useState(false);

    const [userName, setUserName] = useState<string>("");

    // Sync activeView with searchParams
    useEffect(() => {
        const tab = searchParams.get("tab") || searchParams.get("view");
        if (tab === "auditor") setActiveView("auditor");
        else if (tab === "logs") setActiveView("logs");
    }, [searchParams]);

    const handleViewChange = (view: "logs" | "auditor") => {
        setActiveView(view);
        router.push(`/journal?view=${view}`, { scroll: false });
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Try fetching from profiles table first
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', user.id)
                    .single();

                if (profile?.display_name) {
                    setUserName(profile.display_name);
                } else {
                    const metadata = user.user_metadata;
                    const fullName = metadata?.full_name || metadata?.name || "";
                    const firstLast = metadata?.first_name ? `${metadata.first_name} ${metadata.last_name || ""}` : "";
                    setUserName(fullName || firstLast || user.email?.split("@")[0] || "Trader");
                }
            }
        };
        fetchUser();
    }, []);

    // Keep optimistic state to update UI immediately before server roundtrip
    const [localTrades, setLocalTrades] = useState<Trade[]>(trades);

    useEffect(() => {
        setLocalTrades(trades);
    }, [trades]);

    const handleCapture = async (trade: Trade) => {
        const element = document.getElementById(`share-card-${trade.id}`);
        if (!element) return;

        try {
            addToast("Generating your trade card...", "info");

            // Wait a tiny bit for any layout adjustments
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(element, {
                quality: 1,
                backgroundColor: '#0A0A0A',
                pixelRatio: 2, // High DPI for social media
            });

            const link = document.createElement('a');
            link.download = `piptab-${trade.pair}-${trade.direction}-${new Date().getTime()}.png`;
            link.href = dataUrl;
            link.click();

            addToast("Trade card downloaded! Ready to share.", "success");
        } catch (error) {
            console.error('Capture failed:', error);
            addToast("Failed to generate image", "error");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!tradeToDelete) return;
        setIsDeleting(tradeToDelete);

        // Cache the prior state in case of failure
        const previousTrades = [...localTrades];

        try {
            // Optimistically remove from UI
            setLocalTrades(prev => prev.filter(t => t.id !== tradeToDelete));

            // Perform actual DB deletion
            const { error } = await supabase.from('trades').delete().eq('id', tradeToDelete);

            if (error) {
                console.error("Supabase Deletion Error:", error);
                throw error;
            }

            addToast("Trade deleted successfully", "success");
            setTradeToDelete(null);
            router.refresh(); // Sync server state
        } catch (error: any) {
            console.error("Deletion failed completely:", error);
            // Revert optimistic update
            setLocalTrades(previousTrades);
            addToast(error.message || "Failed to delete trade", "error");
        } finally {
            setIsDeleting(null);
            setTradeToDelete(null);
        }
    };

    const updateImage = (tradeId: string, type: "before" | "after", dataUrl: string | null) => {
        setTradeImages((prev) => ({
            ...prev,
            [tradeId]: { ...prev[tradeId], [type]: dataUrl },
        }));
    };

    const filteredTrades = localTrades.filter(
        (t) => {
            const matchesSearch = t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.setup.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.broker && t.broker.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesAccount = !activeAccount || t.account_id === activeAccount.id;

            return matchesSearch && matchesAccount;
        }
    );

    const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = filteredTrades.length > 0 ? (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500"
        >
            {/* View Mode Switcher Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-accent/10 via-card to-card border border-accent/20 shadow-md">
                <div>
                    <h1 className="text-xl font-extrabold text-foreground font-['Montserrat'] flex items-center gap-2">
                        {activeView === "auditor" ? (
                            <>
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <span>AI Performance & Risk Auditor</span>
                            </>
                        ) : (
                            <>
                                <BookOpen className="w-5 h-5 text-accent" />
                                <span>Institutional Trade Journal</span>
                            </>
                        )}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        {activeView === "auditor"
                            ? "Objective AI audit analyzing discipline leaks, emotional tilt, and risk of ruin"
                            : "Structured execution logging, chart snapshots, and setup edge verification"}
                    </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-black/40 border border-border/50 rounded-2xl">
                    <button
                        onClick={() => handleViewChange("logs")}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            activeView === "logs" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {activeView === "logs" && (
                            <motion.div
                                layoutId="active-journal-view"
                                className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                                transition={{ type: "spring", duration: 0.4 }}
                            />
                        )}
                        <BookOpen className="w-3.5 h-3.5 text-accent" />
                        <span className="relative z-10">Trade Logs</span>
                    </button>

                    <button
                        onClick={() => handleViewChange("auditor")}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            activeView === "auditor" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {activeView === "auditor" && (
                            <motion.div
                                layoutId="active-journal-view"
                                className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                                transition={{ type: "spring", duration: 0.4 }}
                            />
                        )}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="relative z-10">AI Auditor</span>
                        <span className="relative z-10 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            AI
                        </span>
                    </button>
                </div>
            </div>

            {/* TAB 1: AI PERFORMANCE AUDITOR */}
            {activeView === "auditor" && (
                <motion.div
                    key="auditor-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <JournalAuditor />
                </motion.div>
            )}

            {/* TAB 2: TRADE LOGS */}
            {activeView === "logs" && (
                <motion.div
                    key="logs-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Stats summary bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Total Trades", value: filteredTrades.length.toString() },
                            { label: "Win Rate", value: `${winRate.toFixed(1)}%` },
                            { label: "Total P&L", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400" },
                            { label: "Avg R:R", value: "1:2.2" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-xl bg-card border border-border/50 px-4 py-3"
                            >
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className={`text-lg font-bold font-['Montserrat'] ${stat.color || "text-foreground"}`}>{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 flex-1 w-full sm:max-w-sm">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by pair or setup..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                    <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all font-medium whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Date Range</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all font-medium whitespace-nowrap">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>
            </div>

            {/* Trade list — Dual Mobile Cards & Desktop Table */}
            <div className="space-y-4">
                {/* 1. Mobile Cards View (sm & below) */}
                <div className="block md:hidden space-y-3">
                    {filteredTrades.map((trade, i) => {
                        const isExpanded = expandedId === trade.id;
                        const isWin = trade.pnl >= 0;
                        const hasImages = !!(trade.image_before || trade.image_after);

                        return (
                            <motion.div
                                key={`mobile-${trade.id}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                                className={`p-4 rounded-2xl bg-card border transition-all cursor-pointer shadow-sm ${
                                    isExpanded ? "border-accent/40 bg-accent/[0.02]" : "border-border/50 hover:border-border/80"
                                }`}
                            >
                                {/* Card Header: Pair, Direction, Broker, PnL */}
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-base font-bold text-foreground font-['Montserrat']">
                                            {trade.pair}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                trade.direction === "long"
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}
                                        >
                                            {trade.direction === "long" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {trade.direction}
                                        </span>
                                        {hasImages && <Camera className="w-3.5 h-3.5 text-accent" />}
                                    </div>
                                    <span className={`text-base font-black font-mono ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                                        {isWin ? "+" : ""}${trade.pnl.toFixed(2)}
                                    </span>
                                </div>

                                {/* Card Meta Row */}
                                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-border/20 text-xs">
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">Setup</span>
                                        <span className="text-foreground font-semibold truncate block mt-0.5">{trade.setup}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">R:R</span>
                                        <span className="text-foreground font-mono font-bold block mt-0.5">{trade.rr || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">Date</span>
                                        <span className="text-muted-foreground text-[11px] block mt-0.5">{trade.date}</span>
                                    </div>
                                </div>

                                {/* Card Footer: Emotion + Expand Hint */}
                                <div className="flex items-center justify-between pt-2.5 text-xs">
                                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${emotionColors[trade.emotion] || "text-muted-foreground bg-white/5"}`}>
                                        {trade.emotion}
                                    </span>
                                    <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
                                        {isExpanded ? "Collapse" : "Details & Notes"}
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                    </span>
                                </div>

                                {/* Mobile Expanded Drawer */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="pt-4 mt-3 border-t border-border/20 space-y-4 overflow-hidden"
                                        >
                                            {/* Notes */}
                                            <div>
                                                <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Trade Notes</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed bg-background/50 p-3 rounded-xl border border-border/20">
                                                    {trade.notes || "No notes provided for this trade."}
                                                </p>
                                            </div>

                                            {/* Rules Execution */}
                                            {trade.checklist_results && Object.keys(trade.checklist_results).length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Rules Checklist
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {Object.entries(trade.checklist_results).map(([rule, passed]) => (
                                                            <div key={rule} className="flex items-start gap-2 bg-background/40 rounded-lg p-2 border border-border/20">
                                                                {passed ? (
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                                ) : (
                                                                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                                                )}
                                                                <span className={`text-[11px] leading-tight ${passed ? "text-foreground" : "text-muted-foreground line-through opacity-70"}`}>
                                                                    {rule}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Screenshots */}
                                            {(trade.image_before || trade.image_after) && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                        <Camera className="w-3.5 h-3.5" /> Screenshots
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {trade.image_before && (
                                                            <div className="rounded-xl overflow-hidden border border-border/30">
                                                                <img
                                                                    src={trade.image_before}
                                                                    alt="Before Entry"
                                                                    onClick={(e) => { e.stopPropagation(); setLightboxImage(trade.image_before || null); }}
                                                                    className="w-full object-contain cursor-pointer max-h-48"
                                                                />
                                                            </div>
                                                        )}
                                                        {trade.image_after && (
                                                            <div className="rounded-xl overflow-hidden border border-border/30">
                                                                <img
                                                                    src={trade.image_after}
                                                                    alt="After Result"
                                                                    onClick={(e) => { e.stopPropagation(); setLightboxImage(trade.image_after || null); }}
                                                                    className="w-full object-contain cursor-pointer max-h-48"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Mobile Actions */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCapture(trade); }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all"
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                    Share
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setTradeToEdit(trade); }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border/50 transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setTradeToDelete(trade.id); }}
                                                    disabled={isDeleting === trade.id}
                                                    className="p-2 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 2. Desktop Table View (md & above) */}
                <div className="hidden md:block rounded-2xl bg-card border border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30">
                                    {["Pair", "Direction", "Entry", "Exit", "P&L", "R:R", "Setup", "Session", "Emotion", "Date"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrades.map((trade, i) => {
                                    const hasImages = !!(trade.image_before || trade.image_after);
                                    return (
                                        <Fragment key={trade.id}>
                                            <motion.tr
                                                key={trade.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.03 }}
                                                onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                                                className="border-b border-border/20 hover:bg-white/5 transition-colors cursor-pointer"
                                            >
                                                <td className="px-4 py-3.5 text-sm font-semibold text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        {trade.pair}
                                                        {trade.broker && trade.broker !== 'Manual' && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground tracking-wider uppercase">
                                                                {trade.broker}
                                                            </span>
                                                        )}
                                                        {hasImages && <Camera className="w-3 h-3 text-accent" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${trade.direction === "long" ? "text-emerald-400" : "text-red-400"}`}>
                                                        {trade.direction === "long" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {trade.direction.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-sm text-muted-foreground">{trade.entry}</td>
                                                <td className="px-4 py-3.5 text-sm text-muted-foreground">{trade.exit}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-sm font-semibold ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-sm text-muted-foreground">{trade.rr}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-xs text-foreground/70 px-2 py-1 rounded-md bg-white/5">{trade.setup}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-muted-foreground">{trade.session}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${emotionColors[trade.emotion] || "text-muted-foreground bg-white/5"}`}>
                                                        {trade.emotion}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{trade.date}</td>
                                            </motion.tr>
                                            {expandedId === trade.id && (
                                                <motion.tr
                                                    key={`${trade.id}-detail`}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <td colSpan={10} className="px-6 py-5 bg-white/5 border-b border-border/20">
                                                        <div className="space-y-4">
                                                            <div className="space-y-6">
                                                                {/* Notes */}
                                                                <div>
                                                                    <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">Trade Notes</p>
                                                                    <p className="text-sm text-muted-foreground leading-relaxed">{trade.notes || "No notes provided."}</p>
                                                                </div>

                                                                {/* Rules Execution */}
                                                                {trade.checklist_results && Object.keys(trade.checklist_results).length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                                            Rules Execution
                                                                        </p>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                                            {Object.entries(trade.checklist_results).map(([rule, passed]) => (
                                                                                <div key={rule} className="flex items-start gap-2.5 bg-background/40 rounded-xl p-2.5 border border-border/20">
                                                                                    {passed ? (
                                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                                                    ) : (
                                                                                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                                                                    )}
                                                                                    <span className={`text-[11px] leading-tight ${passed ? "text-foreground" : "text-muted-foreground line-through opacity-70"}`}>
                                                                                        {rule}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Before/After Images */}
                                                            {(trade.image_before || trade.image_after) && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                        <Camera className="w-3.5 h-3.5" />
                                                                        Chart Screenshots
                                                                    </p>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {trade.image_before && (
                                                                            <div className="relative group rounded-xl overflow-hidden border border-border/30">
                                                                                <img
                                                                                    src={trade.image_before}
                                                                                    alt="Before Entry"
                                                                                    onClick={(e) => { e.stopPropagation(); setLightboxImage(trade.image_before || null); }}
                                                                                    className="w-full object-contain cursor-pointer"
                                                                                />
                                                                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-semibold uppercase tracking-wider pointer-events-none">
                                                                                    Before — Setup / Entry
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {trade.image_after && (
                                                                            <div className="relative group rounded-xl overflow-hidden border border-border/30">
                                                                                <img
                                                                                    src={trade.image_after}
                                                                                    alt="After Result"
                                                                                    onClick={(e) => { e.stopPropagation(); setLightboxImage(trade.image_after || null); }}
                                                                                    className="w-full object-contain cursor-pointer"
                                                                                />
                                                                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-semibold uppercase tracking-wider pointer-events-none">
                                                                                    After — Result / Outcome
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Quick Actions */}
                                                            <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border/10">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleCapture(trade); }}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all mr-auto"
                                                                >
                                                                    <Share2 className="w-3.5 h-3.5" />
                                                                    Capture & Share
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setTradeToEdit(trade); }}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border/50 transition-colors"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                    Edit Trade
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setTradeToDelete(trade.id); }}
                                                                    disabled={isDeleting === trade.id}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isDeleting === trade.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                                    {isDeleting === trade.id ? "Deleting..." : "Delete Trade"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Modals and Overlays */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            src={lightboxImage}
                            className="max-w-full max-h-full rounded-lg shadow-2xl"
                            alt="Lightbox"
                        />
                        <button
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            onClick={() => setLightboxImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )}

            <ConfirmModal
                isOpen={!!tradeToDelete}
                onClose={() => setTradeToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Trade Log"
                description="Are you sure you want to delete this trade? This action cannot be undone and will permanently remove this record from your journal."
                confirmText="Delete Trade"
                cancelText="Keep Trade"
                isDestructive={true}
            />

            <LogTradeModal
                open={!!tradeToEdit}
                onClose={() => setTradeToEdit(null)}
                tradeToEdit={tradeToEdit}
            />

            <BrokerImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
            />

            {/* Hidden Capture Area */}
            <div className="fixed -left-[9999px] top-0 overflow-hidden pointer-events-none" aria-hidden="true">
                {expandedId && filteredTrades.find(t => t.id === expandedId) && (
                    <div id={`share-card-${expandedId}`}>
                        <TradeShareCard
                            trade={filteredTrades.find(t => t.id === expandedId)!}
                            userName={userName}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function JournalClient(props: JournalClientProps) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20 text-muted-foreground text-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-accent" />
                Loading Journal...
            </div>
        }>
            <JournalClientContent {...props} />
        </Suspense>
    );
}
