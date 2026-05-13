"use client";

import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Camera, Zap } from "lucide-react";

interface Trade {
    id: string;
    pair: string;
    direction: "long" | "short";
    pnl: number;
    rr: string;
    setup: string;
    date: string;
    emotion: string;
    notes?: string;
    checklist_results?: Record<string, boolean>;
    image_before?: string | null;
    image_after?: string | null;
}

export default function TradeShareCard({ trade }: { trade: Trade }) {
    const hasImages = trade.image_before || trade.image_after;

    return (
        <div
            id={`share-card-${trade.id}`}
            className="w-[1000px] bg-[#0A0A0A] p-10 rounded-[32px] border border-white/10 relative overflow-hidden font-['Montserrat'] shadow-2xl"
            style={{
                backgroundImage: 'radial-gradient(circle at top right, rgba(234, 179, 8, 0.05), transparent), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent)'
            }}
        >
            {/* Header - App Style */}
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/5">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{trade.pair}</h2>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-lg bg-white/5 uppercase tracking-wider ${trade.direction === "long" ? "text-emerald-400" : "text-red-400"}`}>
                            {trade.direction === "long" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {trade.direction.toUpperCase()}
                        </span>
                        <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{trade.date}</span>
                        <span className="text-[10px] px-2 py-1 rounded bg-white/10 text-white/50 font-black tracking-widest uppercase">{trade.setup}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Result</div>
                    <div className={`text-5xl font-black leading-none tracking-tighter ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Content Layout - Same as App */}
            <div className="space-y-10">
                {/* Notes */}
                <div>
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4">Trade Notes</p>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                        {trade.notes || "No notes provided for this trade."}
                    </p>
                </div>

                {/* Rules - 4 Column Grid like App */}
                {trade.checklist_results && Object.keys(trade.checklist_results).length > 0 && (
                    <div>
                        <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Rules Execution
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                            {Object.entries(trade.checklist_results).map(([rule, passed]) => (
                                <div key={rule} className="flex items-start gap-3 bg-white/[0.02] rounded-xl p-3 border border-white/5">
                                    {passed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <span className={`text-[11px] font-bold leading-tight ${passed ? "text-white/90" : "text-white/30 line-through"}`}>
                                        {rule}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Full Images - Same as App */}
                {hasImages && (
                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Chart Screenshots
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {trade.image_before && (
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                                    <img src={trade.image_before} className="w-full object-contain max-h-[400px]" alt="Before" />
                                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 text-[10px] text-white/70 font-black uppercase tracking-wider">
                                        Before Entry
                                    </div>
                                </div>
                            )}
                            {trade.image_after && (
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                                    <img src={trade.image_after} className="w-full object-contain max-h-[400px]" alt="After" />
                                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 text-[10px] text-white/70 font-black uppercase tracking-wider">
                                        After Result
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Branding - Enhanced to match App exactly */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-[14px] flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent),0.3)]">
                        <Zap className="w-6 h-6 text-accent-foreground" fill="currentColor" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter font-['Montserrat']">
                        PIPSTAB<span className="text-accent text-3xl">.</span>
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Verified Performance Log</div>
                    <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-1.5">Captured via PipTab Trading Dashboard</div>
                </div>
            </div>
        </div>
    );
}
