"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, X, Loader2, FileCheck, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { parseTradeFile, ParsedTrade } from "@/utils/parsers/tradeParser";
import { useRouter } from "next/navigation";
import { BROKERS } from "@/utils/brokers";
import { useAccounts } from "@/context/AccountContext";

export default function BrokerImport({ onImportSuccess }: { onImportSuccess?: () => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewTrades, setPreviewTrades] = useState<ParsedTrade[]>([]);
    const { accounts, activeAccount } = useAccounts();
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [showGuide, setShowGuide] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Set initial account
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(activeAccount?.id || accounts[0].id);
        }
    }, [accounts, activeAccount, selectedAccountId]);

    const supabase = createClient();
    const { addToast } = useToast();
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'csv' && ext !== 'html' && ext !== 'htm') {
            addToast("Please upload a .csv or .html file", "error");
            return;
        }

        setSelectedFile(file);
        setIsProcessing(true);

        try {
            const trades = await parseTradeFile(file);
            setPreviewTrades(trades);
            if (trades.length === 0) {
                addToast("No valid trades found in this file.", "error");
            } else {
                addToast(`Successfully parsed ${trades.length} trades.`, "success");
            }
        } catch (error: any) {
            console.error(error);
            addToast(error.message || "Failed to parse file.", "error");
            setSelectedFile(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        if (previewTrades.length === 0) return;
        setIsProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const targetAccount = accounts.find(a => a.id === selectedAccountId);
            if (!targetAccount) throw new Error("Please select a target account");

            // Format for database insertion
            const payload = previewTrades.map(trade => ({
                user_id: user.id,
                account_id: targetAccount.id,
                ticket: trade.ticket,
                pair: trade.pair,
                direction: trade.direction.toLowerCase(),
                date: trade.date,
                entry_price: trade.entry_price,
                exit_price: trade.exit_price,
                stop_loss: trade.sl,
                lot_size: trade.lot_size,
                pnl: trade.pnl,
                session: trade.session,
                setup: trade.setup,
                emotion: trade.emotion,
                notes: trade.notes,
                broker: targetAccount.broker,
                checklist_results: {},
            }));

            // We use upsert with onConflict user_id,ticket to prevent duplicates
            const { error } = await supabase
                .from("trades")
                .upsert(payload, { onConflict: "user_id,ticket", ignoreDuplicates: true });

            if (error) throw error;

            addToast("Imports completed! Duplicates were ignored.", "success");

            // Reset state
            setSelectedFile(null);
            setPreviewTrades([]);
            if (onImportSuccess) onImportSuccess();
            router.refresh();

        } catch (error: any) {
            console.error("Import error:", error);
            addToast(error.message || "Failed to import database rows", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewTrades([]);
    };

    return (
        <div className="space-y-4">
            {!selectedFile ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`
                        w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                        ${isDragging ? "border-accent bg-accent/5 backdrop-blur-sm" : "border-border/50 hover:border-accent/40 hover:bg-white/[0.02]"}
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".csv, .html, .htm"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full mb-3 bg-accent/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Click or drag file to import</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">
                        Supports MT4/MT5 History Reports (.html) or Generic CSVs (.csv)
                    </p>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowGuide(!showGuide); }}
                        className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1.5"
                    >
                        How to export from MetaTrader?
                    </button>

                    <AnimatePresence>
                        {showGuide && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden w-full mt-4 pt-4 border-t border-border/20"
                            >
                                <div className="space-y-4 text-left">
                                    <div>
                                        <p className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1">MetaTrader 4 (MT4)</p>
                                        <ol className="text-[11px] text-muted-foreground list-decimal list-inside space-y-1">
                                            <li>Go to the <span className="text-foreground">Account History</span> tab.</li>
                                            <li>Right-click mapping and select <span className="text-foreground">All History</span>.</li>
                                            <li>Right-click again and select <span className="text-foreground">Save as Report</span>.</li>
                                            <li>Upload the <span className="text-foreground">.html</span> file here.</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1">MetaTrader 5 (MT5)</p>
                                        <ol className="text-[11px] text-muted-foreground list-decimal list-inside space-y-1">
                                            <li>Go to the <span className="text-foreground">History</span> tab.</li>
                                            <li>Right-click and select <span className="text-foreground">Report</span> → <span className="text-foreground">HTML</span>.</li>
                                            <li>Save the file and upload it here.</li>
                                        </ol>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="rounded-xl border border-border/50 p-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <FileCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-foreground truncate max-w-[200px]">{selectedFile.name}</h3>
                                <p className="text-[11px] text-muted-foreground">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearFile}
                            disabled={isProcessing}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 text-accent animate-spin mb-3" />
                            <p className="text-sm text-muted-foreground">Scanning trades...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-accent font-medium leading-tight">
                                        Identified {previewTrades.length} trades
                                    </p>
                                    <p className="text-[11px] text-accent/80 mt-1">
                                        We check for duplicates using Ticket IDs. Only new trades will be added to your journal.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Target Trading Account</label>
                                <select
                                    value={selectedAccountId}
                                    onChange={(e) => setSelectedAccountId(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.broker})</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={previewTrades.length === 0}
                                className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all font-['Montserrat'] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                Import to Journal
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
