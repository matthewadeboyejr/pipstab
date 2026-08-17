"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    Shield,
    Zap,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface TourStep {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    description: string;
    highlights: string[];
    actionUrl: string;
    actionLabel: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: "performance",
        title: "Performance & Quant Lab",
        subtitle: "Your mathematical trading command center",
        badge: "Mission Control",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: BarChart3,
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
        description:
            "Track capital growth, analyze session alpha distributions across London/NY/Asian sessions, and uncover statistical expectancy per setup.",
        highlights: [
            "Interactive Cumulative Equity & Underwater Drawdown curves",
            "8-Card Institutional Metric Grid with Sharpe & Profit Factor",
            "1-Click AI Institutional Edge Diagnostic with Letter Grades",
            "90-Day Calendar with exact dollar Alpha Leakage tracking",
        ],
        actionUrl: "/performance",
        actionLabel: "Explore Performance Hub",
    },
    {
        id: "psychology",
        title: "Psychology & Tilt Shield",
        subtitle: "Protect mental capital and eliminate revenge trading",
        badge: "Cognitive Risk",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        icon: Brain,
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10 border-purple-500/20",
        description:
            "Calculate your daily pre-session readiness score, uncover emotional traps, and engage emergency circuit breakers during high-tilt moments.",
        highlights: [
            "Daily 4-Factor Cognitive Readiness Score (Sleep, Mood, Bias, Stress)",
            "Empirical Emotion-to-PnL Matrix linking mood tags to real dollar returns",
            "Emergency 3-Minute Box-Breathing Circuit Breaker with sanity filters",
            "Trader's Core Mental Axioms and AI Mental Game Coaching",
        ],
        actionUrl: "/psychology",
        actionLabel: "Open Psychology Hub",
    },
    {
        id: "macro-outlooks",
        title: "Macro Intel & Top-Down Outlooks",
        subtitle: "Trade with institutional volume and orderflow conviction",
        badge: "Market Edge",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: Globe2,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/10 border-blue-500/20",
        description:
            "Combine central bank divergence, multi-timeframe orderflow momentum, and structured technical dossiers before entering live risk.",
        highlights: [
            "5-Axis Institutional Pressure Radar (Growth, Yields, Flow, Inflation, Volatility)",
            "Multi-Timeframe Intraday Flow Matrix (4H / 1H / 15M Alignment)",
            "Central Bank Policy Rate matrices & Economic Release Deviation playbooks",
            "Structured Trade Dossiers with Killzone plans & Invalidation triggers",
        ],
        actionUrl: "/macro",
        actionLabel: "View Macro Radar",
    },
    {
        id: "journal-setups",
        title: "Execution Journal & Playbooks",
        subtitle: "Quantify your edge and enforce checklist discipline",
        badge: "Execution Audit",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: BookOpen,
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/10 border-amber-500/20",
        description:
            "Log executions with automated R:R calculation, upload chart screenshots, and enforce pre-trade checklists to measure dollar leakage.",
        highlights: [
            "Zero-friction Trade Logging with automated R:R & net balance updates",
            "Multi-Account filter with Deriv, MT4/MT5, and manual accounts",
            "Checklist Rule Auditing: Quantify exact dollars lost to rule breaks",
            "Setup Playbook repository with custom win-rate tracking",
        ],
        actionUrl: "/journal",
        actionLabel: "Start Trading Journal",
    },
];

export default function ProductTourModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Check if user has seen the tour before
        const seen = localStorage.getItem("piptab_tour_v2_completed");
        if (!seen) {
            // Short delay so page mounts smoothly before popping up
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    // Listen for custom trigger to open tour from TopBar / Settings
    useEffect(() => {
        const handleOpenTour = () => {
            setCurrentIndex(0);
            setIsOpen(true);
        };
        window.addEventListener("open-product-tour", handleOpenTour);
        return () => window.removeEventListener("open-product-tour", handleOpenTour);
    }, []);

    const closeTour = () => {
        setIsOpen(false);
        localStorage.setItem("piptab_tour_v2_completed", "true");
    };

    const nextStep = () => {
        if (currentIndex < TOUR_STEPS.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            closeTour();
        }
    };

    const prevStep = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const currentStep = TOUR_STEPS[currentIndex];
    const StepIcon = currentStep.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl rounded-3xl bg-card border border-border/60 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                        {/* Top Controls */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${currentStep.badgeColor}`}>
                                    {currentStep.badge}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                    Step {currentIndex + 1} of {TOUR_STEPS.length}
                                </span>
                            </div>

                            <button
                                onClick={closeTour}
                                className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                                title="Close Tour"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Slide Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                {/* Header */}
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${currentStep.iconBg} flex items-center justify-center shrink-0 border`}>
                                        <StepIcon className={`w-6 h-6 ${currentStep.iconColor}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground font-['Montserrat'] leading-tight">
                                            {currentStep.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {currentStep.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-foreground/90 leading-relaxed">
                                    {currentStep.description}
                                </p>

                                {/* Feature Highlights List */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {currentStep.highlights.map((h, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-xl bg-white/[0.015] border border-border/30 flex items-start gap-2.5"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                            <span className="text-xs text-foreground/80 leading-snug">{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Bottom Navigation & Progress Indicator */}
                        <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Step Dots */}
                            <div className="flex items-center gap-1.5">
                                {TOUR_STEPS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all ${
                                            idx === currentIndex
                                                ? "w-6 bg-accent"
                                                : "w-2 bg-white/20 hover:bg-white/40"
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2">
                                {currentIndex > 0 && (
                                    <button
                                        onClick={prevStep}
                                        className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all flex items-center gap-1 font-['Montserrat']"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                                    </button>
                                )}

                                <button
                                    onClick={closeTour}
                                    className="px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground font-['Montserrat'] transition-colors"
                                >
                                    Skip Tour
                                </button>

                                <button
                                    onClick={nextStep}
                                    className="px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 shadow-lg shadow-accent/20 transition-all flex items-center gap-1.5 font-['Montserrat']"
                                >
                                    {currentIndex === TOUR_STEPS.length - 1 ? (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5" /> Launch Terminal
                                        </>
                                    ) : (
                                        <>
                                            Next Step <ArrowRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
