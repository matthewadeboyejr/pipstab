"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookMarked, Plus, X, CheckCircle, Sparkles, Shield } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const DEFAULT_AXIOMS = [
    "A missed trade costs $0. An impulsive FOMO trade costs real capital.",
    "My edge is statistical over 100 trades, not emotional over the next 5 minutes.",
    "I do not move my stop-loss into wider territory once entered.",
    "After two consecutive losses in a session, I close my charts and step away.",
    "I accept that uncertainty is the prerequisite for profit. Every outcome is probabilistic.",
];

export default function TraderAxioms() {
    const [axioms, setAxioms] = useState<string[]>(DEFAULT_AXIOMS);
    const [newAxiom, setNewAxiom] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const saved = localStorage.getItem("piptab_trader_axioms");
        if (saved) {
            try {
                setAxioms(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    const saveAxioms = (list: string[]) => {
        setAxioms(list);
        localStorage.setItem("piptab_trader_axioms", JSON.stringify(list));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAxiom.trim()) return;

        const updated = [...axioms, newAxiom.trim()];
        saveAxioms(updated);
        setNewAxiom("");
        setIsAdding(false);
        addToast("Psychological axiom added!", "success");
    };

    const handleRemove = (index: number) => {
        const updated = axioms.filter((_, i) => i !== index);
        saveAxioms(updated);
        addToast("Axiom removed", "info");
    };

    return (
        <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-accent" />
                        Trader's Core Mental Axioms & Non-Negotiables
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Internalized psychological principles to review before placing any orders
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new Event("open-mindset-ritual"));
                            }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/30 text-xs font-bold text-accent hover:bg-accent/20 transition-all font-['Montserrat']"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Audio Ritual & Pledges
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Axiom
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <form onSubmit={handleAdd} className="flex gap-2 pt-1">
                    <input
                        type="text"
                        value={newAxiom}
                        onChange={(e) => setNewAxiom(e.target.value)}
                        placeholder="e.g. I trade my plan, not my PnL..."
                        className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-bold font-['Montserrat']"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-3 py-2 text-muted-foreground hover:text-foreground text-xs"
                    >
                        Cancel
                    </button>
                </form>
            )}

            {/* Axioms List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {axioms.map((ax, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative p-3.5 rounded-xl bg-white/[0.015] border border-border/30 hover:border-accent/30 transition-all flex items-start justify-between gap-3"
                    >
                        <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-lg bg-accent/10 text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                                #{i + 1}
                            </span>
                            <p className="text-xs text-foreground/90 leading-relaxed">{ax}</p>
                        </div>

                        <button
                            onClick={() => handleRemove(i)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-400 transition-all shrink-0"
                            title="Delete"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
