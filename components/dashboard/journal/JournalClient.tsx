"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
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
} from "lucide-react";
import LogTradeModal from "@/components/dashboard/LogTradeModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import BrokerImportModal from "@/components/dashboard/settings/BrokerImportModal";
import { Upload, Share2 } from "lucide-react";
import { useAccounts } from "@/context/AccountContext";
import { toPng } from 'html-to-image';
import TradeShareCard from "./TradeShareCard";
import { useToast } from "@/context/ToastContext";

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


// ─── Journal Client ───────────────────────────────────────────
export default function JournalClient({ trades }: JournalClientProps) {
    const router = useRouter();
    const { addToast } = useToast();
    const supabase = createClient();
    const { activeAccount } = useAccounts();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [tradeImages, setTradeImages] = useState<Record<string, { before: string | null; after: string | null }>>({});
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
    const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
    const [importModalOpen, setImportModalOpen] = useState(false);

    const [userName, setUserName] = useState<string>("");

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
                    <button
                        onClick={() => setImportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-sm text-accent hover:bg-accent/20 hover:border-accent/30 transition-all font-medium whitespace-nowrap ml-auto"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Import Trade History</span>
                    </button>
                </div>
            </div>

            {/* Trade list */}
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
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
                                    <>
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
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Image Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-pointer"
                    >
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={lightboxImage}
                            alt="Full size chart"
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!tradeToDelete}
                onClose={() => setTradeToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Trade Log"
                description="Are you sure you want to delete this trade? This action cannot be undone and will permanently remove this record from your journal."
                confirmText="Delete Trade"
                cancelText="Keep Trade"
                isLoading={!!isDeleting}
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
                {expandedId && (
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
