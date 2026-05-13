"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, TrendingUp, TrendingDown, ImagePlus, Camera, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/utils/supabase/client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logTradeSchema, type LogTradeFormValues } from "@/schemas/logTradeSchema";
import { useRouter } from "next/navigation";
import { BROKERS } from "@/utils/brokers";
import { useAccounts } from "@/context/AccountContext";
import Loader from "@/components/loader/Loader";

interface LogTradeModalProps {
    open: boolean;
    onClose: () => void;
    tradeToEdit?: any;
}

const pairs = [
    "EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "USD/CAD", "AUD/USD", "NZD/USD", "XAU/USD", "BTC/USD", "ETH/USD", "NAS100", "US30",
    "V10 Index", "V25 Index", "V50 Index", "V75 Index", "V100 Index", 
    "V10 (1s) Index", "V25 (1s) Index", "V50 (1s) Index", "V75 (1s) Index", "V100 (1s) Index",
    "Crash 300", "Crash 500", "Crash 1000", 
    "Boom 300", "Boom 500", "Boom 1000",
    "Step Index", "Other"
];
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
    const { addToast } = useToast();

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) return;

            // Enforce 500kb limit
            if (file.size > 500 * 1024) {
                addToast("Image exceeds 500KB limit.", "error");
                return;
            }

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
            className={`flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDragging ? "border-accent bg-accent/5" : "border-border/40 hover:border-accent/40 hover:bg-accent/5"}`}
        >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <ImagePlus className="w-5 h-5 text-accent/60" />
            <p className="text-[10px] font-semibold text-foreground">{label}</p>
            <p className="text-[9px] text-muted-foreground">Drop or click</p>
        </div>
    );
}

export default function LogTradeModal({ open, onClose, tradeToEdit }: LogTradeModalProps) {
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [afterImage, setAfterImage] = useState<string | null>(null);
    const [customSetups, setCustomSetups] = useState<any[]>([]);
    const supabase = createClient();
    const { addToast } = useToast();
    const router = useRouter();
    const { accounts, activeAccount } = useAccounts();

    // Default to the first account if none is active
    const defaultAccountId = activeAccount?.id || (accounts.length > 0 ? accounts[0].id : "");

    // Setup React Hook Form strictly matching our exact UI schema
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LogTradeFormValues>({
        resolver: zodResolver(logTradeSchema),
        defaultValues: {
            direction: "LONG",
            pair: pairs[0],
            custom_pair: "",
            session: sessions[0],
            date: new Date().toISOString().split("T")[0],
            setup: setups[0],
            emotion: emotions[0],
            broker: "Manual",
            custom_broker: "",
            account_id: defaultAccountId,
        },
    });

    useEffect(() => {
        if (open) {
            supabase.from("setups").select("*").then(({ data }) => {
                if (data && data.length > 0) {
                    setCustomSetups(data);
                }
            });
        }
    }, [open]);

    useEffect(() => {
        if (tradeToEdit && open) {
            reset({
                direction: tradeToEdit.direction.toUpperCase() as "LONG" | "SHORT",
                pair: pairs.includes(tradeToEdit.pair) ? tradeToEdit.pair : "Other",
                custom_pair: pairs.includes(tradeToEdit.pair) ? "" : tradeToEdit.pair,
                session: tradeToEdit.session,
                date: tradeToEdit.rawDate ? new Date(tradeToEdit.rawDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                setup: tradeToEdit.setup,
                emotion: tradeToEdit.emotion,
                broker: BROKERS.includes(tradeToEdit.broker) ? tradeToEdit.broker : "Other (Not Listed)",
                custom_broker: BROKERS.includes(tradeToEdit.broker) ? "" : tradeToEdit.broker,
                account_id: tradeToEdit.account_id || defaultAccountId,
                pnl: tradeToEdit.pnl.toString(),
                entry_price: tradeToEdit.entry !== "-" ? tradeToEdit.entry : undefined,
                exit_price: tradeToEdit.exit !== "-" ? tradeToEdit.exit : undefined,
                sl: tradeToEdit.sl !== "-" ? tradeToEdit.sl : undefined,
                lot_size: tradeToEdit.lot_size !== "-" ? tradeToEdit.lot_size : undefined,
                rr: tradeToEdit.rr !== "-" ? tradeToEdit.rr : undefined,
                notes: tradeToEdit.notes !== "" ? tradeToEdit.notes : undefined,
                checklist_results: tradeToEdit.checklist_results || {},
            });
            setBeforeImage(tradeToEdit.image_before || null);
            setAfterImage(tradeToEdit.image_after || null);
        } else if (!open && !tradeToEdit) {
            reset({
                direction: "LONG",
                pair: pairs[0],
                custom_pair: "",
                session: sessions[0],
                date: new Date().toISOString().split("T")[0],
                setup: customSetups.length > 0 ? customSetups[0].name : setups[0],
                emotion: emotions[0],
                broker: "Manual",
                custom_broker: "",
                account_id: defaultAccountId,
                checklist_results: {},
            });
            setBeforeImage(null);
            setAfterImage(null);
        }
    }, [tradeToEdit, open, reset, customSetups]);

    const direction = watch("direction");
    const selectedSetup = watch("setup");
    const selectedBroker = watch("broker");
    const selectedPair = watch("pair");
    
    const activeChecklist = customSetups.find(s => s.name === selectedSetup)?.checklist || [];

    const uploadImageToSupabase = async (dataUrl: string, userId: string): Promise<string | null> => {
        // If it's already a Supabase URL (from editing an existing trade), return it
        if (dataUrl.startsWith("http")) return dataUrl;

        try {
            // Convert Base64 dataUrl back to a File Blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            // Generate a unique filename: userId/timestamp.ext
            const ext = blob.type.split("/")[1] || "jpeg";
            const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

            // Upload to Supabase Storage bucket
            const { data, error } = await supabase.storage
                .from("trade-images")
                .upload(fileName, blob, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("trade-images")
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (err) {
            console.error("Image upload failed:", err);
            return null;
        }
    };

    const onSubmit = async (data: LogTradeFormValues) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to log a trade.");

            const payload = {
                user_id: user.id,
                pair: data.pair === "Other" ? (data as any).custom_pair : data.pair,
                direction: data.direction.toLowerCase(),
                pnl: parseFloat(data.pnl),
                rr: data.rr || null,
                setup: data.setup,
                emotion: data.emotion,
                broker: data.broker === "Other (Not Listed)" ? (data as any).custom_broker : data.broker,
                account_id: (data as any).account_id || null,
                date: data.date,
                session: data.session,
                entry_price: data.entry_price ? parseFloat(data.entry_price) : null,
                exit_price: data.exit_price ? parseFloat(data.exit_price) : null,
                stop_loss: data.sl ? parseFloat(data.sl) : null,
                lot_size: data.lot_size ? parseFloat(data.lot_size) : null,
                notes: data.notes || null,
                checklist_results: data.checklist_results || {},
                image_before: null as string | null,
                image_after: null as string | null,
            };

            // Handle Image Uploads
            if (beforeImage) {
                payload.image_before = await uploadImageToSupabase(beforeImage, user.id);
            }
            if (afterImage) {
                payload.image_after = await uploadImageToSupabase(afterImage, user.id);
            }

            let err;
            if (tradeToEdit) {
                const { error } = await supabase.from("trades").update(payload).eq("id", tradeToEdit.id);
                err = error;
            } else {
                const { error } = await supabase.from("trades").insert(payload);
                err = error;
            }

            if (err) throw err;

            addToast(tradeToEdit ? "Trade updated successfully!" : "Trade logged successfully!", "success");
            reset();
            setBeforeImage(null);
            setAfterImage(null);
            onClose();
            router.refresh();

        } catch (error: any) {
            addToast(error.message || "Failed to log trade.", "error");
        }
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
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                {/* Direction */}
                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Direction</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setValue("direction", "LONG")}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${direction === "LONG"
                                                ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/30"
                                                : "bg-secondary text-muted-foreground border border-border/30"
                                                }`}
                                        >
                                            <TrendingUp className="w-4 h-4" /> Long
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setValue("direction", "SHORT")}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${direction === "SHORT"
                                                ? "bg-red-400/15 text-red-400 border border-red-400/30"
                                                : "bg-secondary text-muted-foreground border border-border/30"
                                                }`}
                                        >
                                            <TrendingDown className="w-4 h-4" /> Short
                                        </button>
                                    </div>
                                    {errors.direction && <p className="text-xs text-red-500 mt-1">{errors.direction.message}</p>}
                                </div>

                                {/* Pair + Session */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Pair</label>
                                        <select {...register("pair")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {pairs.map((p) => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        {selectedPair === "Other" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="pt-2"
                                            >
                                                <input 
                                                    {...register("custom_pair" as any)}
                                                    placeholder="Enter Pair (e.g. V10)"
                                                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                                                />
                                            </motion.div>
                                        )}
                                        {errors.pair && <p className="text-xs text-red-500 mt-1">{errors.pair.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Session</label>
                                        <select {...register("session")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {errors.session && <p className="text-xs text-red-500 mt-1">{errors.session.message}</p>}
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Date</label>
                                    <input
                                        type="date"
                                        {...register("date")}
                                        className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                                    />
                                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                                </div>

                                {/* Entry + Exit + SL */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Entry Price</label>
                                        <input type="number" step="any" placeholder="1.0850" {...register("entry_price")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors" />
                                        {errors.entry_price && <p className="text-xs text-red-500 mt-1">{errors.entry_price.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Exit Price</label>
                                        <input type="number" step="any" placeholder="1.0920" {...register("exit_price")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors" />
                                        {errors.exit_price && <p className="text-xs text-red-500 mt-1">{errors.exit_price.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Stop Loss</label>
                                        <input type="number" step="any" placeholder="1.0810" {...register("sl")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors" />
                                        {errors.sl && <p className="text-xs text-red-500 mt-1">{errors.sl.message}</p>}
                                    </div>
                                </div>

                                {/* Lot Size + R:R + P&L */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Lot Size</label>
                                        <input type="number" step="0.01" placeholder="0.50" {...register("lot_size")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors" />
                                        {errors.lot_size && <p className="text-xs text-red-500 mt-1">{errors.lot_size.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">R:R</label>
                                        <input type="text" placeholder="1:2.5" {...register("rr")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">P&L ($)</label>
                                        <input type="number" step="0.01" placeholder="245.50" {...register("pnl")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors" />
                                        {errors.pnl && <p className="text-xs text-red-500 mt-1">{errors.pnl.message}</p>}
                                    </div>
                                </div>

                                {/* Setup + Emotion */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Setup</label>
                                        <select {...register("setup")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {customSetups.length > 0 
                                                ? customSetups.map((s) => <option key={s.id} value={s.name}>{s.name}</option>) 
                                                : setups.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {errors.setup && <p className="text-xs text-red-500 mt-1">{errors.setup.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Emotion</label>
                                        <select {...register("emotion")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                            {emotions.map((e) => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                        {errors.emotion && <p className="text-xs text-red-500 mt-1">{errors.emotion.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Broker / Account</label>
                                    <select {...register("broker")} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none">
                                        {BROKERS.map((b) => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    {selectedBroker === "Other (Not Listed)" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="pt-2"
                                        >
                                            <input 
                                                {...register("custom_broker" as any)}
                                                placeholder="Enter Broker Name"
                                                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                                            />
                                        </motion.div>
                                    )}
                                    {errors.broker && <p className="text-xs text-red-500 mt-1">{errors.broker.message}</p>}
                                </div>

                                {/* Account Selection */}
                                <div>
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Target Account</label>
                                    <select 
                                        {...register("account_id" as any)} 
                                        className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none"
                                    >
                                        {accounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.broker})</option>
                                        ))}
                                    </select>
                                    {accounts.length === 0 && (
                                        <p className="text-[10px] text-amber-500 mt-1">No accounts found. Create one in Settings first.</p>
                                    )}
                                </div>

                                {/* Dynamic Setup Checklist */}
                                {activeChecklist.length > 0 && (
                                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/30 mb-2">
                                        <label className="text-[11px] text-accent uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Setup Checklist
                                        </label>
                                        <div className="space-y-3">
                                            {activeChecklist.map((item: string, idx: number) => (
                                                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center mt-0.5">
                                                        <input 
                                                            type="checkbox" 
                                                            {...register(`checklist_results.${item}` as any)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="w-4 h-4 rounded border border-border/50 peer-checked:bg-accent peer-checked:border-accent transition-all flex items-center justify-center bg-background group-hover:border-accent/50">
                                                            <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-tight peer-checked:text-foreground select-none">
                                                        {item}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                        {...register("notes")}
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
                                        disabled={isSubmitting}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-foreground hover:brightness-110 transition-all font-['Montserrat'] flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader /> : "Save Trade"}
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
