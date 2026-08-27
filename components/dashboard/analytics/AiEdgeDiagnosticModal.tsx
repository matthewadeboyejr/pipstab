"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, Award, ShieldAlert, Target, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AiEdgeDiagnosticModalProps {
    stats: any;
    trades: any[];
}

export default function AiEdgeDiagnosticModal({ stats, trades }: AiEdgeDiagnosticModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [diagnostic, setDiagnostic] = useState<any>(null);
    const { addToast } = useToast();

    const runDiagnostic = async () => {
        setIsLoading(true);
        setIsOpen(true);

        try {
            const tradesSummary = trades.slice(0, 15).map(t => 
                `${t.pair} (${t.direction}) on ${t.setup}: PnL $${t.raw_pnl}, Session: ${t.session}`
            ).join("; ");

            const res = await fetch("/api/ai/analytics-diagnostic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stats, tradesSummary }),
            });

            if (!res.ok) throw new Error("Failed to generate diagnostic");

            const data = await res.json();
            setDiagnostic(data);
            addToast("AI Institutional Edge Diagnostic Ready!", "success");
        } catch (error: any) {
            console.error("Diagnostic error:", error);
            addToast(error.message || "Failed to generate diagnostic", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                id="tour-ai-diagnostic"
                onClick={runDiagnostic}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:brightness-110 shadow-lg shadow-accent/20 transition-all font-['Montserrat'] active:scale-[0.98]"
            >
                <Sparkles className="w-3.5 h-3.5" />
                Run AI Edge Diagnostic
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground font-['Montserrat']">
                                        AI Institutional Edge Diagnostic
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Empirical risk auditing and alpha optimization
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
                                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                    <p className="text-sm font-bold text-foreground">
                                        Synthesizing Quantitative Risk Metrics...
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        Auditing win-to-loss ratios, drawdown variance, and discipline compliance.
                                    </p>
                                </div>
                            ) : diagnostic ? (
                                <div className="space-y-6">
                                    {/* Overall Grade & Edge Status Banner */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-accent/15 via-white/[0.02] to-transparent border border-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                                                Edge Verdict
                                            </span>
                                            <h4 className="text-base font-extrabold text-foreground font-['Montserrat']">
                                                {diagnostic.edge_status}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                Prop Firm Readiness:{" "}
                                                <span className="text-accent font-bold">
                                                    {diagnostic.prop_firm_readiness?.status}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="w-16 h-16 rounded-2xl bg-accent text-accent-foreground font-black text-2xl flex flex-col items-center justify-center shadow-lg shadow-accent/20 shrink-0">
                                            <span className="text-[9px] uppercase font-mono tracking-widest opacity-80">GRADE</span>
                                            <span>{diagnostic.overall_grade}</span>
                                        </div>
                                    </div>

                                    {/* Edge & Vulnerability Breakdown */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                                                <Target className="w-3.5 h-3.5" /> Primary Mathematical Edge
                                            </div>
                                            <p className="text-xs text-foreground/90 leading-relaxed">
                                                {diagnostic.primary_edge}
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 font-mono">
                                                <ShieldAlert className="w-3.5 h-3.5" /> Critical Vulnerability
                                            </div>
                                            <p className="text-xs text-foreground/90 leading-relaxed">
                                                {diagnostic.critical_vulnerability}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantitative Commentary */}
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/40 space-y-1.5">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                                            Risk Manager Assessment
                                        </span>
                                        <p className="text-xs text-foreground/90 leading-relaxed">
                                            {diagnostic.key_metrics_commentary}
                                        </p>
                                    </div>

                                    {/* Actionable Directives */}
                                    <div className="space-y-2.5">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-accent" />
                                            Top 3 Profitability Directives
                                        </span>
                                        <div className="space-y-2">
                                            {diagnostic.actionable_directives?.map((rule: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.015] border border-border/30 text-xs text-foreground/90"
                                                >
                                                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                                                        {i + 1}
                                                    </span>
                                                    <span className="leading-relaxed">{rule}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
