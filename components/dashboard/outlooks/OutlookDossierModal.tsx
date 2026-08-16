"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Printer,
    Download,
    Share2,
    Copy,
    Check,
    Compass,
    Layers,
    Target,
    Sparkles,
    Calendar,
    Globe,
    Shield,
    Loader2,
} from "lucide-react";
import { OutlookItem } from "./CreateOutlookModal";
import { toPng } from "html-to-image";
import { useToast } from "@/context/ToastContext";
import { format } from "date-fns";

interface OutlookDossierModalProps {
    open: boolean;
    onClose: () => void;
    outlook: OutlookItem | null;
    userName?: string;
}

export default function OutlookDossierModal({
    open,
    onClose,
    outlook,
    userName = "Trader",
}: OutlookDossierModalProps) {
    const { addToast } = useToast();
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [copied, setCopied] = useState(false);
    const dossierRef = useRef<HTMLDivElement>(null);

    if (!open || !outlook) return null;

    const parseImages = (imgs: string[] | string | null): string[] => {
        if (!imgs) return [];
        if (Array.isArray(imgs)) return imgs;
        try {
            const parsed = JSON.parse(imgs);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [imgs];
        }
    };

    const htfImgs = parseImages(outlook.htf_images);
    const itfImgs = parseImages(outlook.itf_images);
    const ltfImgs = parseImages(outlook.ltf_images);
    const poiImgs = parseImages(outlook.poi_images);

    const formattedDate = outlook.created_at
        ? format(new Date(outlook.created_at), "MMMM d, yyyy")
        : "Recent";

    const handlePrintPdf = () => {
        window.print();
    };

    const handleDownloadPng = async () => {
        if (!dossierRef.current) return;
        setIsGeneratingImage(true);

        try {
            const dataUrl = await toPng(dossierRef.current, {
                quality: 0.98,
                pixelRatio: 2,
                cacheBust: true,
            });

            const link = document.createElement("a");
            link.download = `PipTab-Outlook-${outlook.pair.replace("/", "")}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            addToast("Outlook dossier downloaded as high-res PNG", "success");
        } catch (err: any) {
            console.error("Export image failed:", err);
            addToast("Failed to generate image. Please use PDF Print.", "error");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleCopySummary = () => {
        const text = `📊 PipTab Top-Down Outlook: ${outlook.title}
Pair: ${outlook.pair} | Direction: ${outlook.direction}
Date: ${formattedDate}

[HTF]: ${outlook.htf_narrative || "N/A"}
[ITF]: ${outlook.itf_narrative || "N/A"}
[LTF]: ${outlook.ltf_narrative || "N/A"}
[POI]: ${outlook.poi_narrative || "N/A"}

Generated via PipTab Analytics`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast("Outlook narrative copied to clipboard", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-4xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header Action Bar */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-border/40 bg-gradient-to-r from-accent/10 via-card to-card print:hidden">
                    <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Institutional Outlook Dossier
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopySummary}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/30 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied!" : "Copy Text"}</span>
                        </button>

                        <button
                            onClick={handleDownloadPng}
                            disabled={isGeneratingImage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/30 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                        >
                            {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            <span>Save Image</span>
                        </button>

                        <button
                            onClick={handlePrintPdf}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-extrabold hover:opacity-90 transition-all shadow-md shadow-accent/20"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Save as PDF / Print</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors ml-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Dossier Container */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar bg-[#0B0F19] text-slate-100" ref={dossierRef}>
                    {/* Dossier Header */}
                    <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 shadow-md space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-slate-950 font-bold shadow-md shadow-accent/20">
                                    <Compass className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-extrabold text-white font-['Montserrat']">
                                            PipTab Top-Down Market Dossier
                                        </h1>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40 font-mono font-bold">
                                            INSTITUTIONAL
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Multi-Timeframe Market Structure & Execution Framing
                                    </p>
                                </div>
                            </div>

                            <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
                                <p>Date: <strong className="text-slate-200">{formattedDate}</strong></p>
                                <p>Trader: <strong className="text-accent">{userName}</strong></p>
                            </div>
                        </div>

                        {/* Title, Pair, and Direction */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                    Outlook Plan
                                </span>
                                <h2 className="text-lg font-bold text-white font-['Montserrat']">
                                    {outlook.title}
                                </h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono font-extrabold text-white">
                                    {outlook.pair}
                                </div>

                                <span
                                    className={`text-xs font-extrabold uppercase px-3 py-1.5 rounded-xl border ${
                                        outlook.direction === "LONG"
                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                            : outlook.direction === "SHORT"
                                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                    }`}
                                >
                                    {outlook.direction === "LONG" ? "▲ LONG BIAS" : outlook.direction === "SHORT" ? "▼ SHORT BIAS" : "◆ NEUTRAL BIAS"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Higher Timeframe (HTF) */}
                    <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-accent" />
                                <h3 className="text-sm font-bold text-white font-['Montserrat']">
                                    1. Higher Timeframe (HTF) — Weekly/Monthly
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                                Draw on Liquidity & Key Levels
                            </span>
                        </div>

                        {htfImgs.length > 0 && (
                            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40">
                                <img src={htfImgs[0]} alt="HTF Chart" className="w-full object-contain max-h-[380px]" />
                            </div>
                        )}

                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                            {outlook.htf_narrative || "No narrative recorded."}
                        </div>
                    </div>

                    {/* Section 2: Intermediate Timeframe (ITF) */}
                    <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Compass className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-bold text-white font-['Montserrat']">
                                    2. Intermediate Timeframe (ITF) — Daily
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                                Market Structure Shift & CISD
                            </span>
                        </div>

                        {itfImgs.length > 0 && (
                            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40">
                                <img src={itfImgs[0]} alt="ITF Chart" className="w-full object-contain max-h-[380px]" />
                            </div>
                        )}

                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                            {outlook.itf_narrative || "No narrative recorded."}
                        </div>
                    </div>

                    {/* Section 3: Lower Timeframe (LTF) */}
                    <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white font-['Montserrat']">
                                    3. Lower Timeframe (LTF) — 4H/1H
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                                Displacement & Pullback Range
                            </span>
                        </div>

                        {ltfImgs.length > 0 && (
                            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40">
                                <img src={ltfImgs[0]} alt="LTF Chart" className="w-full object-contain max-h-[380px]" />
                            </div>
                        )}

                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                            {outlook.ltf_narrative || "No narrative recorded."}
                        </div>
                    </div>

                    {/* Section 4: Point of Interest (POI) */}
                    <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-sm font-bold text-white font-['Montserrat']">
                                    4. Point of Interest (POI) — Execution & Invalidation
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                                Order Block & Entry Trigger
                            </span>
                        </div>

                        {poiImgs.length > 0 && (
                            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40">
                                <img src={poiImgs[0]} alt="POI Chart" className="w-full object-contain max-h-[380px]" />
                            </div>
                        )}

                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                            {outlook.poi_narrative || "No narrative recorded."}
                        </div>
                    </div>

                    {/* Dossier Footer Watermark */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span>PipTab Analytics • Professional Trade Journal & Execution Engine</span>
                        <span>Generated on {formattedDate}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
