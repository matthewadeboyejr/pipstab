"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
    Globe,
    RefreshCcw,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
    Search,
    Sparkles,
    Shield,
    Flame,
    Copy,
    Check,
    Layers,
    Tag,
    SlidersHorizontal,
    AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/context/ToastContext";
import { EnrichedNewsItem, NewsPulseResponse } from "@/app/api/fundamentals/news/route";

const CATEGORIES = [
    { id: "All", label: "All Intelligence" },
    { id: "Central Banks", label: "🏛️ Central Banks & Rates" },
    { id: "Forex", label: "💱 Forex & Currencies" },
    { id: "Commodities", label: "⛏️ Commodities & Gold" },
    { id: "Indices", label: "📈 Equities & Indices" },
    { id: "Crypto", label: "⚡ Crypto & Tech" },
];

export default function NewsPulse() {
    const [newsData, setNewsData] = useState<NewsPulseResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedBrief, setCopiedBrief] = useState(false);
    const { addToast } = useToast();

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/fundamentals/news");
            const data = await response.json();
            if (data && Array.isArray(data.items)) {
                setNewsData(data);
            }
        } catch (error) {
            console.error("Failed to fetch news:", error);
            addToast("Failed to fetch live market news", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 300000); // 5 min auto-sync
        return () => clearInterval(interval);
    }, []);

    const filteredItems = useMemo(() => {
        if (!newsData?.items) return [];
        return newsData.items.filter((item) => {
            const matchesCategory =
                selectedCategory === "All" || item.category === selectedCategory;
            const matchesSearch =
                searchQuery.trim() === "" ||
                item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.relatedAsset &&
                    item.relatedAsset.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.source.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [newsData, selectedCategory, searchQuery]);

    const copyExecutiveBrief = () => {
        if (!newsData?.executive_brief) return;
        const brief = newsData.executive_brief;
        const text = `📰 [PIPTAB INSTITUTIONAL MARKET BRIEF]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Market Tone: ${brief.risk_tone} | Strategic Bias: ${brief.market_bias}
Sentiment: ${newsData.sentiment_stats.bullish_pct}% Bullish | ${newsData.sentiment_stats.bearish_pct}% Bearish | ${newsData.sentiment_stats.neutral_pct}% Neutral

🎯 EXECUTIVE SUMMARY:
${brief.headline}

⚡ KEY MARKET THEMES:
${brief.takeaways.map((t) => `• ${t}`).join("\n")}

⚠️ DISCLAIMER:
Generated for educational and research purposes only. Not investment advice.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        navigator.clipboard.writeText(text);
        setCopiedBrief(true);
        addToast("Copied Executive Market Brief to clipboard!", "success");
        setTimeout(() => setCopiedBrief(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Sentiment Pulse & Market Flow
                        </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Multi-source global market feed, institutional sentiment scoring, and AI executive briefings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchNews}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-border/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Syncing Feed..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Sentiment Meter & Executive Briefing */}
            {newsData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Sentiment Barometer Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-card border border-border/50 space-y-4 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                                    <Flame className="w-3.5 h-3.5 text-accent" />
                                    Market Mood Barometer
                                </span>
                                <span
                                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                        newsData.executive_brief.risk_tone === "Risk-On"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : newsData.executive_brief.risk_tone === "Risk-Off"
                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}
                                >
                                    {newsData.executive_brief.risk_tone}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xl font-extrabold text-foreground font-['Montserrat']">
                                        {newsData.sentiment_stats.bullish_pct}%
                                        <span className="text-xs font-medium text-emerald-400 ml-1">Bullish</span>
                                    </span>
                                    <span className="text-sm font-bold text-muted-foreground font-mono">
                                        {newsData.sentiment_stats.bearish_pct}% Bearish
                                    </span>
                                </div>

                                {/* Tri-color bar */}
                                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex border border-border/30">
                                    <div
                                        style={{ width: `${newsData.sentiment_stats.bullish_pct}%` }}
                                        className="bg-emerald-400 h-full transition-all duration-1000"
                                        title={`Bullish: ${newsData.sentiment_stats.bullish_pct}%`}
                                    />
                                    <div
                                        style={{ width: `${newsData.sentiment_stats.neutral_pct}%` }}
                                        className="bg-white/20 h-full transition-all duration-1000"
                                        title={`Neutral: ${newsData.sentiment_stats.neutral_pct}%`}
                                    />
                                    <div
                                        style={{ width: `${newsData.sentiment_stats.bearish_pct}%` }}
                                        className="bg-red-400 h-full transition-all duration-1000"
                                        title={`Bearish: ${newsData.sentiment_stats.bearish_pct}%`}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Bullish ({newsData.sentiment_stats.bullish_pct}%)
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-white/30 inline-block" /> Neutral ({newsData.sentiment_stats.neutral_pct}%)
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Bearish ({newsData.sentiment_stats.bearish_pct}%)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/20">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">
                                Tactical Market Bias
                            </span>
                            <p className="text-xs font-bold text-foreground">
                                {newsData.executive_brief.market_bias}
                            </p>
                        </div>
                    </motion.div>

                    {/* AI Executive Morning Note Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-3.5 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-accent" />
                                    <span className="text-[10px] uppercase font-bold text-accent tracking-wider font-['Montserrat']">
                                        AI Executive Market Memo
                                    </span>
                                </div>
                                <button
                                    onClick={copyExecutiveBrief}
                                    className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-accent transition-colors"
                                >
                                    {copiedBrief ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied Memo</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy Memo</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <h4 className="text-sm font-extrabold text-foreground leading-snug mt-1 font-['Montserrat']">
                                "{newsData.executive_brief.headline}"
                            </h4>

                            <div className="space-y-2 mt-2.5">
                                {newsData.executive_brief.takeaways.map((point, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground/85 leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Synthesized across {newsData.sentiment_stats.total_analyzed} global financial headlines</span>
                            <span className="font-mono text-accent">PipTab Intelligence</span>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Filter Bar & Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                                selectedCategory === cat.id
                                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                    : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground hover:border-accent/30"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-64 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-border/50 text-xs text-foreground focus-within:border-accent/50 transition-all">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search headlines, USD, Gold, Fed..."
                        className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-xs"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* News Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: Math.min(i * 0.03, 0.3) }}
                            className="group rounded-2xl bg-card border border-border/40 p-5 hover:border-accent/40 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                        >
                            <div className="space-y-2.5">
                                {/* Top Meta Row */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-bold uppercase tracking-wider">
                                            {item.source}
                                        </span>
                                        {item.relatedAsset && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-foreground/80 font-mono font-semibold">
                                                {item.relatedAsset}
                                            </span>
                                        )}
                                        {item.impact === "High" && (
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase">
                                                High Impact
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(item.datetime * 1000))} ago
                                        </span>
                                        {item.sentiment && (
                                            <span
                                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    item.sentiment === "Bullish"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : item.sentiment === "Bearish"
                                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                        : "bg-white/5 text-muted-foreground border-border/40"
                                                }`}
                                            >
                                                {item.sentiment === "Bullish" ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : item.sentiment === "Bearish" ? (
                                                    <TrendingDown className="w-3 h-3" />
                                                ) : (
                                                    <Minus className="w-3 h-3" />
                                                )}
                                                {item.sentiment}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Headline & Summary */}
                                <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-accent transition-colors font-['Montserrat']">
                                    {item.headline}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {item.summary}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="pt-2 border-t border-border/20 flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                    Category: {item.category}
                                </span>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                                >
                                    Read Institutional Report <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredItems.length === 0 && !isLoading && (
                <div className="py-20 text-center bg-card border border-dashed border-border/30 rounded-2xl space-y-2">
                    <Globe className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                    <p className="text-sm font-bold text-foreground font-['Montserrat']">No headlines matching filter</p>
                    <p className="text-xs text-muted-foreground">Try clearing your search query or selecting "All Intelligence".</p>
                </div>
            )}

            {/* Regulatory Disclaimer */}
            <div className="p-4 rounded-2xl bg-white/[0.015] border border-border/30 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span>News & Sentiment Disclaimer</span>
                </div>
                <p className="text-[10px] text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
                    News analysis, sentiment metrics, and executive summaries are compiled automatically for research and educational purposes. Headlines do not constitute investment advice.
                </p>
            </div>
        </div>
    );
}
