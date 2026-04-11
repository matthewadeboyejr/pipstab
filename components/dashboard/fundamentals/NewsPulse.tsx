"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Globe, RefreshCcw, ExternalLink, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type NewsItem = {
    id: number;
    category: string;
    datetime: number;
    headline: string;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
    sentiment?: "Bullish" | "Bearish" | "Neutral";
};

export default function NewsPulse() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/fundamentals/news");
            const data = await response.json();
            if (Array.isArray(data)) {
                setNews(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 300000); // Auto refresh every 5 mins
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Sentiment Pulse</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Real-time global market news and institutional flow context</p>
                </div>
                <button 
                    onClick={fetchNews}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                    <RefreshCcw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Syncing..." : "Refresh"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {news.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="group rounded-2xl bg-card border border-border/50 p-5 hover:border-accent/30 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent font-bold uppercase tracking-wider">{item.source}</span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(item.datetime * 1000))} ago
                                        </span>
                                    </div>
                                    {item.sentiment && (
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            item.sentiment === "Bullish" ? "bg-emerald-400/10 text-emerald-400" : 
                                            item.sentiment === "Bearish" ? "bg-red-400/10 text-red-400" : "bg-white/5 text-muted-foreground"
                                        }`}>
                                            {item.sentiment === "Bullish" ? <TrendingUp className="w-3 h-3" /> : item.sentiment === "Bearish" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                            {item.sentiment}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:text-accent transition-colors">{item.headline}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{item.summary}</p>
                            </div>

                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:underline mt-auto"
                            >
                                Read Report <ExternalLink className="w-3 h-3" />
                            </a>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {news.length === 0 && !isLoading && (
                <div className="py-20 text-center">
                    <Globe className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No news found. Check your API configuration.</p>
                </div>
            )}
        </div>
    );
}
