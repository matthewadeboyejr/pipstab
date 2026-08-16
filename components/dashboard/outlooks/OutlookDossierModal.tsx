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
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Activity,
    FileText,
    Eye,
    Sun,
    Moon,
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
    userName = "Matthew Adeboye",
}: OutlookDossierModalProps) {
    const { addToast } = useToast();
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLightMode, setIsLightMode] = useState(false);
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

    const docId = `DOC-${outlook.pair.replace("/", "")}-${outlook.id.slice(0, 6).toUpperCase()}`;

    const handlePrintPdf = () => {
        window.print();
    };

    const handleDownloadPng = async () => {
        if (!dossierRef.current) return;
        setIsGeneratingImage(true);

        try {
            const dataUrl = await toPng(dossierRef.current, {
                quality: 1,
                pixelRatio: 2,
                cacheBust: true,
            });

            const link = document.createElement("a");
            link.download = `PipTab-Dossier-${outlook.pair.replace("/", "")}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            addToast("High-resolution strategy dossier downloaded", "success");
        } catch (err: any) {
            console.error("Export image failed:", err);
            addToast("Failed to generate image. Please use PDF Print.", "error");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleCopySummary = () => {
        const text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PIPTAB INSTITUTIONAL STRATEGY DOSSIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${outlook.title}
Asset: ${outlook.pair} | Bias: ${outlook.direction}
Date: ${formattedDate}
Analyst: ${userName}
Doc ID: ${docId}

1. HIGHER TIMEFRAME (HTF - Weekly/Monthly):
${outlook.htf_narrative || "No narrative."}

2. INTERMEDIATE TIMEFRAME (ITF - Daily):
${outlook.itf_narrative || "No narrative."}

3. LOWER TIMEFRAME (LTF - 4H/1H):
${outlook.ltf_narrative || "No narrative."}

4. POINT OF INTEREST (POI & Entry Trigger):
${outlook.poi_narrative || "No narrative."}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated via PipTab Analytics Platform`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast("Institutional strategy memo copied to clipboard", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="w-full max-w-5xl bg-[#090D16] border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            >
                {/* Executive Control Header (Hidden when printing) */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 px-6 border-b border-border/40 bg-[#0E1424] print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-foreground font-['Montserrat']">
                                Institutional Market Strategy Dossier
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-mono">
                                Reference: {docId} • Ready for PDF & PNG Export
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Light / Dark Mode Toggle for Dossier */}
                        <button
                            onClick={() => setIsLightMode(!isLightMode)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                            title="Toggle Dossier Theme"
                        >
                            {isLightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isLightMode ? "Dark Theme" : "Editorial White"}</span>
                        </button>

                        <button
                            onClick={handleCopySummary}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied" : "Copy Memo"}</span>
                        </button>

                        <button
                            onClick={handleDownloadPng}
                            disabled={isGeneratingImage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                        >
                            {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            <span>Download PNG</span>
                        </button>

                        <button
                            onClick={handlePrintPdf}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-extrabold hover:opacity-90 transition-all shadow-md shadow-accent/20"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Save PDF / Print</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors ml-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Document Container */}
                <div
                    ref={dossierRef}
                    className={`p-6 sm:p-10 overflow-y-auto space-y-8 custom-scrollbar transition-colors duration-200 ${
                        isLightMode
                            ? "bg-[#F8FAFC] text-[#0F172A]"
                            : "bg-[#070A11] text-[#E2E8F0]"
                    }`}
                >
                    {/* 1. Executive Top Dossier Banner */}
                    <div
                        className={`p-6 rounded-2xl border transition-all ${
                            isLightMode
                                ? "bg-white border-slate-200 shadow-sm"
                                : "bg-gradient-to-b from-[#111827] to-[#0D1320] border-border/60 shadow-xl"
                        }`}
                    >
                        {/* Top Line: Brand & Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-slate-950 font-bold shadow-md shadow-accent/20">
                                    <Compass className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold tracking-wider uppercase text-accent font-['Montserrat']">
                                            PipTab Analytics
                                        </span>
                                        <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-accent/15 text-accent border border-accent/30 uppercase">
                                            Institutional Briefing
                                        </span>
                                    </div>
                                    <h1 className="text-xl font-extrabold font-['Montserrat'] tracking-tight">
                                        Top-Down Market Strategy Dossier
                                    </h1>
                                </div>
                            </div>

                            <div className="text-left sm:text-right font-mono text-xs text-muted-foreground space-y-0.5">
                                <p>Reference: <strong className="text-foreground">{docId}</strong></p>
                                <p>Date: <strong className="text-foreground">{formattedDate}</strong></p>
                                <p>Lead Analyst: <strong className="text-accent">{userName}</strong></p>
                            </div>
                        </div>

                        {/* Title, Pair, and Direction Callout Strip */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-5">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-0.5">
                                    Market Analysis & Execution Directive
                                </span>
                                <h2 className="text-2xl font-black font-['Montserrat'] tracking-tight">
                                    {outlook.title}
                                </h2>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-border/40 text-base font-mono font-black tracking-wider">
                                    {outlook.pair}
                                </div>

                                <div
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm ${
                                        outlook.direction === "LONG"
                                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10"
                                            : outlook.direction === "SHORT"
                                            ? "bg-red-500/15 text-red-400 border-red-500/30 shadow-red-500/10"
                                            : "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10"
                                    }`}
                                >
                                    {outlook.direction === "LONG" ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : outlook.direction === "SHORT" ? (
                                        <TrendingDown className="w-4 h-4" />
                                    ) : (
                                        <Activity className="w-4 h-4" />
                                    )}
                                    <span>{outlook.direction} DISPLACEMENT</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Multi-Timeframe 2x2 Framing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* STAGE 1: Higher Timeframe (HTF) */}
                        <div
                            className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 page-break-inside-avoid ${
                                isLightMode
                                    ? "bg-white border-slate-200 shadow-sm"
                                    : "bg-[#0E1422] border-border/50"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                                            <Layers className="w-3.5 h-3.5" />
                                        </div>
                                        <h3 className="text-xs font-extrabold font-['Montserrat'] tracking-wide uppercase">
                                            1. Higher Timeframe (HTF)
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 uppercase">
                                        Macro Context
                                    </span>
                                </div>

                                {htfImgs.length > 0 && (
                                    <div className="rounded-xl overflow-hidden border border-border/40 bg-black/40 aspect-video">
                                        <img src={htfImgs[0]} alt="HTF Chart" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Macro Liquidity & DOL Analysis:
                                    </span>
                                    <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line font-sans ${
                                        isLightMode ? "bg-slate-50 border border-slate-200 text-slate-700" : "bg-black/30 border border-border/30 text-slate-300"
                                    }`}>
                                        {outlook.htf_narrative || "No higher timeframe narrative recorded."}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground/70 font-mono pt-2 border-t border-border/10 flex items-center justify-between">
                                <span>Core Driver: <strong>Draw on Liquidity (DOL)</strong></span>
                                <span>Stage 1 of 4</span>
                            </div>
                        </div>

                        {/* STAGE 2: Intermediate Timeframe (ITF) */}
                        <div
                            className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 page-break-inside-avoid ${
                                isLightMode
                                    ? "bg-white border-slate-200 shadow-sm"
                                    : "bg-[#0E1422] border-border/50"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                                            <Compass className="w-3.5 h-3.5" />
                                        </div>
                                        <h3 className="text-xs font-extrabold font-['Montserrat'] tracking-wide uppercase">
                                            2. Intermediate Timeframe (ITF)
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                                        Market Structure
                                    </span>
                                </div>

                                {itfImgs.length > 0 && (
                                    <div className="rounded-xl overflow-hidden border border-border/40 bg-black/40 aspect-video">
                                        <img src={itfImgs[0]} alt="ITF Chart" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Market Structure Shift & CISD:
                                    </span>
                                    <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line font-sans ${
                                        isLightMode ? "bg-slate-50 border border-slate-200 text-slate-700" : "bg-black/30 border border-border/30 text-slate-300"
                                    }`}>
                                        {outlook.itf_narrative || "No intermediate timeframe narrative recorded."}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground/70 font-mono pt-2 border-t border-border/10 flex items-center justify-between">
                                <span>Institutional Shift: <strong>CISD Alignment</strong></span>
                                <span>Stage 2 of 4</span>
                            </div>
                        </div>

                        {/* STAGE 3: Lower Timeframe (LTF) */}
                        <div
                            className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 page-break-inside-avoid ${
                                isLightMode
                                    ? "bg-white border-slate-200 shadow-sm"
                                    : "bg-[#0E1422] border-border/50"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                        <h3 className="text-xs font-extrabold font-['Montserrat'] tracking-wide uppercase">
                                            3. Lower Timeframe (LTF)
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                                        Execution Range
                                    </span>
                                </div>

                                {ltfImgs.length > 0 && (
                                    <div className="rounded-xl overflow-hidden border border-border/40 bg-black/40 aspect-video">
                                        <img src={ltfImgs[0]} alt="LTF Chart" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Displacement Legs & Pullback Range:
                                    </span>
                                    <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line font-sans ${
                                        isLightMode ? "bg-slate-50 border border-slate-200 text-slate-700" : "bg-black/30 border border-border/30 text-slate-300"
                                    }`}>
                                        {outlook.ltf_narrative || "No lower timeframe narrative recorded."}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground/70 font-mono pt-2 border-t border-border/10 flex items-center justify-between">
                                <span>Execution Range: <strong>Displacement Vector</strong></span>
                                <span>Stage 3 of 4</span>
                            </div>
                        </div>

                        {/* STAGE 4: Point of Interest (POI) */}
                        <div
                            className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 page-break-inside-avoid ${
                                isLightMode
                                    ? "bg-white border-slate-200 shadow-sm"
                                    : "bg-[#0E1422] border-border/50"
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                                            <Target className="w-3.5 h-3.5" />
                                        </div>
                                        <h3 className="text-xs font-extrabold font-['Montserrat'] tracking-wide uppercase">
                                            4. Point of Interest (POI)
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                        Entry Trigger
                                    </span>
                                </div>

                                {poiImgs.length > 0 && (
                                    <div className="rounded-xl overflow-hidden border border-border/40 bg-black/40 aspect-video">
                                        <img src={poiImgs[0]} alt="POI Chart" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Order Block, FVG & Invalidation Parameters:
                                    </span>
                                    <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line font-sans ${
                                        isLightMode ? "bg-slate-50 border border-slate-200 text-slate-700" : "bg-black/30 border border-border/30 text-slate-300"
                                    }`}>
                                        {outlook.poi_narrative || "No POI execution narrative recorded."}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground/70 font-mono pt-2 border-t border-border/10 flex items-center justify-between">
                                <span>Entry Invalidation: <strong>Optimal Execution</strong></span>
                                <span>Phase 4 of 4</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Executive Dossier Verification Footer */}
                    <div
                        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono ${
                            isLightMode
                                ? "bg-white border-slate-200 text-slate-500"
                                : "bg-[#0E1422] border-border/40 text-muted-foreground"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-accent" />
                            <span>PipTab Institutional Intelligence • Top-Down Market Architecture</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span>Status: <strong className="text-emerald-400">VERIFIED FRAMEWORK</strong></span>
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
