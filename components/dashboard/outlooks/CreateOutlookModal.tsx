"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Upload,
    Image as ImageIcon,
    Trash2,
    Loader2,
    CheckCircle2,
    Compass,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Layers,
    Target,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";

export interface OutlookItem {
    id: string;
    title: string;
    pair: string;
    direction: "LONG" | "SHORT" | "NEUTRAL";
    htf_narrative: string | null;
    itf_narrative: string | null;
    ltf_narrative: string | null;
    poi_narrative: string | null;
    htf_images: string[] | string | null;
    itf_images: string[] | string | null;
    ltf_images: string[] | string | null;
    poi_images: string[] | string | null;
    created_at: string;
    updated_at: string;
}

interface CreateOutlookModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    outlookToEdit?: OutlookItem | null;
}

const TIMEFRAME_STAGES = [
    { id: "htf", label: "1. HTF Narrative", sub: "Macro Bias & Key Liquidity", icon: Layers },
    { id: "itf", label: "2. ITF Structure", sub: "Market Structure Shift & CISD", icon: Compass },
    { id: "ltf", label: "3. LTF Execution", sub: "Displacement & Pullback Zone", icon: Sparkles },
    { id: "poi", label: "4. POI Trigger", sub: "Entry Zone, Order Block & Invalidation", icon: Target },
] as const;

type TimeframeId = typeof TIMEFRAME_STAGES[number]["id"];

export default function CreateOutlookModal({
    open,
    onClose,
    onSuccess,
    outlookToEdit,
}: CreateOutlookModalProps) {
    const { addToast } = useToast();
    const supabase = createClient();

    const [activeStage, setActiveStage] = useState<TimeframeId>("htf");
    const [title, setTitle] = useState("");
    const [pair, setPair] = useState("EUR/USD");
    const [direction, setDirection] = useState<"LONG" | "SHORT" | "NEUTRAL">("LONG");

    const [htfNarrative, setHtfNarrative] = useState("");
    const [itfNarrative, setItfNarrative] = useState("");
    const [ltfNarrative, setLtfNarrative] = useState("");
    const [poiNarrative, setPoiNarrative] = useState("");

    const [htfImages, setHtfImages] = useState<string[]>([]);
    const [itfImages, setItfImages] = useState<string[]>([]);
    const [ltfImages, setLtfImages] = useState<string[]>([]);
    const [poiImages, setPoiImages] = useState<string[]>([]);

    const [uploadingStage, setUploadingStage] = useState<TimeframeId | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Populate when editing
    useEffect(() => {
        if (outlookToEdit) {
            setTitle(outlookToEdit.title || "");
            setPair(outlookToEdit.pair || "EUR/USD");
            setDirection(outlookToEdit.direction || "LONG");
            setHtfNarrative(outlookToEdit.htf_narrative || "");
            setItfNarrative(outlookToEdit.itf_narrative || "");
            setLtfNarrative(outlookToEdit.ltf_narrative || "");
            setPoiNarrative(outlookToEdit.poi_narrative || "");
            setHtfImages(parseImages(outlookToEdit.htf_images));
            setItfImages(parseImages(outlookToEdit.itf_images));
            setLtfImages(parseImages(outlookToEdit.ltf_images));
            setPoiImages(parseImages(outlookToEdit.poi_images));
        } else {
            setTitle("");
            setPair("EUR/USD");
            setDirection("LONG");
            setHtfNarrative("");
            setItfNarrative("");
            setLtfNarrative("");
            setPoiNarrative("");
            setHtfImages([]);
            setItfImages([]);
            setLtfImages([]);
            setPoiImages([]);
        }
        setActiveStage("htf");
    }, [outlookToEdit, open]);

    if (!open) return null;

    const handleUploadFiles = async (files: FileList | null, stage: TimeframeId) => {
        if (!files || files.length === 0) return;
        setUploadingStage(stage);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please sign in to upload chart images");

            const uploadedUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = file.name.split(".").pop() || "png";
                const filePath = `${user.id}/outlooks/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("trade-images")
                    .upload(filePath, file, { cacheControl: "3600", upsert: false });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("trade-images")
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            if (stage === "htf") setHtfImages((prev) => [...prev, ...uploadedUrls]);
            if (stage === "itf") setItfImages((prev) => [...prev, ...uploadedUrls]);
            if (stage === "ltf") setLtfImages((prev) => [...prev, ...uploadedUrls]);
            if (stage === "poi") setPoiImages((prev) => [...prev, ...uploadedUrls]);

            addToast(`Uploaded ${uploadedUrls.length} chart screenshot(s)`, "success");
        } catch (err: any) {
            console.error("Upload failed:", err);
            addToast(err.message || "Failed to upload chart image", "error");
        } finally {
            setUploadingStage(null);
        }
    };

    const removeImage = (stage: TimeframeId, indexToRemove: number) => {
        if (stage === "htf") setHtfImages((prev) => prev.filter((_, i) => i !== indexToRemove));
        if (stage === "itf") setItfImages((prev) => prev.filter((_, i) => i !== indexToRemove));
        if (stage === "ltf") setLtfImages((prev) => prev.filter((_, i) => i !== indexToRemove));
        if (stage === "poi") setPoiImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            addToast("Please provide an Outlook Title", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please sign in");

            const payload = {
                user_id: user.id,
                title: title.trim(),
                pair: pair.trim().toUpperCase(),
                direction,
                htf_narrative: htfNarrative.trim() || null,
                itf_narrative: itfNarrative.trim() || null,
                ltf_narrative: ltfNarrative.trim() || null,
                poi_narrative: poiNarrative.trim() || null,
                htf_images: JSON.stringify(htfImages),
                itf_images: JSON.stringify(itfImages),
                ltf_images: JSON.stringify(ltfImages),
                poi_images: JSON.stringify(poiImages),
                updated_at: new Date().toISOString(),
            };

            if (outlookToEdit?.id) {
                const { error } = await supabase
                    .from("outlooks")
                    .update(payload)
                    .eq("id", outlookToEdit.id);
                if (error) throw error;
                addToast("Outlook updated successfully!", "success");
            } else {
                const { error } = await supabase
                    .from("outlooks")
                    .insert(payload);
                if (error) throw error;
                addToast("Outlook created successfully!", "success");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Save outlook error:", err);
            addToast(err.message || "Failed to save outlook", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentImages = 
        activeStage === "htf" ? htfImages :
        activeStage === "itf" ? itfImages :
        activeStage === "ltf" ? ltfImages : poiImages;

    const currentNarrative =
        activeStage === "htf" ? htfNarrative :
        activeStage === "itf" ? itfNarrative :
        activeStage === "ltf" ? ltfNarrative : poiNarrative;

    const setNarrative = (val: string) => {
        if (activeStage === "htf") setHtfNarrative(val);
        else if (activeStage === "itf") setItfNarrative(val);
        else if (activeStage === "ltf") setLtfNarrative(val);
        else if (activeStage === "poi") setPoiNarrative(val);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-3xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/40 bg-gradient-to-r from-accent/10 via-card to-card">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/20">
                            <Compass className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-foreground font-['Montserrat']">
                                {outlookToEdit ? "Edit Top-Down Outlook" : "New Top-Down Market Outlook"}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Multi-timeframe institutional framing: HTF ➔ ITF ➔ LTF ➔ POI
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    {/* General Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1 space-y-1.5">
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                                Outlook Title
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. May Week 3 Outlook"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent outline-none font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                                Asset Pair
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. USD/MXN or EUR/USD"
                                value={pair}
                                onChange={(e) => setPair(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-border/50 text-sm text-foreground font-mono font-bold focus:border-accent outline-none uppercase"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                                Bias Direction
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {(["LONG", "SHORT", "NEUTRAL"] as const).map((dir) => (
                                    <button
                                        type="button"
                                        key={dir}
                                        onClick={() => setDirection(dir)}
                                        className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                                            direction === dir
                                                ? dir === "LONG"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                                    : dir === "SHORT"
                                                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                                : "bg-white/[0.02] border border-border/30 text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {dir}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4-Stage Timeframe Nav Tabs */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Framing Stages
                            </span>
                            <span className="text-[11px] text-accent font-mono">
                                Stage {TIMEFRAME_STAGES.findIndex((s) => s.id === activeStage) + 1} of 4
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {TIMEFRAME_STAGES.map((stage) => {
                                const Icon = stage.icon;
                                const isActive = activeStage === stage.id;
                                const hasData = 
                                    (stage.id === "htf" && (htfNarrative || htfImages.length > 0)) ||
                                    (stage.id === "itf" && (itfNarrative || itfImages.length > 0)) ||
                                    (stage.id === "ltf" && (ltfNarrative || ltfImages.length > 0)) ||
                                    (stage.id === "poi" && (poiNarrative || poiImages.length > 0));

                                return (
                                    <button
                                        type="button"
                                        key={stage.id}
                                        onClick={() => setActiveStage(stage.id)}
                                        className={`p-3 rounded-xl border text-left transition-all relative ${
                                            isActive
                                                ? "bg-accent/15 border-accent/40 shadow-sm"
                                                : "bg-white/[0.02] border-border/30 hover:border-border/60"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                                            {hasData && (
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                            )}
                                        </div>
                                        <div className="text-xs font-bold text-foreground font-['Montserrat']">
                                            {stage.label}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate">
                                            {stage.sub}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Stage Narrative & Screenshot Box */}
                    <div className="p-5 rounded-2xl bg-white/[0.015] border border-border/40 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-foreground font-['Montserrat']">
                                    {TIMEFRAME_STAGES.find((s) => s.id === activeStage)?.label}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {TIMEFRAME_STAGES.find((s) => s.id === activeStage)?.sub}
                                </p>
                            </div>

                            {/* Image Upload Button */}
                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs font-bold text-accent hover:bg-accent/20 cursor-pointer transition-all">
                                {uploadingStage === activeStage ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Add Screenshot</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingStage !== null}
                                    onChange={(e) => handleUploadFiles(e.target.files, activeStage)}
                                />
                            </label>
                        </div>

                        {/* Screenshots Preview Strip */}
                        {currentImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {currentImages.map((imgUrl, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative rounded-xl overflow-hidden border border-border/40 bg-black/40 aspect-video"
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`Screenshot ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(activeStage, idx)}
                                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Narrative Textarea */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Analysis Narrative & Setup Logic:
                            </label>
                            <textarea
                                rows={5}
                                placeholder={`Enter your ${activeStage.toUpperCase()} analysis... (e.g. Draw on liquidity, Turtle Soup levels, CISD shift, optimal entry zones)`}
                                value={currentNarrative}
                                onChange={(e) => setNarrative(e.target.value)}
                                className="w-full p-3.5 rounded-xl bg-black/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent outline-none font-sans leading-relaxed resize-y"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="p-5 border-t border-border/40 bg-white/[0.01] flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-border/40 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-3">
                        {activeStage !== "poi" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const currIndex = TIMEFRAME_STAGES.findIndex((s) => s.id === activeStage);
                                    if (currIndex < TIMEFRAME_STAGES.length - 1) {
                                        setActiveStage(TIMEFRAME_STAGES[currIndex + 1].id);
                                    }
                                }}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-border/40 text-xs font-bold text-foreground hover:bg-white/10 transition-all"
                            >
                                <span>Next Stage</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-extrabold hover:opacity-90 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving Outlook...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{outlookToEdit ? "Save Changes" : "Create Outlook"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
