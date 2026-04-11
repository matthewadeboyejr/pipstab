"use client";

import { useAccounts, TradingAccount } from "@/context/AccountContext";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CreditCard, Loader2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { BROKERS } from "@/utils/brokers";
import { useSearchParams } from "next/navigation";

export default function AccountManager() {
    const { accounts, refreshAccounts, isLoading } = useAccounts();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const supabase = createClient();
    const searchParams = useSearchParams();

    // Check for add action in URL
    useEffect(() => {
        if (searchParams.get("action") === "add-account") {
            setIsAdding(true);
        }
    }, [searchParams]);

    // Form states
    const [name, setName] = useState("");
    const [broker, setBroker] = useState(BROKERS[1]); // Default to Exness
    const [initialBalance, setInitialBalance] = useState("0");
    const [accountNumber, setAccountNumber] = useState("");

    const resetForm = () => {
        setName("");
        setBroker(BROKERS[1]);
        setInitialBalance("0");
        setAccountNumber("");
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (acc: TradingAccount) => {
        setName(acc.name);
        setBroker(acc.broker);
        setInitialBalance(acc.initial_balance.toString());
        setAccountNumber(acc.account_number || "");
        setEditingId(acc.id);
        setIsAdding(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const payload = {
                user_id: user.id,
                name,
                broker,
                initial_balance: parseFloat(initialBalance),
                account_number: accountNumber || null,
            };

            let error;
            if (editingId) {
                const { error: err } = await supabase
                    .from("trading_accounts")
                    .update(payload)
                    .eq("id", editingId);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from("trading_accounts")
                    .insert([payload]);
                error = err;
            }

            if (error) throw error;

            addToast(editingId ? "Account updated!" : "Account created!", "success");
            await refreshAccounts();
            resetForm();
        } catch (error: any) {
            addToast(error.message || "Failed to save account", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will un-link all trades associated with this account. (Trades will not be deleted)")) return;
        
        try {
            const { error } = await supabase
                .from("trading_accounts")
                .delete()
                .eq("id", id);
            
            if (error) throw error;
            addToast("Account deleted", "success");
            refreshAccounts();
        } catch (error: any) {
            addToast(error.message || "Failed to delete account", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Trading Accounts</h3>
                    <p className="text-xs text-muted-foreground">Manage your different brokers and prop firm accounts.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-xs font-semibold text-accent hover:bg-accent/20 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Account
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-border/50 space-y-4"
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Account Name</label>
                                    <input 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Personal Live #1"
                                        className="w-full px-3 py-2 rounded-xl bg-secondary border border-border/50 text-sm focus:border-accent/50 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Broker</label>
                                    <select 
                                        value={broker}
                                        onChange={(e) => setBroker(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary border border-border/50 text-sm focus:border-accent/50 outline-none transition-colors appearance-none"
                                    >
                                        {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Account Number (Optional)</label>
                                    <input 
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="e.g. 1029384"
                                        className="w-full px-3 py-2 rounded-xl bg-secondary border border-border/50 text-sm focus:border-accent/50 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Starting Balance</label>
                                    <input 
                                        type="number"
                                        value={initialBalance}
                                        onChange={(e) => setInitialBalance(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-secondary border border-border/50 text-sm focus:border-accent/50 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    {editingId ? "Update Account" : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                        {accounts.map((acc) => (
                            <div 
                                key={acc.id}
                                className="group p-4 rounded-2xl bg-white/[0.02] border border-border/30 hover:border-accent/30 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">{acc.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground font-bold uppercase tracking-wider">{acc.broker}</span>
                                            {acc.account_number && <span className="text-[10px] text-muted-foreground italic">#{acc.account_number}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(acc)}
                                        className="p-2 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(acc.id)}
                                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {accounts.length === 0 && !isLoading && (
                            <div className="col-span-full py-8 text-center border-2 border-dashed border-border/30 rounded-2xl">
                                <p className="text-sm text-muted-foreground italic">No trading accounts yet. Create one to get started!</p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="col-span-full py-12 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-accent animate-spin" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
