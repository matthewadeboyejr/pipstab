"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Compass,
    Plus,
    Search,
    Filter,
    Layers,
    Target,
    Sparkles,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Edit3,
    Trash2,
    Share2,
    Eye,
    X,
    Maximize2,
    ChevronRight,
    Check,
    CheckCircle2,
    Zap,
} from "lucide-react";
import CreateOutlookModal, { OutlookItem } from "./CreateOutlookModal";
import OutlookDossierModal from "./OutlookDossierModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface OutlooksClientProps {
    initialOutlooks: OutlookItem[];
}

const STAGES = [
    { id: "htf", label: "HTF Context", sub: "Macro Bias & Key Liquidity" },
    { id: "itf", label: "ITF Structure", sub: "Market Structure Shift & CISD" },
    { id: "ltf", label: "LTF Flow", sub: "Displacement & Pullback Range" },
    { id: "poi", label: "POI Execution", sub: "Entry Zone, Order Block & Invalidation" },
] as const;

export default function OutlooksClient({ initialOutlooks }: OutlooksClientProps) {
    const { addToast } = useToast();
    const router = useRouter();
    const supabase = createClient();

    const [outlooks, setOutlooks] = useState<OutlookItem[]>(initialOutlooks);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPair, setSelectedPair] = useState("ALL");
    const [selectedDirection, setSelectedDirection] = useState("ALL");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingOutlook, setEditingOutlook] = useState<OutlookItem | null>(null);
    const [deletingOutlookId, setDeletingOutlookId] = useState<string | null>(null);
    const [dossierOutlook, setDossierOutlook] = useState<OutlookItem | null>(null);
    const [autoAudit, setAutoAudit] = useState(false);

    // Active timeframe stage per card: Record<outlookId, "htf" | "itf" | "ltf" | "poi">
    const [activeStages, setActiveStages] = useState<Record<string, "htf" | "itf" | "ltf" | "poi">>({});

    // Lightbox state
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

    // Extract unique pairs for filter dropdown
    const uniquePairs = useMemo(() => {
        const set = new Set<string>();
        outlooks.forEach((o) => {
            if (o.pair) set.add(o.pair.toUpperCase());
        });
        return ["ALL", ...Array.from(set)];
    }, [outlooks]);

    // Filtered outlooks
    const filteredOutlooks = useMemo(() => {
        return outlooks.filter((o) => {
            const matchesSearch =
                o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (o.htf_narrative && o.htf_narrative.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (o.itf_narrative && o.itf_narrative.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (o.ltf_narrative && o.ltf_narrative.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (o.poi_narrative && o.poi_narrative.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesPair = selectedPair === "ALL" || o.pair.toUpperCase() === selectedPair;
            const matchesDirection = selectedDirection === "ALL" || o.direction === selectedDirection;

            return matchesSearch && matchesPair && matchesDirection;
        });
    }, [outlooks, searchQuery, selectedPair, selectedDirection]);

    const handleStageChange = (outlookId: string, stage: "htf" | "itf" | "ltf" | "poi") => {
        setActiveStages((prev) => ({ ...prev, [outlookId]: stage }));
    };

    const handleDeleteConfirm = async () => {
        if (!deletingOutlookId) return;

        try {
            const { error } = await supabase
                .from("outlooks")
                .delete()
                .eq("id", deletingOutlookId);

            if (error) throw error;

            setOutlooks((prev) => prev.filter((o) => o.id !== deletingOutlookId));
            addToast("Outlook deleted successfully", "success");
            setDeletingOutlookId(null);
            router.refresh();
        } catch (err: any) {
            console.error("Delete error:", err);
            addToast(err.message || "Failed to delete outlook", "error");
        }
    };

    const handleRefresh = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("outlooks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOutlooks(data);
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-accent/10 via-card to-card border border-accent/20 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/20">
                        <Compass className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-extrabold text-foreground font-['Montserrat']">
                                Top-Down Market Outlooks
                            </h1>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-mono font-bold">
                                {outlooks.length} Saved
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pre-market institutional framing: Higher Timeframe ➔ Intermediate ➔ Lower ➔ POI
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingOutlook(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-extrabold hover:opacity-90 transition-all shadow-md shadow-accent/20 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Outlook</span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border/50 flex-1">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        placeholder="Search outlooks by pair, title, or narrative keywords (e.g. Turtle Soup, CISD)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                    {/* Pair filter */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border/50 text-xs font-semibold text-muted-foreground">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Pair:</span>
                        <select
                            value={selectedPair}
                            onChange={(e) => setSelectedPair(e.target.value)}
                            className="bg-transparent text-foreground outline-none font-mono font-bold cursor-pointer"
                        >
                            {uniquePairs.map((p) => (
                                <option key={p} value={p} className="bg-card text-foreground">
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Direction filter */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border/50 text-xs font-semibold text-muted-foreground">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Bias:</span>
                        <select
                            value={selectedDirection}
                            onChange={(e) => setSelectedDirection(e.target.value)}
                            className="bg-transparent text-foreground outline-none font-bold cursor-pointer"
                        >
                            <option value="ALL" className="bg-card text-foreground">ALL</option>
                            <option value="LONG" className="bg-card text-emerald-400">LONG</option>
                            <option value="SHORT" className="bg-card text-red-400">SHORT</option>
                            <option value="NEUTRAL" className="bg-card text-amber-400">NEUTRAL</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Outlook Cards Stream */}
            {filteredOutlooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-card border border-dashed border-border/40 text-center space-y-3">
                    <Compass className="w-10 h-10 text-muted-foreground opacity-40" />
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            No Market Outlooks Found
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            {searchQuery || selectedPair !== "ALL" || selectedDirection !== "ALL"
                                ? "No outlooks match your current filter criteria."
                                : "Map out your first top-down market narrative to frame high-probability trade setups."}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingOutlook(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition-all shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Your First Outlook</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOutlooks.map((outlook, idx) => {
                        const currentStage = activeStages[outlook.id] || "htf";

                        const htfImgs = parseImages(outlook.htf_images);
                        const itfImgs = parseImages(outlook.itf_images);
                        const ltfImgs = parseImages(outlook.ltf_images);
                        const poiImgs = parseImages(outlook.poi_images);

                        const stageImages =
                            currentStage === "htf" ? htfImgs :
                            currentStage === "itf" ? itfImgs :
                            currentStage === "ltf" ? ltfImgs : poiImgs;

                        const stageNarrative =
                            currentStage === "htf" ? outlook.htf_narrative :
                            currentStage === "itf" ? outlook.itf_narrative :
                            currentStage === "ltf" ? outlook.ltf_narrative : outlook.poi_narrative;

                        const formattedDate = outlook.created_at
                            ? format(new Date(outlook.created_at), "MMM d, yyyy")
                            : "Recent";

                        return (
                            <motion.div
                                key={outlook.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="rounded-2xl bg-card border border-border/40 shadow-sm overflow-hidden"
                            >
                                {/* Card Top Bar */}
                                <div className="p-5 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-extrabold font-mono px-3 py-1 rounded-xl bg-white/5 border border-border/40 text-foreground">
                                            {outlook.pair}
                                        </span>

                                        <span
                                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                                outlook.direction === "LONG"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                    : outlook.direction === "SHORT"
                                                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                            }`}
                                        >
                                            {outlook.direction === "LONG" ? "▲ LONG" : outlook.direction === "SHORT" ? "▼ SHORT" : "◆ NEUTRAL"}
                                        </span>

                                        <h3 className="text-base font-bold text-foreground font-['Montserrat']">
                                            {outlook.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mr-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{formattedDate}</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setAutoAudit(true);
                                                setDossierOutlook(outlook);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all mr-1"
                                            title="AI Strategy Audit & Confluence Rating"
                                        >
                                            <Zap className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">AI Review</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setAutoAudit(false);
                                                setDossierOutlook(outlook);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs font-bold text-accent hover:bg-accent/20 transition-all mr-1"
                                            title="Export PDF / Share Dossier"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Export PDF</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setEditingOutlook(outlook);
                                                setIsCreateModalOpen(true);
                                            }}
                                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                                            title="Edit Outlook"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => setDeletingOutlookId(outlook.id)}
                                            className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete Outlook"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Timeframe Stage Tabs */}
                                <div className="px-5 pt-4 border-b border-border/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
                                    {STAGES.map((st) => {
                                        const isActive = currentStage === st.id;
                                        const count =
                                            st.id === "htf" ? htfImgs.length :
                                            st.id === "itf" ? itfImgs.length :
                                            st.id === "ltf" ? ltfImgs.length : poiImgs.length;

                                        return (
                                            <button
                                                key={st.id}
                                                onClick={() => handleStageChange(outlook.id, st.id)}
                                                className={`pb-3 px-3.5 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                                                    isActive
                                                        ? "text-accent border-b-2 border-accent"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                <span>{st.label}</span>
                                                {count > 0 && (
                                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-muted-foreground font-mono">
                                                        {count} img
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Stage Content Box */}
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left: Screenshots / Charts */}
                                    <div className="lg:col-span-6 space-y-3">
                                        {stageImages.length > 0 ? (
                                            <div className="space-y-3">
                                                <div
                                                    onClick={() => setLightboxImage(stageImages[0])}
                                                    className="group relative rounded-2xl overflow-hidden border border-border/40 bg-black/40 aspect-video cursor-pointer"
                                                >
                                                    <img
                                                        src={stageImages[0]}
                                                        alt={`${currentStage.toUpperCase()} Chart`}
                                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                                                        <Maximize2 className="w-4 h-4" />
                                                        <span>View Fullscreen</span>
                                                    </div>
                                                </div>

                                                {/* Thumbnails if multiple images */}
                                                {stageImages.length > 1 && (
                                                    <div className="flex items-center gap-2">
                                                        {stageImages.map((img, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={() => setLightboxImage(img)}
                                                                className="w-16 h-12 rounded-lg overflow-hidden border border-border/40 cursor-pointer hover:border-accent transition-colors"
                                                            >
                                                                <img src={img} alt="thumb" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-44 rounded-2xl bg-white/[0.015] border border-dashed border-border/40 flex flex-col items-center justify-center text-muted-foreground text-xs p-6 text-center space-y-1">
                                                <Compass className="w-6 h-6 opacity-30" />
                                                <span>No chart screenshot uploaded for this stage.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Narrative Breakdown */}
                                    <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-accent font-['Montserrat'] uppercase tracking-wider">
                                                    {STAGES.find((s) => s.id === currentStage)?.sub}
                                                </span>
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-border/30 text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
                                                {stageNarrative || (
                                                    <span className="text-muted-foreground italic text-xs">
                                                        No written narrative recorded for this timeframe stage.
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/10 font-mono">
                                            <span>Framing Stage: <strong>{currentStage.toUpperCase()}</strong></span>
                                            <span>Verified Top-Down Model</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Outlook Modal */}
            <CreateOutlookModal
                open={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingOutlook(null);
                }}
                onSuccess={handleRefresh}
                outlookToEdit={editingOutlook}
            />

            {/* Outlook Dossier / PDF Modal */}
            <OutlookDossierModal
                open={!!dossierOutlook}
                onClose={() => {
                    setDossierOutlook(null);
                    setAutoAudit(false);
                }}
                outlook={dossierOutlook}
                autoAudit={autoAudit}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingOutlookId}
                onClose={() => setDeletingOutlookId(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Market Outlook"
                description="Are you sure you want to permanently delete this Top-Down Outlook? This action cannot be undone."
                confirmText="Delete Outlook"
                cancelText="Cancel"
                isDestructive={true}
            />

            {/* Fullscreen Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            src={lightboxImage}
                            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain border border-border/30"
                            alt="Zoomed Chart"
                        />
                        <button
                            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            onClick={() => setLightboxImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
