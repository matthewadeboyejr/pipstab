"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
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
} from "lucide-react";

// ─── Mock Data ──────────────────────────────────────────────
const trades = [
    { id: "1", pair: "EUR/USD", direction: "long" as const, entry: 1.0845, exit: 1.0892, pnl: 245.5, rr: "1:2.5", setup: "OB + FVG", session: "London", date: "2026-02-28", emotion: "Confident", notes: "Clean Order Block at H4 demand zone. Waited for displacement and entered on FVG fill." },
    { id: "2", pair: "GBP/JPY", direction: "short" as const, entry: 189.25, exit: 189.85, pnl: -120.0, rr: "1:1.5", setup: "BOS + Inducement", session: "NY", date: "2026-02-27", emotion: "FOMO", notes: "Entered too early without confirmation. Inducement wasn't fully swept." },
    { id: "3", pair: "XAU/USD", direction: "long" as const, entry: 2645.0, exit: 2683.0, pnl: 380.0, rr: "1:3.0", setup: "HTF OB", session: "London", date: "2026-02-27", emotion: "Calm", notes: "H4 bullish OB. Waited for M15 CHoCH for entry confirmation." },
    { id: "4", pair: "USD/CAD", direction: "short" as const, entry: 1.3585, exit: 1.3615, pnl: -85.0, rr: "1:2.0", setup: "Liquidity Sweep", session: "NY", date: "2026-02-26", emotion: "Anxious", notes: "Liquidity above EQH swept but no displacement followed. Stopped out." },
    { id: "5", pair: "NZD/USD", direction: "long" as const, entry: 0.617, exit: 0.6205, pnl: 190.0, rr: "1:2.0", setup: "OB + BOS", session: "Asian", date: "2026-02-26", emotion: "Neutral", notes: "Textbook setup. BOS on M15, entry on OB retest." },
    { id: "6", pair: "EUR/GBP", direction: "short" as const, entry: 0.8345, exit: 0.8312, pnl: 165.0, rr: "1:2.2", setup: "Supply Zone", session: "London", date: "2026-02-25", emotion: "Confident", notes: "Daily supply zone rejection with M5 CHoCH." },
    { id: "7", pair: "AUD/USD", direction: "long" as const, entry: 0.6425, exit: 0.6398, pnl: -135.0, rr: "1:1.8", setup: "FVG Fill", session: "Asian", date: "2026-02-25", emotion: "Revenge", notes: "Took this trade to recover previous loss. Not in playbook." },
    { id: "8", pair: "USD/JPY", direction: "short" as const, entry: 150.85, exit: 150.45, pnl: 267.0, rr: "1:2.7", setup: "OB + BOS", session: "NY", date: "2026-02-24", emotion: "Calm", notes: "Clean short setup after BOS below recent low. Entered at OB." },
];

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

// ─── Journal Page ───────────────────────────────────────────
export default function JournalPage() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [tradeImages, setTradeImages] = useState<Record<string, { before: string | null; after: string | null }>>({});
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const updateImage = (tradeId: string, type: "before" | "after", dataUrl: string | null) => {
        setTradeImages((prev) => ({
            ...prev,
            [tradeId]: { ...prev[tradeId], [type]: dataUrl },
        }));
    };

    const filteredTrades = trades.filter(
        (t) =>
            t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.setup.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-[1400px] mx-auto"
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
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Date Range</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
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
                                const images = tradeImages[trade.id] || { before: null, after: null };
                                const hasImages = images.before || images.after;
                                return (
                                    <>
                                        <motion.tr
                                            key={trade.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                                            className="border-b border-border/20 hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-3.5 text-sm font-semibold text-foreground">
                                                <div className="flex items-center gap-2">
                                                    {trade.pair}
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
                                                <td colSpan={10} className="px-6 py-5 bg-white/[0.01] border-b border-border/20">
                                                    <div className="space-y-4">
                                                        {/* Notes */}
                                                        <div>
                                                            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">Trade Notes</p>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">{trade.notes}</p>
                                                        </div>

                                                        {/* Before/After Images */}
                                                        <div>
                                                            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                <Camera className="w-3.5 h-3.5" />
                                                                Chart Screenshots
                                                            </p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <ImageUploadZone
                                                                    label="Before — Setup / Entry"
                                                                    image={images.before}
                                                                    onUpload={(url) => updateImage(trade.id, "before", url)}
                                                                    onRemove={() => updateImage(trade.id, "before", null)}
                                                                    onView={() => images.before && setLightboxImage(images.before)}
                                                                />
                                                                <ImageUploadZone
                                                                    label="After — Result / Outcome"
                                                                    image={images.after}
                                                                    onUpload={(url) => updateImage(trade.id, "after", url)}
                                                                    onRemove={() => updateImage(trade.id, "after", null)}
                                                                    onView={() => images.after && setLightboxImage(images.after)}
                                                                />
                                                            </div>
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
        </motion.div>
    );
}

