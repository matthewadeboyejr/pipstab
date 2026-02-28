"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, TrendingUp, TrendingDown, ImagePlus, Camera } from "lucide-react";

interface LogTradeModalProps {
    open: boolean;
    onClose: () => void;
}

const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "USD/CAD", "AUD/USD", "NZD/USD", "XAU/USD", "BTC/USD", "ETH/USD", "NAS100", "US30"];
const setups = ["Break & Retest", "Order Block", "FVG", "Liquidity Sweep", "Trendline Break", "Supply/Demand", "Other"];
const emotions = ["Calm", "Confident", "Anxious", "Fearful", "Euphoric", "Frustrated", "Neutral"];
const sessions = ["London", "New York", "Asia", "London/NY Overlap"];

// ─── Inline Image Upload ────────────────────────────────────
function ModalImageUpload({
    label,
    image,
    onUpload,
    onRemove,
}: {
    label: string;
    image: string | null;
    onUpload: (url: string) => void;
    onRemove: () => void;
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

    if (image) {
        return (
            <div className="relative group rounded-xl overflow-hidden border border-border/30">
                <img src={image} alt={label} className="w-full h-28 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={onRemove} className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-semibold uppercase tracking-wider">
                    {label}
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDragging ? "border-accent bg-accent/5" : "border-border/40 hover:border-accent/40 hover:bg-accent/5"
                }`}
        >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <ImagePlus className="w-5 h-5 text-accent/60" />
            <p className="text-[10px] font-semibold text-foreground">{label}</p>
            <p className="text-[9px] text-muted-foreground">Drop or click</p>
        </div>
    );
}

export default function LogTradeModal({ open, onClose }: LogTradeModalProps) {
    const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [afterImage, setAfterImage] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Wire to backend / state
        onClose();
    };

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Panel — slides in from right, full height */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="fixed top-0 right-0 z-50 h-full w-full max-w-[520px] bg-card border-l border-border/50 shadow-2xl flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                                <h2 className="text-base font-semibold text-foreground font-['Montserrat']">Log Trade</h2>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Direction */}
                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Direction</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setDirection("LONG")}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${direction === "LONG"
                                                ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/30"
                                                : "bg-secondary text-muted-foreground border border-border/30"
                                                }`}
                                        >
                                            <TrendingUp className="w-4 h-4" /> Long
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDirection("SHORT")}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${direction === "SHORT"
                                                ? "bg-red-400/15 text-red-400 border border-red-400/30"
                                                : "bg-secondary text-muted-foreground border border-border/30"
                                                }`}
                                        >
                                            <TrendingDown className="w-4 h-4" /> Short
                                        </button>
                                    </div>
                                </div>

                                {/* Pair + Session */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Pair</label>
                                        <select className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {pairs.map((p) => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Session</label>
                                        <select className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Date</label>
                                    <input
                                        type="date"
                                        defaultValue={new Date().toISOString().split("T")[0]}
                                        className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>

                                {/* Entry + Exit + SL */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Entry Price", placeholder: "1.0850" },
                                        { label: "Exit Price", placeholder: "1.0920" },
                                        { label: "Stop Loss", placeholder: "1.0810" },
                                    ].map((f) => (
                                        <div key={f.label}>
                                            <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">{f.label}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder={f.placeholder}
                                                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Lot Size + R:R + P&L */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Lot Size</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.50"
                                            className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">R:R</label>
                                        <input
                                            type="text"
                                            placeholder="1:2.5"
                                            className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">P&L ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="245.50"
                                            className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Setup + Emotion */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Setup</label>
                                        <select className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {setups.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Emotion</label>
                                        <select className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {emotions.map((e) => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Chart Screenshots */}
                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                                        <Camera className="w-3.5 h-3.5" />
                                        Chart Screenshots
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ModalImageUpload
                                            label="Before — Setup"
                                            image={beforeImage}
                                            onUpload={setBeforeImage}
                                            onRemove={() => setBeforeImage(null)}
                                        />
                                        <ModalImageUpload
                                            label="After — Result"
                                            image={afterImage}
                                            onUpload={setAfterImage}
                                            onRemove={() => setAfterImage(null)}
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Notes</label>
                                    <textarea
                                        rows={3}
                                        placeholder="What was your reasoning? Any rule violations? What did you learn?"
                                        className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-foreground hover:brightness-110 transition-all font-['Montserrat']"
                                    >
                                        Save Trade
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
