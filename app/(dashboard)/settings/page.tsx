"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { User, Shield, Bell, Key, Save, Plus, X } from "lucide-react";

export default function SettingsPage() {
    const [rules, setRules] = useState([
        "Max 3 trades per day",
        "No trading during high-impact news",
        "Position size ≤ 2% of account",
        "No re-entry after stop loss",
        "Only trade during London/NY session",
    ]);
    const [newRule, setNewRule] = useState("");

    const addRule = () => {
        if (newRule.trim()) {
            setRules([...rules, newRule.trim()]);
            setNewRule("");
        }
    };

    const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[900px] mx-auto">
            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <User className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: "Display Name", value: "Trader", type: "text" },
                        { label: "Email", value: "trader@piptab.com", type: "email" },
                        { label: "Timezone", value: "GMT+1 (WAT)", type: "text" },
                        { label: "Base Currency", value: "USD", type: "text" },
                    ].map((field) => (
                        <div key={field.label}>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{field.label}</label>
                            <input
                                type={field.type}
                                defaultValue={field.value}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </motion.div>

            {/* Trading Rules */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Trading Rules</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">Define your personal rules. Violations will be tracked in Analytics.</p>
                <div className="space-y-2 mb-4">
                    {rules.map((rule, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-border/30 group">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">{i + 1}</span>
                                <span className="text-sm text-foreground">{rule}</span>
                            </div>
                            <button onClick={() => removeRule(i)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-400/10 text-red-400 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRule()}
                        placeholder="Add a new trading rule..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
                    />
                    <button onClick={addRule} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition-all border border-accent/20">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Notifications</h3>
                </div>
                <div className="space-y-3">
                    {[
                        { label: "Daily performance summary", desc: "Get a recap of your trading day", default: true },
                        { label: "Rule violation alerts", desc: "Notify when a trade breaks your rules", default: true },
                        { label: "Alpha Leakage warnings", desc: "Alert when leakage score exceeds threshold", default: true },
                        { label: "AI insight notifications", desc: "New pattern or recommendation detected", default: false },
                        { label: "Economic calendar reminders", desc: "Upcoming high-impact events", default: true },
                    ].map((n, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                            <div>
                                <p className="text-sm text-foreground">{n.label}</p>
                                <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked={n.default} className="sr-only peer" />
                                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-accent/60 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                            </label>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* API Keys */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">API Keys</h3>
                </div>
                <div className="space-y-3">
                    {[
                        { name: "Broker API", status: "Connected", key: "****-****-****-7a3f" },
                        { name: "News Provider", status: "Not Connected", key: "—" },
                        { name: "Market Data", status: "Connected", key: "****-****-****-9b2e" },
                    ].map((api, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-border/30">
                            <div>
                                <p className="text-sm text-foreground font-medium">{api.name}</p>
                                <p className="text-[11px] text-muted-foreground font-mono">{api.key}</p>
                            </div>
                            <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${api.status === "Connected" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                                {api.status}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
