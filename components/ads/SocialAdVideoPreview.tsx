"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    Flame,
    TrendingUp,
    AlertTriangle,
    ShieldCheck,
    Brain,
    Zap,
    Copy,
    Check,
    Share2,
    Heart,
    MessageCircle,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface Scene {
    id: number;
    title: string;
    duration: number; // in seconds
    caption: string;
    voiceover: string;
    accentColor: string;
}

const AD_SCENES: Scene[] = [
    {
        id: 1,
        title: "The Fatal Flaw",
        duration: 4,
        caption: "95% of funded traders don't fail because of technicals. They fail from Cognitive Leakage.",
        voiceover: "95% of funded traders don't fail because of technicals. They blow up from emotional revenge trading and alpha leakage.",
        accentColor: "#EF4444",
    },
    {
        id: 2,
        title: "The Pre-Session Ritual",
        duration: 4.5,
        caption: "Lock in your psychology before risking a single dollar with Audio Axioms & Execution Pledges.",
        voiceover: "Lock in your discipline before risking a single dollar with PipTab's audio psychology ritual.",
        accentColor: "#10B981",
    },
    {
        id: 3,
        title: "Institutional Execution",
        duration: 4.5,
        caption: "Precision Lot Sizing + Live Deviation Playbooks for CPI & NFP news releases.",
        voiceover: "Calculate institutional position sizing in seconds, and execute news releases with algorithmic deviation playbooks.",
        accentColor: "#E2FE52",
    },
    {
        id: 4,
        title: "AI Alpha Leak Detection",
        duration: 4,
        caption: "PipTab AI audits your trading habits to find exactly where you leak profit.",
        voiceover: "PipTab AI analyzes your journal to diagnose emotional tilt and stop account blowout before it happens.",
        accentColor: "#8B5CF6",
    },
    {
        id: 5,
        title: "Claim Early Access",
        duration: 3,
        caption: "Join the Inner Circle. Beta Access Now Open @pipstab on Telegram.",
        voiceover: "Stop gambling, start journaling. Request beta access now and join our Telegram community at pipstab.",
        accentColor: "#E2FE52",
    },
];

const TOTAL_DURATION = AD_SCENES.reduce((acc, s) => acc + s.duration, 0);

export default function SocialAdVideoPreview() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [copiedScript, setCopiedScript] = useState(false);
    const [likesCount, setLikesCount] = useState(2480);
    const [isLiked, setIsLiked] = useState(false);
    const { addToast } = useToast();

    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const currentSceneIndexRef = useRef<number>(-1);

    // Calculate current active scene
    const currentSceneIndex = Math.min(
        AD_SCENES.length - 1,
        AD_SCENES.findIndex((_, idx) => {
            const elapsedBefore = AD_SCENES.slice(0, idx + 1).reduce((sum, s) => sum + s.duration, 0);
            return currentTime <= elapsedBefore;
        })
    );
    const activeScene = AD_SCENES[Math.max(0, currentSceneIndex)];

    // Voice synthesis per scene
    useEffect(() => {
        if (!isPlaying || isMuted) {
            window.speechSynthesis?.cancel();
            return;
        }

        if (currentSceneIndex !== currentSceneIndexRef.current && currentSceneIndex >= 0) {
            currentSceneIndexRef.current = currentSceneIndex;
            window.speechSynthesis?.cancel();

            const text = AD_SCENES[currentSceneIndex]?.voiceover;
            if (text && "speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.08;
                utterance.pitch = 1.0;
                
                const voices = window.speechSynthesis.getVoices();
                const englishVoice = voices.find(
                    (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
                ) || voices.find((v) => v.lang.startsWith("en"));
                
                if (englishVoice) utterance.voice = englishVoice;
                synthRef.current = utterance;
                window.speechSynthesis.speak(utterance);
            }
        }
    }, [currentSceneIndex, isPlaying, isMuted]);

    // Animation ticker
    useEffect(() => {
        if (!isPlaying) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp - currentTime * 1000;
            const elapsed = (timestamp - startTimeRef.current) / 1000;

            if (elapsed >= TOTAL_DURATION) {
                setCurrentTime(TOTAL_DURATION);
                setIsPlaying(false);
                startTimeRef.current = null;
                currentSceneIndexRef.current = -1;
                window.speechSynthesis?.cancel();
            } else {
                setCurrentTime(elapsed);
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    const handlePlayPause = () => {
        if (currentTime >= TOTAL_DURATION) {
            setCurrentTime(0);
            startTimeRef.current = null;
            currentSceneIndexRef.current = -1;
        }
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        startTimeRef.current = null;
        currentSceneIndexRef.current = -1;
        window.speechSynthesis?.cancel();
    };

    const handleCopyFullScript = () => {
        const fullScript = AD_SCENES.map(
            (s, idx) => `[SCENE ${idx + 1} (${s.duration}s) - ${s.title.toUpperCase()}]\nVISUAL: ${s.caption}\nVOICEOVER: "${s.voiceover}"\n`
        ).join("\n");

        navigator.clipboard.writeText(fullScript);
        setCopiedScript(true);
        addToast("Copied 30s TikTok/Reels Script to clipboard!", "success");
        setTimeout(() => setCopiedScript(false), 2500);
    };

    const handleLike = () => {
        if (!isLiked) {
            setLikesCount((prev) => prev + 1);
            setIsLiked(true);
        } else {
            setLikesCount((prev) => prev - 1);
            setIsLiked(false);
        }
    };

    const progressPercentage = (currentTime / TOTAL_DURATION) * 100;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-10">
            {/* Header Description */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TikTok • IG Reels • YouTube Shorts Ready</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-['Montserrat'] tracking-tight">
                    Short-Form Video Ad & Intro Studio
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Preview the high-converting 9:16 motion ad sequence with synchronized audio captions and voiceover.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: 9:16 Vertical Video Mockup */}
                <div className="lg:col-span-5 flex justify-center">
                    <div className="relative w-[310px] sm:w-[340px] h-[600px] sm:h-[640px] bg-black rounded-[42px] p-3 border-[6px] border-[#1C1F2E] shadow-2xl shadow-accent/10 overflow-hidden flex flex-col justify-between select-none">
                        
                        {/* Dynamic Background Motion Elements */}
                        <div className="absolute inset-0 bg-radial from-neutral-900 via-black to-black opacity-90 -z-10" />
                        <div
                            className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none -z-10"
                            style={{ backgroundColor: activeScene.accentColor }}
                        />

                        {/* Top Story Bar Segments */}
                        <div className="pt-2 px-2 flex items-center gap-1.5 z-20">
                            {AD_SCENES.map((scene, idx) => {
                                const sceneStart = AD_SCENES.slice(0, idx).reduce((acc, s) => acc + s.duration, 0);
                                const sceneEnd = sceneStart + scene.duration;
                                let pct = 0;
                                if (currentTime >= sceneEnd) pct = 100;
                                else if (currentTime > sceneStart) {
                                    pct = ((currentTime - sceneStart) / scene.duration) * 100;
                                }

                                return (
                                    <div key={scene.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent transition-all duration-100 ease-linear"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Top Bar Header */}
                        <div className="px-3 pt-3 flex items-center justify-between z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-[10px] text-black font-['Montserrat']">
                                    PT
                                </div>
                                <span className="text-xs font-bold text-white font-['Montserrat'] tracking-wide">
                                    pipstab.com
                                </span>
                            </div>

                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 hover:text-white"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-accent" />}
                            </button>
                        </div>

                        {/* Middle: Cinematic Video Scene Content */}
                        <div className="flex-1 flex flex-col justify-center items-center px-4 text-center z-20 my-auto">
                            <AnimatePresence mode="wait">
                                {currentSceneIndex === 0 && (
                                    <motion.div
                                        key="scene-1"
                                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 1.05, opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-4"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 animate-pulse">
                                            <AlertTriangle className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase font-mono tracking-widest text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                                            The Prop Firm Trap
                                        </span>
                                        <h3 className="text-2xl font-black text-white font-['Montserrat'] leading-tight">
                                            Why 95% of Funded Traders Blow Up in Week 2.
                                        </h3>
                                        <p className="text-xs text-white/70 font-mono">
                                            Cognitive Fatigue • Revenge Entries • Alpha Leakage
                                        </p>
                                    </motion.div>
                                )}

                                {currentSceneIndex === 1 && (
                                    <motion.div
                                        key="scene-2"
                                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 1.05, opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-4"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                            <Brain className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                            Pre-Session Ritual
                                        </span>
                                        <h3 className="text-2xl font-black text-white font-['Montserrat'] leading-tight">
                                            Lock In Your Mindset Before Placing A Single Trade.
                                        </h3>
                                        <div className="flex items-center justify-center gap-1">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {currentSceneIndex === 2 && (
                                    <motion.div
                                        key="scene-3"
                                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 1.05, opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-4"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto text-accent shadow-[0_0_30px_rgba(var(--accent),0.3)]">
                                            <Zap className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase font-mono tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                                            Instant Execution Tools
                                        </span>
                                        <h3 className="text-2xl font-black text-white font-['Montserrat'] leading-tight">
                                            Institutional Lot Sizer & Macro Deviation Engine.
                                        </h3>
                                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left font-mono text-[11px] space-y-1">
                                            <div className="flex justify-between text-accent font-bold">
                                                <span>EUR/USD • 20 Pips SL</span>
                                                <span>4.25 Lots</span>
                                            </div>
                                            <div className="text-white/40 text-[10px]">Max Risk: $850.00 (1.0%)</div>
                                        </div>
                                    </motion.div>
                                )}

                                {currentSceneIndex === 3 && (
                                    <motion.div
                                        key="scene-4"
                                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 1.05, opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-4"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                            <TrendingUp className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase font-mono tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                                            AI Edge Auditor
                                        </span>
                                        <h3 className="text-2xl font-black text-white font-['Montserrat'] leading-tight">
                                            Detect Your Revenge Habits Before Your Broker Does.
                                        </h3>
                                        <div className="text-xs text-white/70 font-mono bg-purple-500/10 border border-purple-500/20 p-2 rounded-xl">
                                            ⚠️ +62% Win Rate on London Open <br />
                                            ❌ -88% PnL on NY Post-14:00 Entries
                                        </div>
                                    </motion.div>
                                )}

                                {currentSceneIndex === 4 && (
                                    <motion.div
                                        key="scene-5"
                                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 1.05, opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-4"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto text-accent-foreground shadow-[0_0_40px_rgba(var(--accent),0.5)]">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase font-mono tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                                            Early Access Beta
                                        </span>
                                        <h3 className="text-3xl font-black text-white font-['Montserrat'] leading-tight">
                                            JOIN THE INNER CIRCLE.
                                        </h3>
                                        <a
                                            href="https://t.me/pipstab"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#229ED9] text-white rounded-xl font-bold text-xs font-['Montserrat'] shadow-lg"
                                        >
                                            <span>Telegram: @pipstab</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Floating Social Interaction Icons (TikTok / Reels Style) */}
                        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-30">
                            <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                                <div className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                                    <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                                </div>
                                <span className="text-[10px] font-mono text-white/80 font-bold">{likesCount.toLocaleString()}</span>
                            </button>

                            <div className="flex flex-col items-center gap-1">
                                <div className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-mono text-white/80 font-bold">142</span>
                            </div>

                            <button onClick={handleCopyFullScript} className="flex flex-col items-center gap-1">
                                <div className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                    <Share2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-mono text-white/80 font-bold">Share</span>
                            </button>
                        </div>

                        {/* Bottom Captions Overlay */}
                        <div className="px-3 pb-3 z-20 space-y-2">
                            <div className="p-2.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 text-left">
                                <p className="text-xs font-bold text-accent font-['Montserrat'] flex items-center gap-1 mb-0.5">
                                    <Flame className="w-3.5 h-3.5 text-accent" />
                                    <span>@pipstab_official</span>
                                </p>
                                <p className="text-[11px] text-white/90 font-medium leading-snug">
                                    {activeScene.caption}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Video Controls & CapCut/TikTok Copy Kit */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Media Control Deck */}
                    <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-border/30">
                            <h3 className="text-base font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                <Play className="w-4 h-4 text-accent" />
                                Timeline Playback Controls
                            </h3>
                            <span className="text-xs font-mono font-bold text-accent">
                                {currentTime.toFixed(1)}s / {TOTAL_DURATION}s
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden relative cursor-pointer">
                                <div
                                    className="h-full bg-accent transition-all duration-70 ease-linear rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePlayPause}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-accent text-accent-foreground font-bold text-sm rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all font-['Montserrat'] shadow-lg shadow-accent/20"
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span>{isPlaying ? "Pause Preview" : "Play Ad Sequence (Audio On)"}</span>
                            </button>

                            <button
                                onClick={handleReset}
                                className="p-3.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                                title="Restart from beginning"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-3.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                                title="Toggle Speech Synthesis"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-accent" />}
                            </button>
                        </div>
                    </div>

                    {/* Copy CapCut / Voiceover Production Script */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-card to-accent/[0.04] border border-accent/25 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-foreground font-['Montserrat'] uppercase tracking-wider">
                                    Ad Production Script & Visual Directives
                                </h4>
                                <p className="text-xs text-muted-foreground font-mono">
                                    Ready for CapCut, ElevenLabs, TikTok Ads Manager, or Meta Ads
                                </p>
                            </div>

                            <button
                                onClick={handleCopyFullScript}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold font-mono hover:brightness-110 transition-all shadow-md shrink-0"
                            >
                                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedScript ? "Copied Script!" : "Copy Full Script"}</span>
                            </button>
                        </div>

                        {/* Scene by Scene Breakdown */}
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {AD_SCENES.map((scene, idx) => (
                                <div
                                    key={scene.id}
                                    className={`p-3.5 rounded-2xl border transition-all text-xs font-mono space-y-1.5 ${
                                        currentSceneIndex === idx
                                            ? "bg-accent/10 border-accent/40 shadow-sm"
                                            : "bg-white/[0.02] border-border/30 opacity-70"
                                    }`}
                                >
                                    <div className="flex items-center justify-between font-bold">
                                        <span className="text-foreground">
                                            Scene {idx + 1}: {scene.title} ({scene.duration}s)
                                        </span>
                                        <span className="text-accent text-[10px]">
                                            {currentSceneIndex === idx ? "● Active Now" : ""}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        <strong className="text-white">Voiceover:</strong> &ldquo;{scene.voiceover}&rdquo;
                                    </p>
                                    <p className="text-[10px] text-accent/80">
                                        <strong>Visual:</strong> {scene.caption}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
