"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { User, Shield, Bell, Key, Save, Plus, X, Loader2, CreditCard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import BrokerImport from "@/components/dashboard/settings/BrokerImport";
import AccountManager from "@/components/dashboard/settings/AccountManager";

type NotificationPreferences = {
    daily_performance_summary: boolean;
    rule_violation_alerts: boolean;
    alpha_leakage_warnings: boolean;
    ai_insight_notifications: boolean;
    economic_calendar_reminders: boolean;
};

type ProfileData = {
    display_name: string;
    timezone: string;
    base_currency: string;
    trading_rules: string[];
    notification_preferences: NotificationPreferences;
};

const NOTIFICATION_LABELS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
    { key: "daily_performance_summary", label: "Daily performance summary", desc: "Get a recap of your trading day" },
    { key: "rule_violation_alerts", label: "Rule violation alerts", desc: "Notify when a trade breaks your rules" },
    { key: "alpha_leakage_warnings", label: "Alpha Leakage warnings", desc: "Alert when leakage score exceeds threshold" },
    { key: "ai_insight_notifications", label: "AI insight notifications", desc: "New pattern or recommendation detected" },
    { key: "economic_calendar_reminders", label: "Economic calendar reminders", desc: "Upcoming high-impact events" },
];

export default function SettingsPage() {
    const supabase = createClient();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingRules, setSavingRules] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    // Profile fields
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [timezone, setTimezone] = useState("GMT+1 (WAT)");
    const [baseCurrency, setBaseCurrency] = useState("USD");

    // Trading rules
    const [rules, setRules] = useState<string[]>([]);
    const [newRule, setNewRule] = useState("");

    // Notification preferences
    const [notifications, setNotifications] = useState<NotificationPreferences>({
        daily_performance_summary: true,
        rule_violation_alerts: true,
        alpha_leakage_warnings: true,
        ai_insight_notifications: false,
        economic_calendar_reminders: true,
    });

    // Fetch user data and profile on mount
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Set auth data
            setEmail(user.email || "");
            setPhone(user.user_metadata?.phone || "");

            // Fetch profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                setDisplayName(profile.display_name || "");
                setTimezone(profile.timezone || "GMT+1 (WAT)");
                setBaseCurrency(profile.base_currency || "USD");
                setRules(profile.trading_rules || []);
                setNotifications(profile.notification_preferences || {
                    daily_performance_summary: true,
                    rule_violation_alerts: true,
                    alpha_leakage_warnings: true,
                    ai_insight_notifications: false,
                    economic_calendar_reminders: true,
                });
            } else {
                // No profile yet — use auth metadata as fallback
                const firstName = user.user_metadata?.first_name || "";
                const lastName = user.user_metadata?.last_name || "";
                setDisplayName(`${firstName} ${lastName}`.trim());
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            addToast("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    }, [supabase, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Save Profile
    const saveProfile = async () => {
        setSavingProfile(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Update auth user metadata
            const nameParts = displayName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                },
            });

            if (authError) throw authError;

            // Upsert profile
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    display_name: displayName.trim(),
                    timezone,
                    base_currency: baseCurrency,
                }, { onConflict: "id" });

            if (profileError) throw profileError;

            addToast("Profile saved successfully", "success");
        } catch (err) {
            console.error("Error saving profile:", err);
            addToast("Failed to save profile", "error");
        } finally {
            setSavingProfile(false);
        }
    };

    // Save Trading Rules
    const saveRules = async () => {
        setSavingRules(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from("profiles")
                .update({ trading_rules: rules })
                .eq("id", user.id);

            if (error) throw error;
            addToast("Trading rules saved", "success");
        } catch (err) {
            console.error("Error saving rules:", err);
            addToast("Failed to save trading rules", "error");
        } finally {
            setSavingRules(false);
        }
    };

    // Save Notification Preferences
    const saveNotifications = async () => {
        setSavingNotifications(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from("profiles")
                .update({ notification_preferences: notifications })
                .eq("id", user.id);

            if (error) throw error;
            addToast("Notification preferences saved", "success");
        } catch (err) {
            console.error("Error saving notifications:", err);
            addToast("Failed to save notification preferences", "error");
        } finally {
            setSavingNotifications(false);
        }
    };

    // Trading rules handlers
    const addRule = () => {
        if (newRule.trim()) {
            setRules([...rules, newRule.trim()]);
            setNewRule("");
        }
    };

    const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));

    const toggleNotification = (key: keyof NotificationPreferences) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[900px] mx-auto">
            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <User className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-sm text-foreground/50 outline-none cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Phone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Timezone</label>
                        <input
                            type="text"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Base Currency</label>
                        <input
                            type="text"
                            value={baseCurrency}
                            onChange={(e) => setBaseCurrency(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </motion.div>

            {/* Trading Rules */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Trading Rules</h3>
                    </div>
                    <button
                        onClick={saveRules}
                        disabled={savingRules}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingRules ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        {savingRules ? "Saving..." : "Save Rules"}
                    </button>
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
                    {rules.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No trading rules yet. Add your first rule below.</p>
                    )}
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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Notifications</h3>
                    </div>
                    <button
                        onClick={saveNotifications}
                        disabled={savingNotifications}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingNotifications ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        {savingNotifications ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
                <div className="space-y-3">
                    {NOTIFICATION_LABELS.map((n) => (
                        <div key={n.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                            <div>
                                <p className="text-sm text-foreground">{n.label}</p>
                                <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications[n.key]}
                                    onChange={() => toggleNotification(n.key)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-accent/60 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                            </label>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Trading Accounts & Data Sync */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex flex-col gap-2 mb-8">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Trading Accounts & Data Sync</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Manage your broker accounts and sync your trading history.</p>
                </div>
                
                <div className="space-y-10">
                    <AccountManager />
                    
                    <div className="pt-6 border-t border-border/30">
                        <div className="flex items-center gap-2 mb-4">
                            <Key className="w-3.5 h-3.5 text-accent" />
                            <h4 className="text-xs font-bold text-foreground">Import History</h4>
                        </div>
                        <BrokerImport />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
