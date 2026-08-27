"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
    BarChart3,
    Brain,
    Globe2,
    BookOpen,
    Compass,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    X,
    Sparkles,
    ShieldAlert,
    Zap,
    MousePointerClick,
    Layers,
    Clock,
    ChevronDown,
    ChevronUp,
    Minimize2,
    Maximize2,
    Play,
    Plus,
} from "lucide-react";

interface ActionHotspot {
    label: string;
    actionDescription: string;
    outcomeDescription: string;
    icon: any;
    iconColor: string;
    badge?: string;
    triggerEvent?: string;
}

interface PageTourStep {
    id: string;
    route: string;
    pageName: string;
    pageSubtitle: string;
    badge: string;
    badgeColor: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    overview: string;
    hotspots: ActionHotspot[];
}

const PAGE_TOUR_STEPS: PageTourStep[] = [
    {
        id: "performance",
        route: "/performance",
        pageName: "Performance & Mission Control",
        pageSubtitle: "Your quantitative edge and equity command center",
        badge: "Step 1 of 4: Performance Hub",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: BarChart3,
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
        overview:
            "This screen tracks your equity curve, win-rate expectancy, and analyzes which setups and market sessions generate your highest profits.",
        hotspots: [
            {
                label: "AI Edge Diagnostic Button",
                actionDescription: "When you click 'AI Edge Diagnostic' at the top right...",
                outcomeDescription:
                    "PipTab's AI scans your entire trade journal to calculate an Institutional Letter Grade (A+ to F), detects your biggest profit leaks, and generates personalized recommendations.",
                icon: Sparkles,
                iconColor: "text-accent",
                badge: "AI Powered",
            },
            {
                label: "Mission Control / Quant Lab Tabs",
                actionDescription: "When you click 'Quant & Edge Lab' or 'Violations'...",
                outcomeDescription:
                    "The screen switches to 8 institutional metrics including Sharpe Ratio, Mathematical Expectancy ($/trade), Max Win/Loss streaks, and exact dollars lost to broken rules.",
                icon: Layers,
                iconColor: "text-blue-400",
            },
            {
                label: "Trading Account Dropdown (TopBar)",
                actionDescription: "When you click the Account Selector in the top bar...",
                outcomeDescription:
                    "You can isolate metrics for a single broker account (e.g. Deriv, MT5) or view aggregated portfolio performance across all your trading accounts combined.",
                icon: MousePointerClick,
                iconColor: "text-purple-400",
            },
            {
                label: "Daily Trading Calendar",
                actionDescription: "When you hover or tap on any calendar day cell...",
                outcomeDescription:
                    "You see that day's exact net dollar P&L, number of trades taken, and profit/loss status color-coded in green or red.",
                icon: Clock,
                iconColor: "text-amber-400",
            },
        ],
    },
    {
        id: "journal",
        route: "/journal",
        pageName: "Institutional Execution Journal",
        pageSubtitle: "Zero-friction trade logging and discipline auditing",
        badge: "Step 2 of 4: Trade Journal",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: BookOpen,
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/10 border-amber-500/20",
        overview:
            "This is where you log trades, upload chart screenshots, and enforce your trading plan with customized rule checklists.",
        hotspots: [
            {
                label: "+ Log Trade Button",
                actionDescription: "When you click '+ Log Trade' (or the floating center + button on mobile)...",
                outcomeDescription:
                    "Opens the logger with auto-calculated R:R, lot size risk, emotion tagging, session tags, pre-trade checklists, and Before/After chart screenshot uploaders.",
                icon: Plus,
                iconColor: "text-accent",
                badge: "Quick Action",
                triggerEvent: "open-trade-modal",
            },
            {
                label: "Trade Cards & Expand Rows",
                actionDescription: "When you click or tap on any trade card in your log...",
                outcomeDescription:
                    "It expands to show your full trade notes, checklist execution status, before/after chart screenshots, and allows you to edit or generate a 1-click PnL Share Card.",
                icon: MousePointerClick,
                iconColor: "text-emerald-400",
            },
            {
                label: "AI Performance & Risk Auditor Tab",
                actionDescription: "When you click 'AI Auditor' at the top of the Journal...",
                outcomeDescription:
                    "PipTab runs an objective AI audit that flags revenge trading risks, lot-size sizing discipline leaks, and calculates your mathematical Risk of Ruin.",
                icon: Zap,
                iconColor: "text-purple-400",
                badge: "Auditor",
            },
        ],
    },
    {
        id: "macro",
        route: "/macro",
        pageName: "Global Macro & Market Intelligence",
        pageSubtitle: "Trade with institutional orderflow and catalyst awareness",
        badge: "Step 3 of 4: Macro Suite",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: Globe2,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/10 border-blue-500/20",
        overview:
            "Combines real-time currency strength rankings, live ForexFactory actuals releases, central bank interest rate divergence, and structured technical trade dossiers.",
        hotspots: [
            {
                label: "G8 Currency Relative Strength Meter",
                actionDescription: "When you view the G8 Strength Meter...",
                outcomeDescription:
                    "You see live 0–100 power rankings across USD, EUR, GBP, JPY, CAD, AUD, NZD, and CHF to instantly identify the strongest vs weakest currency pairs to trade.",
                icon: BarChart3,
                iconColor: "text-emerald-400",
            },
            {
                label: "Live Economic Calendar & Timezone Selector",
                actionDescription: "When you change the Timezone dropdown in the Economic Calendar...",
                outcomeDescription:
                    "All upcoming news events and live countdowns automatically adjust to your selected local timezone, with beat (🟢) vs miss (🔴) release actuals.",
                icon: Clock,
                iconColor: "text-accent",
                badge: "Live Feed",
            },
            {
                label: "24h Global Session & Overlap Radar",
                actionDescription: "When you view the Session Radar...",
                outcomeDescription:
                    "You see exactly which global market session is active (London, New York, Asia) and get alerted during the high-liquidity London/New York overlap window.",
                icon: Compass,
                iconColor: "text-purple-400",
            },
        ],
    },
    {
        id: "psychology",
        route: "/psychology",
        pageName: "Psychology & Cognitive Shield",
        pageSubtitle: "Protect mental capital and eliminate emotional revenge trading",
        badge: "Step 4 of 4: Mental Edge",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        icon: Brain,
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10 border-purple-500/20",
        overview:
            "Quantifies your mental game by linking emotional states to real dollar profitability and providing emergency circuit breakers when experiencing tilt.",
        hotspots: [
            {
                label: "Daily Pre-Session Readiness Form",
                actionDescription: "When you submit your sleep hours, mood, and stress levels...",
                outcomeDescription:
                    "PipTab calculates a 0–100% Cognitive Readiness Score. If your score is low, it advises caution or halts live trading to protect your account from emotional errors.",
                icon: Brain,
                iconColor: "text-accent",
                badge: "Daily Ritual",
            },
            {
                label: "Emergency Tilt Reset (Circuit Breaker)",
                actionDescription: "When you click 'Emergency Tilt Reset'...",
                outcomeDescription:
                    "Launches an interactive 3-minute Box-Breathing pacing ring and requires 3 pre-execution sanity checks to lower your heart rate before placing another trade.",
                icon: ShieldAlert,
                iconColor: "text-red-400",
                badge: "Emergency",
            },
            {
                label: "Empirical Emotion-to-PnL Matrix",
                actionDescription: "When you review the Emotion-to-PnL cards...",
                outcomeDescription:
                    "It shows your exact win rate and net dollar return for every emotion (e.g. 'Calm' = +$1,240 vs 'Frustrated' = -$680), helping you identify profitable mental states.",
                icon: Sparkles,
                iconColor: "text-emerald-400",
            },
        ],
    },
];

export default function ProductTourModal() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeHotspotIndex, setActiveHotspotIndex] = useState<number | null>(0);

    // Initial launch logic
    useEffect(() => {
        const seen = localStorage.getItem("piptab_tour_v3_completed");
        if (!seen) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    // Custom event trigger from TopBar / Tour button
    useEffect(() => {
        const handleOpenTour = () => {
            setCurrentIndex(0);
            setActiveHotspotIndex(0);
            setIsMinimized(false);
            setIsOpen(true);
            router.push(PAGE_TOUR_STEPS[0].route);
        };
        window.addEventListener("open-product-tour", handleOpenTour);
        return () => window.removeEventListener("open-product-tour", handleOpenTour);
    }, [router]);

    const currentStep = PAGE_TOUR_STEPS[currentIndex];
    const StepIcon = currentStep.icon;

    const navigateToStep = (index: number) => {
        setCurrentIndex(index);
        setActiveHotspotIndex(0);
        const targetStep = PAGE_TOUR_STEPS[index];
        if (pathname !== targetStep.route) {
            router.push(targetStep.route);
        }
    };

    const nextStep = () => {
        if (currentIndex < PAGE_TOUR_STEPS.length - 1) {
            navigateToStep(currentIndex + 1);
        } else {
            closeTour();
        }
    };

    const prevStep = () => {
        if (currentIndex > 0) {
            navigateToStep(currentIndex - 1);
        }
    };

    const closeTour = () => {
        setIsOpen(false);
        localStorage.setItem("piptab_tour_v3_completed", "true");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 pointer-events-none flex justify-center">
                <motion.div
                    initial={{ y: 80, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="w-full max-w-4xl rounded-3xl bg-[#0B0F17]/95 backdrop-blur-2xl border border-accent/30 shadow-[0_10px_50px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden flex flex-col"
                >
                    {/* Top Progress & Controls Bar */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${currentStep.badgeColor}`}>
                                    {currentStep.badge}
                                </span>
                                <span className="text-xs font-bold text-foreground font-['Montserrat'] hidden sm:inline">
                                    {currentStep.pageName}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Step Indicators */}
                            <div className="flex items-center gap-1 mr-3">
                                {PAGE_TOUR_STEPS.map((s, idx) => (
                                    <button
                                        key={s.id}
                                        onClick={() => navigateToStep(idx)}
                                        className={`h-2 rounded-full transition-all ${
                                            idx === currentIndex
                                                ? "w-6 bg-accent"
                                                : "w-2 bg-white/20 hover:bg-white/40"
                                        }`}
                                        title={`Go to ${s.pageName}`}
                                    />
                                ))}
                            </div>

                            {/* Minimize / Maximize */}
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                                title={isMinimized ? "Expand Tour Guide" : "Minimize Tour Guide"}
                            >
                                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                            </button>

                            {/* Close */}
                            <button
                                onClick={closeTour}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                                title="Exit Tour"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Main Tour Content (Collapsible if minimized) */}
                    <AnimatePresence initial={false}>
                        {!isMinimized && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="p-5 sm:p-6 space-y-5 overflow-hidden"
                            >
                                {/* Page Header & Route Sync */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-11 h-11 rounded-2xl ${currentStep.iconBg} flex items-center justify-center shrink-0 border mt-0.5`}>
                                            <StepIcon className={`w-5 h-5 ${currentStep.iconColor}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-extrabold text-foreground font-['Montserrat']">
                                                {currentStep.pageName}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {currentStep.overview}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Current Route Indicator */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/30 text-xs font-mono text-muted-foreground self-start sm:self-center shrink-0">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Active Page: <strong>{currentStep.route}</strong></span>
                                    </div>
                                </div>

                                {/* "What Happens When You Click" Hotspot List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                        <span className="flex items-center gap-1.5 text-accent">
                                            <MousePointerClick className="w-3.5 h-3.5" /> What Happens When You Click:
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">Select a button below to preview action</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                        {currentStep.hotspots.map((hotspot, hIdx) => {
                                            const HotspotIcon = hotspot.icon;
                                            const isSelected = activeHotspotIndex === hIdx;

                                            return (
                                                <button
                                                    key={hotspot.label}
                                                    onClick={() => setActiveHotspotIndex(hIdx)}
                                                    className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between space-y-2 group ${
                                                        isSelected
                                                            ? "bg-accent/10 border-accent/50 shadow-md shadow-accent/10"
                                                            : "bg-white/[0.02] border-border/40 hover:bg-white/[0.04] hover:border-border/70"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2 w-full">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                                <HotspotIcon className={`w-3.5 h-3.5 ${hotspot.iconColor}`} />
                                                            </div>
                                                            <span className="text-xs font-bold text-foreground truncate font-['Montserrat']">
                                                                {hotspot.label}
                                                            </span>
                                                        </div>
                                                        {hotspot.badge && (
                                                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent font-mono font-bold shrink-0">
                                                                {hotspot.badge}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                                                        {hotspot.outcomeDescription}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Active Hotspot Detailed Explanation Box */}
                                {activeHotspotIndex !== null && currentStep.hotspots[activeHotspotIndex] && (
                                    <motion.div
                                        key={`${currentStep.id}-${activeHotspotIndex}`}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3.5 rounded-2xl bg-gradient-to-r from-accent/10 via-card to-card border border-accent/30 space-y-1.5"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-accent font-mono">
                                                {currentStep.hotspots[activeHotspotIndex].actionDescription}
                                            </span>
                                        </div>
                                        <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                                            {currentStep.hotspots[activeHotspotIndex].outcomeDescription}
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Navigation Actions */}
                    <div className="px-5 py-3 border-t border-border/40 bg-white/[0.01] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            {currentIndex > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all flex items-center gap-1.5 font-['Montserrat']"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Previous Page
                                </button>
                            )}
                            <button
                                onClick={closeTour}
                                className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground font-['Montserrat'] transition-colors"
                            >
                                Finish & Dismiss
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={nextStep}
                                className="px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-extrabold hover:brightness-110 shadow-lg shadow-accent/20 transition-all flex items-center gap-2 font-['Montserrat']"
                            >
                                {currentIndex === PAGE_TOUR_STEPS.length - 1 ? (
                                    <>
                                        <Sparkles className="w-4 h-4" /> Start Trading On PipTab
                                    </>
                                ) : (
                                    <>
                                        <span>Next Page: <strong>{PAGE_TOUR_STEPS[currentIndex + 1].pageName.split("&")[0]}</strong></span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
