"use client";

import { useAccounts } from "@/context/AccountContext";
import { ChevronDown, CreditCard, Layers, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AccountSelector() {
    const { accounts, activeAccount, setActiveAccountId, isLoading } = useAccounts();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) return <div className="h-10 w-32 bg-secondary/50 animate-pulse rounded-xl" />;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card border border-border/50 hover:border-accent/40 transition-all group"
            >
                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold leading-none mb-1">Trading Account</p>
                    <p className="text-sm font-bold text-foreground leading-none">{activeAccount ? activeAccount.name : "All Accounts"}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-card border border-border/50 rounded-2xl shadow-2xl z-[70] overflow-hidden p-1.5"
                    >
                        <button
                            onClick={() => { setActiveAccountId(null); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${!activeAccount ? "bg-accent/10 text-accent" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"}`}
                        >
                            <Layers className="w-4 h-4" />
                            <span className="text-sm font-semibold">All Accounts</span>
                        </button>

                        <div className="my-1.5 border-t border-border/30" />

                        {accounts.map((acc) => (
                            <button
                                key={acc.id}
                                onClick={() => { setActiveAccountId(acc.id); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${activeAccount?.id === acc.id ? "bg-accent/10 text-accent" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"}`}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-semibold">{acc.name}</span>
                                    <span className="text-[10px] opacity-70 uppercase tracking-wider font-bold">{acc.broker}</span>
                                </div>
                                {activeAccount?.id === acc.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                )}
                            </button>
                        ))}

                        <div className="my-1.5 border-t border-border/30" />
                        
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/settings?action=add-account");
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-left"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-semibold">Add New Account</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
