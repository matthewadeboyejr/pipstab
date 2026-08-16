"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X,
    Printer,
    Download,
    Copy,
    Check,
    Compass,
    Layers,
    Target,
    Sparkles,
    Shield,
    Loader2,
    TrendingUp,
    TrendingDown,
    Activity,
    FileText,
    Sun,
    Moon,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    Zap,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { OutlookItem } from "./CreateOutlookModal";
import { toPng } from "html-to-image";
import { useToast } from "@/context/ToastContext";
import { format } from "date-fns";

export interface OutlookAuditData {
    confluenceScore: number;
    confluenceRating: "HIGH CONFLUENCE" | "MODERATE CONFLUENCE" | "HIGH RISK" | "CONFLICTED BIAS";
    timeframeAlignmentSummary: string;
    alignmentStrengths: string[];
    blindSpots: string[];
    riskInvalidationCheck: string;
    executiveDirective: string;
}

interface OutlookDossierModalProps {
    open: boolean;
    onClose: () => void;
    outlook: OutlookItem | null;
    userName?: string;
    autoAudit?: boolean;
}

export default function OutlookDossierModal({
    open,
    onClose,
    outlook,
    userName = "Matthew Adeboye",
    autoAudit = false,
}: OutlookDossierModalProps) {
    const { addToast } = useToast();
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLightMode, setIsLightMode] = useState(false);

    // AI Audit state
    const [aiAudit, setAiAudit] = useState<OutlookAuditData | null>(null);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);
    const [includeAiInExport, setIncludeAiInExport] = useState(true);

    const dossierRef = useRef<HTMLDivElement>(null);

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

    const htfImgs = parseImages(outlook?.htf_images || null);
    const itfImgs = parseImages(outlook?.itf_images || null);
    const ltfImgs = parseImages(outlook?.ltf_images || null);
    const poiImgs = parseImages(outlook?.poi_images || null);

    const formattedDate = outlook?.created_at
        ? format(new Date(outlook.created_at), "MMMM d, yyyy")
        : "Recent";

    const docId = outlook
        ? `DOC-${outlook.pair.replace("/", "")}-${outlook.id.slice(0, 6).toUpperCase()}`
        : "DOC-OUTLOOK";

    // Trigger AI Audit
    const handleRunAiAudit = async () => {
        if (!outlook) return;
        setIsLoadingAudit(true);

        try {
            const res = await fetch("/api/ai/audit-outlook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pair: outlook.pair,
                    direction: outlook.direction,
                    title: outlook.title,
                    htf_narrative: outlook.htf_narrative,
                    itf_narrative: outlook.itf_narrative,
                    ltf_narrative: outlook.ltf_narrative,
                    poi_narrative: outlook.poi_narrative,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to audit outlook");

            setAiAudit(data.audit);
            setIncludeAiInExport(true);
            addToast("AI Strategy Audit completed successfully!", "success");
        } catch (err: any) {
            console.error("AI Audit error:", err);
            addToast(err.message || "Failed to run AI Audit", "error");
        } finally {
            setIsLoadingAudit(false);
        }
    };

    // Auto-run if requested
    useEffect(() => {
        if (open && autoAudit && outlook && !aiAudit && !isLoadingAudit) {
            handleRunAiAudit();
        }
    }, [open, autoAudit, outlook]);

    if (!open || !outlook) return null;

    /**
     * Dedicated Isolated Print Engine
     * Generates a pixel-perfect standalone HTML print document without web UI clipping
     */
    const handlePrintPdf = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            window.print();
            return;
        }

        const bg = isLightMode ? "#F8FAFC" : "#070A11";
        const cardBg = isLightMode ? "#FFFFFF" : "#0D1320";
        const textMain = isLightMode ? "#0F172A" : "#F1F5F9";
        const textMuted = isLightMode ? "#64748B" : "#94A3B8";
        const borderCol = isLightMode ? "#E2E8F0" : "#1E293B";
        const accent = "#22C55E";

        const dirColor = outlook.direction === "LONG" ? "#10B981" : outlook.direction === "SHORT" ? "#EF4444" : "#F59E0B";

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>PipTab Strategy Dossier - ${outlook.pair} - ${outlook.title}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: ${bg};
            color: ${textMain};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            line-height: 1.5;
            font-size: 12px;
        }
        .page {
            page-break-after: always;
            break-after: page;
            min-height: 98vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-bottom: 20px;
        }
        .last-page {
            page-break-after: auto;
            break-after: auto;
        }
        .header-box {
            background: ${cardBg};
            border: 1px solid ${borderCol};
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 16px;
        }
        .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid ${borderCol};
            padding-bottom: 12px;
            margin-bottom: 12px;
        }
        .brand {
            font-size: 14px;
            font-weight: 900;
            color: ${accent};
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .doc-id {
            font-family: monospace;
            font-size: 11px;
            color: ${textMuted};
        }
        .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .title {
            font-size: 18px;
            font-weight: 800;
            color: ${textMain};
        }
        .badge-group {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .pair-badge {
            background: ${isLightMode ? "#F1F5F9" : "#1E293B"};
            border: 1px solid ${borderCol};
            padding: 4px 10px;
            border-radius: 8px;
            font-family: monospace;
            font-weight: 800;
            font-size: 13px;
        }
        .dir-badge {
            background: ${dirColor}20;
            border: 1px solid ${dirColor}50;
            color: ${dirColor};
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 14px;
            flex: 1;
        }
        .stage-card {
            background: ${cardBg};
            border: 1px solid ${borderCol};
            border-radius: 12px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .stage-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid ${borderCol};
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .stage-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stage-tag {
            font-size: 10px;
            font-family: monospace;
            padding: 2px 6px;
            border-radius: 4px;
            background: ${isLightMode ? "#F1F5F9" : "#1E293B"};
            color: ${accent};
            font-weight: bold;
        }
        .img-container {
            border: 1px solid ${borderCol};
            border-radius: 8px;
            overflow: hidden;
            background: #000;
            height: 180px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .img-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .no-img {
            color: ${textMuted};
            font-size: 11px;
            text-align: center;
            padding: 20px;
        }
        .narrative {
            background: ${isLightMode ? "#F8FAFC" : "#0A0E17"};
            border: 1px solid ${borderCol};
            border-radius: 8px;
            padding: 10px;
            font-size: 11px;
            color: ${textMain};
            line-height: 1.5;
            white-space: pre-line;
            max-height: 120px;
            overflow: hidden;
        }
        .footer-bar {
            background: ${cardBg};
            border: 1px solid ${borderCol};
            border-radius: 10px;
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: monospace;
            font-size: 10px;
            color: ${textMuted};
        }
        .ai-box {
            background: ${cardBg};
            border: 1px solid #10B98150;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .ai-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #10B98130;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .ai-title {
            font-size: 13px;
            font-weight: 800;
            color: #10B981;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .ai-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
        }
        .ai-col {
            background: ${isLightMode ? "#F8FAFC" : "#0A0E17"};
            border: 1px solid ${borderCol};
            border-radius: 8px;
            padding: 10px;
            font-size: 11px;
        }
        .ai-col h4 {
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 6px;
            color: ${accent};
            font-weight: bold;
        }
        .ai-directive {
            font-style: italic;
            color: ${textMain};
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <!-- PAGE 1: MACRO CONTEXT (HTF & ITF) -->
    <div class="page">
        <div>
            <div class="header-box">
                <div class="meta-row">
                    <div class="brand">PipTab Institutional Analytics</div>
                    <div class="doc-id">Reference: ${docId} • Date: ${formattedDate} • Analyst: ${userName}</div>
                </div>
                <div class="title-row">
                    <div>
                        <div style="font-size: 10px; text-transform: uppercase; color: ${textMuted}; font-weight: bold;">Top-Down Market Strategy Dossier</div>
                        <div class="title">${outlook.title}</div>
                    </div>
                    <div class="badge-group">
                        <div class="pair-badge">${outlook.pair}</div>
                        <div class="dir-badge">${outlook.direction} DISPLACEMENT</div>
                    </div>
                </div>
            </div>

            <div class="grid-2">
                <!-- HTF -->
                <div class="stage-card">
                    <div class="stage-head">
                        <span class="stage-title">1. Higher Timeframe (HTF)</span>
                        <span class="stage-tag">Macro Context</span>
                    </div>
                    <div class="img-container">
                        ${htfImgs.length > 0 ? `<img src="${htfImgs[0]}" alt="HTF Chart"/>` : `<div class="no-img">No HTF Screenshot</div>`}
                    </div>
                    <div class="narrative">
                        <strong>Draw on Liquidity (DOL):</strong><br/>
                        ${outlook.htf_narrative || "No narrative recorded."}
                    </div>
                </div>

                <!-- ITF -->
                <div class="stage-card">
                    <div class="stage-head">
                        <span class="stage-title">2. Intermediate Timeframe (ITF)</span>
                        <span class="stage-tag">Market Structure</span>
                    </div>
                    <div class="img-container">
                        ${itfImgs.length > 0 ? `<img src="${itfImgs[0]}" alt="ITF Chart"/>` : `<div class="no-img">No ITF Screenshot</div>`}
                    </div>
                    <div class="narrative">
                        <strong>Market Shift & CISD:</strong><br/>
                        ${outlook.itf_narrative || "No narrative recorded."}
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-bar">
            <span>PipTab Intelligence • Page 1 of ${aiAudit && includeAiInExport ? 3 : 2}</span>
            <span>Macro Context & Structural Alignment</span>
        </div>
    </div>

    <!-- PAGE 2: EXECUTION & TIMING (LTF & POI) -->
    <div class="page ${aiAudit && includeAiInExport ? "" : "last-page"}">
        <div>
            <div class="header-box">
                <div class="title-row">
                    <div>
                        <div style="font-size: 10px; text-transform: uppercase; color: ${textMuted}; font-weight: bold;">Execution & POI Timing</div>
                        <div style="font-size: 14px; font-weight: 800;">${outlook.title} • ${outlook.pair}</div>
                    </div>
                    <div class="dir-badge">${outlook.direction}</div>
                </div>
            </div>

            <div class="grid-2">
                <!-- LTF -->
                <div class="stage-card">
                    <div class="stage-head">
                        <span class="stage-title">3. Lower Timeframe (LTF)</span>
                        <span class="stage-tag">Execution Range</span>
                    </div>
                    <div class="img-container">
                        ${ltfImgs.length > 0 ? `<img src="${ltfImgs[0]}" alt="LTF Chart"/>` : `<div class="no-img">No LTF Screenshot</div>`}
                    </div>
                    <div class="narrative">
                        <strong>Displacement Flow:</strong><br/>
                        ${outlook.ltf_narrative || "No narrative recorded."}
                    </div>
                </div>

                <!-- POI -->
                <div class="stage-card">
                    <div class="stage-head">
                        <span class="stage-title">4. Point of Interest (POI)</span>
                        <span class="stage-tag">Entry Trigger</span>
                    </div>
                    <div class="img-container">
                        ${poiImgs.length > 0 ? `<img src="${poiImgs[0]}" alt="POI Chart"/>` : `<div class="no-img">No POI Screenshot</div>`}
                    </div>
                    <div class="narrative">
                        <strong>Order Block & Invalidation:</strong><br/>
                        ${outlook.poi_narrative || "No narrative recorded."}
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-bar">
            <span>PipTab Intelligence • Page 2 of ${aiAudit && includeAiInExport ? 3 : 2}</span>
            <span>Execution Parameters & Invalidation Rules</span>
        </div>
    </div>

    <!-- PAGE 3: AI STRATEGY AUDIT (If enabled) -->
    ${aiAudit && includeAiInExport ? `
    <div class="page last-page">
        <div>
            <div class="header-box">
                <div class="title-row">
                    <div>
                        <div style="font-size: 10px; text-transform: uppercase; color: ${textMuted}; font-weight: bold;">AI Institutional Strategy Audit</div>
                        <div style="font-size: 14px; font-weight: 800;">${outlook.title} • ${outlook.pair}</div>
                    </div>
                    <div style="font-family: monospace; font-size: 13px; font-weight: 900; color: #10B981;">
                        Confluence: ${aiAudit.confluenceScore}/100 (${aiAudit.confluenceRating})
                    </div>
                </div>
            </div>

            <div class="ai-box">
                <div class="ai-head">
                    <div class="ai-title">⚡ Gemini AI Strategy Audit & Confluence Verdict</div>
                    <div style="font-family: monospace; font-size: 10px; color: ${textMuted};">Objective Structural Review</div>
                </div>

                <div class="ai-grid">
                    <div class="ai-col">
                        <h4>✓ Timeframe Alignment</h4>
                        <p style="margin-bottom: 8px;">${aiAudit.timeframeAlignmentSummary}</p>
                        <ul style="padding-left: 14px; color: ${textMuted};">
                            ${aiAudit.alignmentStrengths.map(s => `<li>${s}</li>`).join("")}
                        </ul>
                    </div>

                    <div class="ai-col" style="border-color: #F59E0B40;">
                        <h4 style="color: #F59E0B;">⚠️ Blind Spots & Traps</h4>
                        <ul style="padding-left: 14px; color: ${isLightMode ? "#9A3412" : "#FDE68A"};">
                            ${aiAudit.blindSpots.map(b => `<li>${b}</li>`).join("")}
                        </ul>
                    </div>

                    <div class="ai-col">
                        <h4>🎯 Action Directive</h4>
                        <p class="ai-directive">"${aiAudit.executiveDirective}"</p>
                        <p style="margin-top: 8px; font-family: monospace; font-size: 10px; color: ${textMuted};">
                            Risk Check: ${aiAudit.riskInvalidationCheck}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-bar">
            <span>PipTab Intelligence • Page 3 of 3</span>
            <span>Verified Institutional Strategy Framework • ${formattedDate}</span>
        </div>
    </div>
    ` : ""}
</body>
</html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 300);
        };
    };

    const handleDownloadPng = async () => {
        if (!dossierRef.current) return;
        setIsGeneratingImage(true);

        try {
            const node = dossierRef.current;
            const dataUrl = await toPng(node, {
                quality: 1,
                pixelRatio: 2,
                cacheBust: true,
                backgroundColor: isLightMode ? "#F8FAFC" : "#070A11",
                height: node.scrollHeight,
                style: {
                    maxHeight: "none",
                    overflow: "visible",
                },
            });

            const link = document.createElement("a");
            link.download = `PipTab-Dossier-${outlook.pair.replace("/", "")}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            addToast("Full high-resolution strategy dossier downloaded", "success");
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

${aiAudit ? `⚡ AI CONFLUENCE SCORE: ${aiAudit.confluenceScore}/100 (${aiAudit.confluenceRating})
• Timeframe Alignment: ${aiAudit.timeframeAlignmentSummary}
• Executive Directive: ${aiAudit.executiveDirective}
` : ""}
1. HIGHER TIMEFRAME (HTF):
${outlook.htf_narrative || "No narrative."}

2. INTERMEDIATE TIMEFRAME (ITF):
${outlook.itf_narrative || "No narrative."}

3. LOWER TIMEFRAME (LTF):
${outlook.ltf_narrative || "No narrative."}

4. POINT OF INTEREST (POI):
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
                {/* Executive Control Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 px-6 border-b border-border/40 bg-[#0E1424]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-foreground font-['Montserrat']">
                                Institutional Market Strategy Dossier
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-mono">
                                Reference: {docId} • Multi-Page PDF & PNG Ready
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* AI Audit Trigger Button */}
                        <button
                            onClick={handleRunAiAudit}
                            disabled={isLoadingAudit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-extrabold text-emerald-400 hover:bg-emerald-500/25 transition-all shadow-sm disabled:opacity-50"
                        >
                            {isLoadingAudit ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Auditing Thesis...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>{aiAudit ? "Re-Scan with AI" : "⚡ AI Strategy Audit"}</span>
                                </>
                            )}
                        </button>

                        {/* Toggle AI in Export */}
                        {aiAudit && (
                            <button
                                onClick={() => setIncludeAiInExport(!includeAiInExport)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                    includeAiInExport
                                        ? "bg-accent/15 text-accent border-accent/30"
                                        : "bg-white/5 text-muted-foreground border-border/40"
                                }`}
                                title="Toggle AI Audit Section in PDF/PNG Export"
                            >
                                <span>AI in Export</span>
                                {includeAiInExport ? (
                                    <ToggleRight className="w-4 h-4 text-accent" />
                                ) : (
                                    <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>
                        )}

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

                {/* Interactive Preview Container */}
                <div
                    className={`overflow-y-auto custom-scrollbar transition-colors duration-200 ${
                        isLightMode
                            ? "bg-[#F8FAFC] text-[#0F172A]"
                            : "bg-[#070A11] text-[#E2E8F0]"
                    }`}
                >
                    <div
                        ref={dossierRef}
                        className="p-6 sm:p-10 space-y-8 w-full max-w-[1200px] mx-auto"
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
                                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
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
                                            <img src={htfImgs[0]} crossOrigin="anonymous" alt="HTF Chart" className="w-full h-full object-cover" />
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
                                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
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
                                            <img src={itfImgs[0]} crossOrigin="anonymous" alt="ITF Chart" className="w-full h-full object-cover" />
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
                                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
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
                                            <img src={ltfImgs[0]} crossOrigin="anonymous" alt="LTF Chart" className="w-full h-full object-cover" />
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
                                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
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
                                            <img src={poiImgs[0]} crossOrigin="anonymous" alt="POI Chart" className="w-full h-full object-cover" />
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
                                    <span>Stage 4 of 4</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. AI Strategy Auditor & Confluence Engine */}
                        {aiAudit && includeAiInExport && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-6 rounded-2xl border shadow-lg ${
                                    isLightMode
                                        ? "bg-emerald-50/70 border-emerald-300 text-slate-800"
                                        : "bg-gradient-to-r from-emerald-950/30 via-[#0B1520] to-[#0A121E] border-emerald-500/30 text-slate-200"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black shadow-sm">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-extrabold font-['Montserrat'] tracking-wide text-foreground flex items-center gap-2">
                                                <span>AI Institutional Strategy Audit & Confluence Verdict</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                                                    GEMINI AI AUDITED
                                                </span>
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground">
                                                Objective top-down thesis audit, structural risk checks & execution directive
                                            </p>
                                        </div>
                                    </div>

                                    {/* Score Pill */}
                                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 self-start sm:self-auto">
                                        <span className="text-xs font-mono font-bold text-muted-foreground">Confluence:</span>
                                        <span className="text-base font-black font-mono text-emerald-400">
                                            {aiAudit.confluenceScore}/100
                                        </span>
                                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                            {aiAudit.confluenceRating}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                                    {/* Alignment Strengths */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Timeframe Alignment</span>
                                        </span>
                                        <p className="text-xs leading-relaxed text-slate-300">
                                            {aiAudit.timeframeAlignmentSummary}
                                        </p>
                                        <ul className="space-y-1 pt-1">
                                            {aiAudit.alignmentStrengths.map((str, i) => (
                                                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                                    <span className="text-emerald-400 mt-0.5">•</span>
                                                    <span>{str}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Potential Blind Spots */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            <span>Potential Blind Spots & Traps</span>
                                        </span>
                                        <ul className="space-y-1.5">
                                            {aiAudit.blindSpots.map((spot, i) => (
                                                <li key={i} className="text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-1.5">
                                                    <span className="text-amber-400 mt-0.5">⚠️</span>
                                                    <span>{spot}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Executive Directive */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                            <span>Executive Action Directive</span>
                                        </span>
                                        <div className="p-3 rounded-xl bg-black/40 border border-border/40 text-xs text-foreground/90 font-medium leading-relaxed">
                                            "{aiAudit.executiveDirective}"
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            Risk Invalidation: {aiAudit.riskInvalidationCheck}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 4. Executive Dossier Verification Footer */}
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
                </div>
            </motion.div>
        </div>
    );
}
