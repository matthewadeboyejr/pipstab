"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Info, AlertTriangle, ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
};

export default function JournalAuditor() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "I am your AI Performance Auditor. I've analyzed your recent trades. I don't give praise for average work—I find the leaks in your edge. What do you want to address?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/audit", {
                method: "POST",
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) throw new Error("Auditor failed to respond");

            const data = await response.json();
            
            const assistMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistMsg]);
        } catch (error: any) {
            addToast(error.message || "Failed to contact auditor", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] rounded-2xl bg-card border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/30 bg-emerald-400/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center border border-emerald-400/20">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">Performance Auditor</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Strict & Brutally Honest</span>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded bg-red-400/10 border border-red-400/20">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-[9px] text-red-400 font-bold uppercase">No sugar-coating enabled</span>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth"
            >
                {messages.map((m) => (
                    <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[85%] flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                                m.role === "user" ? "bg-accent/10 border-accent/20" : "bg-card border-border/50"
                            }`}>
                                {m.role === "user" ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                                m.role === "user" 
                                    ? "bg-accent text-accent-foreground font-medium rounded-tr-none" 
                                    : "bg-white/[0.03] border border-border/50 text-foreground rounded-tl-none"
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-white/[0.03] border border-border/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-background border-t border-border/30">
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your performance leaks..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-secondary border border-border/50 text-sm focus:border-accent/40 outline-none transition-all placeholder:text-muted-foreground"
                    />
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-accent text-accent-foreground hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="mt-2 text-[10px] text-center text-muted-foreground italic flex items-center justify-center gap-2">
                    <Info className="w-3 h-3" />
                    Auditor analyzes history to identify psychological & technical lapses.
                </p>
            </form>
        </div>
    );
}
